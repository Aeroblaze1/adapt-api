# Production Load Tests

These `k6` scripts are for exercising the deployed gateway without hardcoding secrets in git.

Create a local `load-tests-prod-check/.env` file with values like:

```env
TARGET_URL=https://adapt-gateway.onrender.com
API_KEY=your_real_key
API_PATH=/api/test
```

Run examples:

```powershell
k6 run -e TARGET_URL=https://adapt-gateway.onrender.com -e API_KEY=your_real_key load-tests-prod-check/basic.js
```

```powershell
k6 run -e TARGET_URL=https://adapt-gateway.onrender.com -e API_KEY=your_real_key load-tests-prod-check/controlled.js
```


