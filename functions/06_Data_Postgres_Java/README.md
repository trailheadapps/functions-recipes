# postgresjava Function

Connects to a PostgreSQL instance and perform two operations:

1. Insert a new row into the "invocations" table with an invocation ID
2. Query the "invocations" table for all the invocation IDs

## Local Development

1. Export your Heroku Postgres configuration

Make sure you have the `DATABASE_URL` connection string in the `.env` file of this folder. For using this recipe on a Compute Environment please refer to the [Heroku Data in Functions documentation](https://developer.salesforce.com/docs/platform/functions/guide/heroku-data.html).

```
heroku config -a <app_name> --shell > .env
source .env
```

2. Run tests with

```
./mvnw test
```

3. Start your function locally

```
sf run function start --verbose
```

4. Invoke your function locally

```
sf run function --function-url=http://localhost:8080 --payload='{"limit": 5}'
```
