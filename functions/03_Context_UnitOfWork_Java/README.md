# unitofworkjava Function

Receives a payload containing Account, Contact, and Case details and uses the Unit of Work pattern to assign the corresponding values to to its Record while maintaining the relationships. It then commits the unit of work and returns the Record Id's for each object.

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
