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

public class InvocationsManager {
  private final String NEW_LINE = System.getProperty("line.separator");
  private final String CREATE_INVOCATIONS_TABLE = String.join(NEW_LINE,
      "CREATE TABLE IF NOT EXISTS invocations (", "id VARCHAR(255) PRIMARY KEY,",
      "created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP", ")");
  private final String INSERT_INVOCATION = "INSERT INTO invocations (id) VALUES (?)";
  private final String SELECT_INVOCATIONS =
      "SELECT id, created_at FROM invocations ORDER BY created_at DESC LIMIT ?";

  private final String url;

  public InvocationsManager(String url) {
    this.url = url;
  }

  public void addInvocation(String id) throws SQLException {
    Connection connection = getConnection();
    PreparedStatement stmt = connection.prepareStatement(INSERT_INVOCATION);
    stmt.setString(1, id);
    stmt.executeUpdate();
  }

  public Invocations getInvocations(int limit) throws SQLException {
    Connection connection = getConnection();

    // Select Invocations from the database
    PreparedStatement stmt = connection.prepareStatement(SELECT_INVOCATIONS);
    stmt.setInt(1, limit);
    List<Invocation> invocations = new ArrayList<>();

    try (ResultSet rs = stmt.executeQuery()) {
      while (rs.next()) {
        Invocation inv = new Invocation(rs.getString("id"), rs.getDate("created_at"));
        invocations.add(inv);
      }
    }
    return new Invocations(invocations);
  }

  public Connection getConnection() throws SQLException {
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
      Connection connection = DriverManager.getConnection(dbUrl, username, password);

      // Try to create table
      connection.createStatement().execute(CREATE_INVOCATIONS_TABLE);

      return connection;
    } catch (URISyntaxException | ClassNotFoundException e) {
      throw new RuntimeException(e);
    }
  }
}
