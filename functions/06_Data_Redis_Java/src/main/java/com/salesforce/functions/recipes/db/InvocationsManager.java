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
public class InvocationsManager {
  private final static long FIVE_MINUTES = 5 * 60;
  private final String url;

  public InvocationsManager(String url) {
    this.url = url;
  }

  /**
   * Add an invocation to the database.
   *
   * @param id The invocation ID.
   */
  public void addInvocation(String id) {
    try (Jedis jedis = getConnection()) {
      jedis.set("lastInvocationId", id, new SetParams().ex(FIVE_MINUTES));
      LocalDateTime now = LocalDateTime.now();
      DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
      String formattedDateTime = now.format(formatter);
      jedis.set("lastInvocationTime", formattedDateTime, new SetParams().ex(FIVE_MINUTES));

      jedis.lpush("invocations", id);

      long ttl = jedis.ttl("invocations");
      if (ttl < 0) {
        jedis.expire("invocations", FIVE_MINUTES);

      }
    }
  }

  /**
   * Get the last invocations from the database.
   *
   * @param limit The maximum number of invocations to return.
   * @return Invocations
   */
  public Invocations getInvocations(Integer limit) {
    try (Jedis jedis = getConnection()) {
      List<String> ids = jedis.lrange("invocations", 0, limit - 1);
      Invocations invocations = new Invocations();
      invocations.setInvocations(ids);

      String lastInvocationId = jedis.get("lastInvocationId");
      String lastInvocationTime = jedis.get("lastInvocationTime");

      invocations.setLastInvocationId(lastInvocationId);
      invocations.setLastInvocationTime(lastInvocationTime);
      return invocations;
    }
  }

  /**
   * Get a connection to the Redis database.
   *
   * @return Jedis
   */
  private Jedis getConnection() {
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

      return new Jedis(URI.create(this.url), sslContext.getSocketFactory(),
          sslContext.getDefaultSSLParameters(), bogusHostnameVerifier);

    } catch (NoSuchAlgorithmException | KeyManagementException e) {
      throw new RuntimeException(e);
    }
  }
}
