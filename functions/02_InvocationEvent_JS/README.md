# invocationeventjs Function

Receives a payload and returns information about it.

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

4. Invoke your function locally with a JSON payload

```
sf run function --url=http://localhost:8080 --payload='{"type":"json", "value": "Hello Functions"}'
```
