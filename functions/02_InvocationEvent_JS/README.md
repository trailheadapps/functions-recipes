# invocationeventjs Function

Detects a payload type and returns information about it

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
sfdx run:function:start --verbose
```

4. Invoke your function locally

With JSON payload

```
sfdx run:function --url=http://localhost:8080 --payload='{"type":"json", "value": "Hello Functions"}'
```
