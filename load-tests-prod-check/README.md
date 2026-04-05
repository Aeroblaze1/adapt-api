# Production Load Tests

These `k6` scripts are for exercising the deployed gateway without hardcoding secrets in git.

Create a local `load-tests-prod-check/.env` file with values like:

```env
TARGET_URL=https://your-gateway-url
API_KEY=your_real_key
API_KEYS=key_one,key_two,key_three
API_PATH=/api/test
```

This local `.env` file is ignored by git. Keep real API keys there and leave placeholders in `.env.example`.

## Available scripts

- `basic.js`
  Runs a single request to confirm the deployed gateway is reachable and accepts the API key.

- `controlled.js`
  Runs a stepped load profile to observe adaptive enforcement behavior over time.

- `burst.js`
  Sends a short, high-intensity burst at the deployed gateway to stress rate and burst handling.

- `multi.js`
  Rotates across multiple API keys to test per-key isolation and multi-tenant behavior.

## Running on Windows

This repo already includes the steps to download the `k6` binary at `tools/k6/k6.exe`.

From the repo root, first load the local env file into the current PowerShell session:

```powershell
Get-Content .\load-tests-prod-check\.env | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  $name, $value = $_ -split '=', 2
  [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), 'Process')
}
```

You can verify the values are loaded:

```powershell
echo $env:TARGET_URL
echo $env:API_KEY
echo $env:API_KEYS
echo $env:API_PATH
```

Run the basic smoke test:

```powershell
.\tools\k6\k6.exe run .\load-tests-prod-check\basic.js
```

Run the controlled load test:

```powershell
.\tools\k6\k6.exe run .\load-tests-prod-check\controlled.js
```

Run the burst test:

```powershell
.\tools\k6\k6.exe run .\load-tests-prod-check\burst.js
```

Run the multi-key test:

```powershell
.\tools\k6\k6.exe run .\load-tests-prod-check\multi.js
```


## Expected behavior

- `basic.js` should return a `200` or `429`
- `controlled.js` should show a mix of successful requests and enforcement under heavier load
- `burst.js` should create a sharper spike and is more likely to trigger aggressive enforcement
- `multi.js` should distribute traffic across the provided keys 
