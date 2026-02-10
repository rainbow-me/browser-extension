# BPP Credentials

This document covers the [PlasmoHQ/bpp](https://github.com/PlasmoHQ/bpp) (Browser Platform Publisher) credentials used in our GitHub Actions publish workflows. Each secret is a JSON string stored in **Settings > Secrets and variables > Actions**.

---

## `BPP_KEYS_PROD` — Chrome Web Store (Prod)

**Used in:** [`publish-prod-chrome.yml`](workflows/publish-prod-chrome.yml)

```json
{
  "chrome": {
    "extId": "EXTENSION_ID",
    "clientId": "OAUTH_CLIENT_ID",
    "clientSecret": "OAUTH_CLIENT_SECRET",
    "refreshToken": "OAUTH_REFRESH_TOKEN"
  }
}
```

| Field | Description |
|-------|-------------|
| `extId` | Extension ID from `chrome.google.com/webstore/detail/EXT_ID` |
| `clientId` | Google Cloud OAuth 2.0 client ID |
| `clientSecret` | Google Cloud OAuth 2.0 client secret |
| `refreshToken` | OAuth refresh token for the Chrome Web Store API |

### How to regenerate

1. Go to [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services** > **Credentials**
2. Select the OAuth 2.0 client used for Chrome Web Store publishing
3. To rotate the secret: delete the existing client and create a new one, or reset the client secret
4. Generate a new `refreshToken` using the updated credentials by following the [Chrome Web Store API guide](https://developer.chrome.com/docs/webstore/using-api/)
5. Update the `BPP_KEYS_PROD` secret with the new values

---

## `BPP_KEYS_INTERNAL` — Chrome Web Store (Internal)

**Used in:** [`publish-internal.yml`](workflows/publish-internal.yml)

```json
{
  "chrome": {
    "extId": "EXTENSION_ID",
    "clientId": "OAUTH_CLIENT_ID",
    "clientSecret": "OAUTH_CLIENT_SECRET",
    "refreshToken": "OAUTH_REFRESH_TOKEN"
  }
}
```

Same format as `BPP_KEYS_PROD` above, but points to the **internal/testing** Chrome Web Store listing (different `extId`).

### How to regenerate

Same steps as `BPP_KEYS_PROD`. The OAuth credentials may be shared or separate depending on your setup — check which Google Cloud project owns the internal listing.

---

## `BPP_KEYS_PROD_FIREFOX` — Firefox Add-ons (Prod)

**Used in:** [`publish-prod-firefox.yml`](workflows/publish-prod-firefox.yml)

```json
{
  "firefox": {
    "apiKey": "JWT_ISSUER",
    "apiSecret": "JWT_SECRET",
    "extId": "EXTENSION_ID"
  }
}
```

| Field | Description |
|-------|-------------|
| `apiKey` | JWT issuer credential |
| `apiSecret` | JWT secret credential |
| `extId` | Extension UUID or slug from the Add-ons Developer Hub |

### How to regenerate

1. Go to [Firefox Add-on Developer Hub — API Keys](https://addons.mozilla.org/en-US/developers/addon/api/key/)
2. Click **Generate new credentials** to create a new JWT issuer/secret pair
3. Update the `BPP_KEYS_PROD_FIREFOX` secret with the new `apiKey` and `apiSecret`

---

## `BPP_KEYS_PROD_EDGE` — Edge Add-ons (Prod)

**Used in:** [`publish-prod-edge.yml`](workflows/publish-prod-edge.yml)

```json
{
  "edge": {
    "clientId": "CLIENT_ID",
    "apiKey": "API_KEY",
    "productId": "PRODUCT_ID"
  }
}
```

| Field | Description |
|-------|-------------|
| `clientId` | Client ID from the Edge Publish API page |
| `apiKey` | API key from the Edge Publish API page |
| `productId` | Product ID from the Edge Partner Center dashboard |

### How to regenerate

1. Go to [Edge Partner Center — Publish API](https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi)
2. The page displays your **Client ID** (fixed) and **API Key** (can be regenerated)
3. Click the regenerate button to create a new API key — copy it immediately
4. The `productId` can be found in the Partner Center dashboard URL: `partner.microsoft.com/en-us/dashboard/microsoftedge/{productId}/package/dashboard`
5. Update the `BPP_KEYS_PROD_EDGE` secret with the new values
