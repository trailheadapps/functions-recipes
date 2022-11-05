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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.params.SetParams;

public class InvocationsManager {
  private final static long FIVE_MINUTES = 5 * 60;
  private final String url;

  public InvocationsManager(String url) {
    this.url = url;
  }

  public void addInvocation(String id) {
    Jedis jedis = getConnection();

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

  public Invocations getInvocations(Integer limit) {
    Jedis jedis = getConnection();
    List<String> ids = jedis.lrange("invocations", 0, limit - 1);
    Invocations invocations = new Invocations();
    invocations.setInvocations(ids);

    String lastInvocationId = jedis.get("lastInvocationId");
    String lastInvocationTime = jedis.get("lastInvocationTime");

    invocations.setLastInvocationId(lastInvocationId);
    invocations.setLastInvocationTime(lastInvocationTime);
    return invocations;
  }

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
