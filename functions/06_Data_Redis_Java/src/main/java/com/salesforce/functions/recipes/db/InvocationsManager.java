package com.salesforce.functions.recipes.db;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import com.salesforce.functions.recipes.Invocations;
import java.net.URI;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.params.SetParams;

/**
 * This class manages the invocations stored in a Redis database.
 */
public class InvocationsManager implements AutoCloseable {
  private final static long FIVE_MINUTES = 5 * 60;
  private final String url;
  private Jedis connection;

  public InvocationsManager(String url) {
    this.url = url;
    this.connection = getConnection();
  }

  /**
   * Add an invocation to the database.
   *
   * @param id The invocation ID.
   */
  public void addInvocation(String id) {
    connection.set("lastInvocationId", id, new SetParams().ex(FIVE_MINUTES));
    LocalDateTime now = LocalDateTime.now();
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    String formattedDateTime = now.format(formatter);
    connection.set("lastInvocationTime", formattedDateTime, new SetParams().ex(FIVE_MINUTES));

    connection.lpush("invocations", id);

    long ttl = connection.ttl("invocations");
    if (ttl < 0) {
      connection.expire("invocations", FIVE_MINUTES);

    }
  }

  /**
   * Get the last invocations from the database.
   *
   * @param limit The maximum number of invocations to return.
   * @return Invocations
   */
  public Invocations getInvocations(Integer limit) {
    List<String> ids = connection.lrange("invocations", 0, limit - 1);
    Invocations invocations = new Invocations();
    invocations.setInvocations(ids);

    String lastInvocationId = connection.get("lastInvocationId");
    String lastInvocationTime = connection.get("lastInvocationTime");

    invocations.setLastInvocationId(lastInvocationId);
    invocations.setLastInvocationTime(lastInvocationTime);
    return invocations;
  }

  /**
   * Get a connection to the Redis database.
   *
   * @return Jedis
   */
  protected Jedis getConnection() {
    if (connection != null && connection.isConnected()) {
      return connection;
    }

    try {
      TrustManager bogusTrustManager = new X509TrustManager() {
        public X509Certificate[] getAcceptedIssuers() {
          return null;
        }

        public void checkClientTrusted(X509Certificate[] certs, String authType) {}

        public void checkServerTrusted(X509Certificate[] certs, String authType) {}
      };

      SSLContext sslContext = SSLContext.getInstance("SSL");
      sslContext.init(null, new TrustManager[] {bogusTrustManager},
          new java.security.SecureRandom());

      HostnameVerifier bogusHostnameVerifier = (hostname, session) -> true;

      connection = new Jedis(URI.create(this.url), sslContext.getSocketFactory(),
          sslContext.getDefaultSSLParameters(), bogusHostnameVerifier);
      return connection;
    } catch (NoSuchAlgorithmException | KeyManagementException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public void close() {
    if (connection != null && connection.isConnected()) {
      connection.close();
    }
  }
}
