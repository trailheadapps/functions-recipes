package com.salesforce.functions.recipes.db;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import com.salesforce.functions.recipes.Invocation;
import com.salesforce.functions.recipes.Invocations;

/**
 * This class manages the invocations stored in a PostgreSQL database.
 */
public class InvocationsManager implements AutoCloseable {
  // Database queries
  private final String CREATE_INVOCATIONS_TABLE =
      "CREATE TABLE IF NOT EXISTS invocations (id VARCHAR(255) PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)";
  private final String INSERT_INVOCATION = "INSERT INTO invocations (id) VALUES (?)";
  private final String SELECT_INVOCATIONS =
      "SELECT id, created_at FROM invocations ORDER BY created_at DESC LIMIT ?";

  private final String url;
  private Connection connection;

  public InvocationsManager(String url) throws SQLException {
    this.url = url;
    this.connection = getConnection();
  }

  /**
   * Add an invocation to the database.
   *
   * @param id
   * @throws SQLException
   */
  public void addInvocation(String id) throws SQLException {
    try (PreparedStatement stmt = connection.prepareStatement(INSERT_INVOCATION);) {
      stmt.setString(1, id);
      stmt.executeUpdate();
    }
  }

  /**
   * Get the last invocations from the database.
   *
   * @param limit The maximum number of invocations to return.
   * @return Invocations
   * @throws SQLException
   */
  public Invocations getInvocations(int limit) throws SQLException {
    try (PreparedStatement stmt = connection.prepareStatement(SELECT_INVOCATIONS);) {
      stmt.setInt(1, limit);
      List<Invocation> invocations = new ArrayList<>();

      try (ResultSet rs = stmt.executeQuery()) {
        while (rs.next()) {
          Invocation inv = new Invocation(rs.getString("id"), rs.getTimestamp("created_at"));
          invocations.add(inv);
        }
      }
      return new Invocations(invocations);
    }
  }

  /**
   * Get a connection to the database.
   *
   * @return Connection
   * @throws SQLException
   */
  protected Connection getConnection() throws SQLException {
    // If there is already a connection reuse it
    if (connection != null && !connection.isClosed()) {
      return connection;
    }

    try {
      Class.forName("org.postgresql.Driver");
      URI dbUri = new URI(this.url);

      // Extract username and password from DATABASE_URL
      String username = dbUri.getUserInfo().split(":")[0];
      String password = dbUri.getUserInfo().split(":")[1];

      // Construct a valid JDBC URL
      String dbUrl =
          "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath();

      // Connect to PostgreSQL instance
      connection = DriverManager.getConnection(dbUrl, username, password);

      // Create a invocations table if it doesn't exist
      // Note: It is recommended to create this table outside the function execution
      // using a provision script or a migration tool. This is just for demo purposes.
      connection.createStatement().execute(CREATE_INVOCATIONS_TABLE);

      return connection;
    } catch (URISyntaxException | ClassNotFoundException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public void close() throws Exception {
    if (connection != null && !connection.isClosed()) {
      connection.close();
    }
  }
}
