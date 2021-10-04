# processlargedatajava Function

This function takes a large JSON payload, calculates the distance between a supplied cordinate and the data, sorts it, and returns the nearest x results.

## Local Development

1. Run tests with

```
./mvnw test
```

2. Start your function locally

```
sf run function start --verbose
```

3. Invoke your function locally

```
sf run function --function-url=http://localhost:8080 --payload=@data/sample-payload
```
