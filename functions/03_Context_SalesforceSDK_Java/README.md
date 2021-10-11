# salesforcesdkjava Function

Receives a payload containing account details, and creates the record. It then uses a SOQL query to return the newly created Account.

## Local Development

1. Run tests with

```
./mvnw test
```

2. Start your function locally

```
sf run function start --verbose
```

3. Invoke your function locally with a valid Payload

```
sf run function --function-url=http://localhost:8080 --payload=@data/sample-payload.json
```

4. Invoke your function locally with an Invalid Payload

```
sf run function --function-url=http://localhost:8080 --payload=@data/sample-invalid-payload.json
```
