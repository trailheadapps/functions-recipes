# environmentjs Function

Returns the derivate password hash using `pbkdf2` getting the salt from the Environment.

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
sf run function start -e PASSWORD_SALT="make this a random passphrase" --verbose
```

4. Invoke your function locally

```
sf run function --function-url=http://localhost:8080 --payload='{"password":"test"}'
```
