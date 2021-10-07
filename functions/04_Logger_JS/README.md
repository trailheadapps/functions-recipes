# loggerjs Function

Generates an amount of log messages every number of seconds.

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

4. Invoke your function locally

```
sf run function --function-url=http://localhost:8080 --payload='{ "amount":10, "timeout":15 }'
```
