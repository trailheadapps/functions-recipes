# salesforcesdkjs Function

Receives a payload containing account details, and creates the record. It then uses a SOQL query to return the newly created Account.

## Local Development

1. Install dependencies with

```
npm install
```

2. Run tests with

```
npm test
```

3. Start your function locally

```
sf run function start --verbose
```

4. Invoke your function locally with a valid payload

```
sf run function --function-url=http://localhost:8080 --payload=@data/sample-payload.json
```

5. Invoke your function locally with an invalid payload

```
sf run function --function-url=http://localhost:8080 --payload=@data/sample-invalid-payload.json
```
