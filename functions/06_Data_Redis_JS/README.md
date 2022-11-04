# redisjs Function

Connects to a Redis instance and perform the following operations:

1. Stores the last invocation ID in Redis
2. Stores the last invocation time in Redis
3. Adds the invocation ID to a list in Redis
4. Returns the list of invocation IDs from Redis

## Local Development

1. Export your Heroku Data for Redis configuration

Make sure you have the `REDIS_URL` connection string in the `.env` file of this folder. For using this recipe on a Compute Environment please refer to the [Heroku Data in Functions documentation](https://developer.salesforce.com/docs/platform/functions/guide/heroku-data.html).

```
heroku config -a <app_name> --shell > .env
```

2. Install dependencies with

```
npm install
```

3. Run tests with

```
npm test
```

4. Start your function locally

```
sf run function start --verbose
```

5. Invoke your function locally

```
sf run function --function-url=http://localhost:8080 --payload='{}'
```
