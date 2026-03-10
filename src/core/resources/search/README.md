# TokenSearch

Token/asset search across chains. Cache-first with dedicated IndexedDB store (excluded from main React Query persist; payloads are 1–3.5 MB each).

## Layout

| File | Role |
|------|------|
| `tokenSearchCache.ts` | IndexedDB store (`rainbow-token-search`), per-key read/write |
| `tokenSearchService.ts` | Cache + HTTP, no React. Used by RQ adapter and imperative callers |
| `tokenSearch.ts` | React Query adapter – hooks, queryFn, queryKey |
| `parseTokenSearch.ts` | Shared response parser (service + popularInRainbow) |

## API

**React Query** (subscription, dedup, loading): `useTokenSearch`, `useTokenSearchAllNetworks`, `fetchTokenSearch`, `tokenSearchQueryKey`/`tokenSearchQueryFunction` for `useQueries`.

**Service** (imperative): `searchTokenSearch`, `searchTokenSearchAllNetworks`.

## Consumers

- `useSearchCurrencyLists` – swap/send token picker (single + all networks)
- `useSearchableTokens` – CommandK token search
- `TokenDetails` – verified/unverified asset lookup
- `useFavoriteAssets` – direct `searchTokenSearch` (no RQ)
- `useVerifiedAssetsForSupportedChains` – `useQueries` with `tokenSearchQueryKey`/`tokenSearchQueryFunction`
