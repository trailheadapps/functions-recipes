# Bulkapijs Function

Fetches an external CSV file and uses the Salesforce Bulk API v2.0 to ingest it.

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
sf run function --function-url=http://localhost:8080 --payload={}
```

5. Check results by running

```
sfdx force:org:open -p "/lightning/setup/AsyncApiJobStatus/home"
```
