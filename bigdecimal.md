# BigDecimal Usage Audit

All remaining `BigNumber.js` usage in the codebase. These handle **decimal/real-number arithmetic** and **cannot use `bigint`** (which only supports integers). A BigDecimal alternative (e.g. `decimal.js`, `ox` Decimal utilities, or fixed-point arithmetic) would be needed to replace these.

## 1. `src/core/utils/numbers.ts` — Decimal arithmetic core

All remaining functions in this file work with decimal strings (e.g. `"1.5"`, `"0.00042"`, `"1234.56"`):

| Function | What it does | Decimal values involved |
|---|---|---|
| `add(a, b)` | Decimal addition | Fiat balances (e.g. `"1234.56"` USD) |
| `minus(a, b)` | Decimal subtraction | Asset amounts, fiat amounts |
| `multiply(a, b)` | Decimal multiplication | `amount * priceUnit` for fiat conversion |
| `divide(a, b)` | Decimal division | Exchange rates, price impact ratios |
| `lessThan(a, b)` | Decimal comparison | Gwei values, fiat amounts, balance amounts |
| `toFixedDecimals(v, d)` | Round to N decimal places | Gwei display, amount formatting |
| `convertAmountFromNativeValue(v, price, d)` | `value / priceUnit` with rounding | Fiat → asset amount conversion |
| `handleSignificantDecimals(v, d, buf)` | Smart decimal formatting | All display amounts |
| `handleSignificantDecimalsWithThreshold(v, d, t)` | Format with `< threshold` | Native currency display |
| `handleSignificantDecimalsAsNumber(v, d)` | Truncate to N significant decimals | Swap native amounts |
| `convertAmountToNativeAmount(a, p)` | `amount * priceUnit` | Asset amount → fiat amount |
| `convertAmountAndPriceToNativeDisplay(a, p, c)` | multiply + format for display | Fiat balance display |
| `convertAmountAndPriceToNativeDisplayWithThreshold(a, p, c)` | multiply + threshold format | Gas fee display |
| `convertRawAmountToNativeDisplay(raw, dec, price, c)` | formatUnits + price display | Token amount in fiat |
| `convertRawAmountToBalance(v, asset)` | formatUnits + balance formatting | Token balance display |
| `convertAmountToBalanceDisplay(v, asset)` | Format + symbol suffix | `"1,234.56 ETH"` |
| `convertAmountToPercentageDisplay(v)` | Format + `%` suffix | `"2.50%"` price change |
| `convertAmountToNativeDisplay(v, c)` | Format + currency symbol | `"$1,234.56"` |
| `toBN(value)` | Internal: convert to BigNumber | All of the above |

## 2. `src/entries/popup/hooks/swap/useSwapInputs.ts`

```
new BigNumber(selectedGas?.gasFee?.amount.toString()).times(1.3).toFixed(0)
```
- **Value**: gas fee (wei) as bigint, multiplied by `1.3` (decimal multiplier)
- **Why decimal**: The `1.3` buffer is a fractional multiplier applied to an integer
- **Could use**: `applyFactor(amount, 1.3)` pattern (already exists in `gas.ts`) using `bigint` arithmetic: `(value * 1300n) / 1000n`

## 3. `src/core/utils/assets.ts`

```
new BigNumber(platformValue).isNaN()
new BigNumber(platformValue).isZero()
const platform = new BigNumber(cappedAmount || '0');
const calculated = new BigNumber(calculatedAmount || '0');
const difference = platform.minus(calculated).abs();
const ratio = difference.dividedBy(calculated.abs());
```
- **Values**: `cappedAmount` and `calculatedAmount` are fiat dollar amounts (e.g. `"1234.56"`)
- **Why decimal**: Comparing fiat amounts with fractional cents
- **Operations**: subtraction, abs, division (producing a ratio like `0.05`)

## 4. Caller files using decimal functions from `numbers.ts`

### Price impact & exchange rates (swap)
- `src/entries/popup/hooks/swap/useSwapPriceImpact.tsx` — `minus(nativeAmountA, nativeAmountB)` and `divide(diff, total)` on fiat amounts
- `src/entries/popup/hooks/swap/useSwapReviewDetails.ts` — `divide(sellAmount, buyAmount)` for exchange rates, `multiply(feePercentage, 100)` for percentage display
- `src/entries/popup/pages/swap/SwapTokenInput/TokenInfo/TokenToBuyInfo.tsx` — `divide(minus(a,b), b)` for price difference ratio

### Balance calculations (send)
- `src/entries/popup/hooks/send/useSendInputs.ts` — `lessThan(gasFee, balance)`, `minus(balance, gasFee)`, `multiply(gasFee, 1)`, `toFixedDecimals(...)`, `convertAmountFromNativeValue(...)` — all on decimal asset/fiat amounts

### Gas display (custom gas)
- `src/entries/popup/components/TransactionFee/CustomGasSheet.tsx` — `lessThan(maxBaseFee, currentBaseFee)` and `toFixedDecimals(gwei, 0)` — comparing/formatting **gwei strings** (e.g. `"23.5"`)

### Balance aggregation
- `src/entries/popup/hooks/useUserAssetsBalance.ts` — `add(totalBalance, assetBalance)` on fiat amounts
- `src/core/resources/_selectors/assets.ts` — `add(acc, nativeBalance)` summing fiat balances

### Sorting
- `src/entries/popup/components/ImportWallet/ImportWalletSelectionEdit.tsx` — `minus(balanceA, balanceB)` for sorting wallets by fiat balance

## Summary

| Domain | Decimal type | Example values | Count |
|---|---|---|---|
| Fiat amounts (USD, EUR) | Currency | `"1234.56"`, `"0.01"` | ~15 sites |
| Exchange rates | Ratio | `"0.000342"`, `"1845.23"` | ~4 sites |
| Price impact | Percentage | `"0.05"`, `"-2.3"` | ~3 sites |
| Gwei values | Gas unit | `"23.5"`, `"0.001"` | ~5 sites |
| Asset balances (display) | Token amount | `"1.234567890123456789"` | ~8 sites |
| Buffer multipliers | Factor | `1.3` | 1 site |

**Total**: ~36 sites across 12 files that require decimal arithmetic.

The buffer multiplier case (item 2) can be migrated to bigint using the existing `applyFactor` pattern. All other cases genuinely require decimal/real-number support.
