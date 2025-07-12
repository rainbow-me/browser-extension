# Send Flow Validation Changes Summary

## Overview
This document summarizes the changes made to the Send flow validation system to replace the smart contract validation with a new `validateRecipient` function that prevents sending tokens to token contract addresses.

## Changes Made

### 1. Modified `useSendValidations` Hook
**File:** `src/entries/popup/hooks/send/useSendValidations.ts`

#### Key Changes:
- **Removed:** `toAddressIsSmartContract` state and smart contract checking logic
- **Added:** `validateRecipient` function with new validation logic
- **Added:** `recipientValidationError` state for error messages
- **Added:** `isValidRecipient` computed value
- **Added:** `userAssets` parameter to hook interface

#### New `validateRecipient` Function Logic:
```typescript
const validateRecipient = (
  toAddress: Address | undefined,
  asset: ParsedUserAsset | null,
  userAssets: ParsedUserAsset[]
): boolean => {
  if (!toAddress) return false;
  
  const recipientAddress = toAddress.toLowerCase();
  
  // Token being sent shares contract address with recipient
  if (asset && asset.address.toLowerCase() === recipientAddress) {
    return false;
  }
  
  // Token contract send prevention - check if recipient matches any token contract
  const isTokenContract = userAssets.some(
    userAsset => userAsset.address.toLowerCase() === recipientAddress
  );
  
  return !isTokenContract;
};
```

#### Validation Rules:
1. **Token to own contract:** Prevents sending a token to its own contract address
2. **Token to any contract:** Prevents sending to any address that matches a token contract in userAssets
3. **Case insensitive:** All address comparisons are done in lowercase
4. **Null safety:** Handles undefined/null addresses and assets gracefully

### 2. Updated Send Component
**File:** `src/entries/popup/pages/send/index.tsx`

#### Key Changes:
- **Updated:** `useSendValidations` call to include `userAssets: unhiddenAssets`
- **Removed:** `toAddressIsSmartContract` reference
- **Added:** `isValidRecipient` and `recipientValidationError` from hook
- **Removed:** Smart contract explainer useEffect logic
- **Removed:** `toEnsName?.includes('argent.xyz')` check completely

#### Before:
```typescript
const {
  buttonLabel,
  isValidToAddress,
  readyForReview,
  validateToAddress,
  toAddressIsSmartContract,
} = useSendValidations({
  asset,
  assetAmount,
  nft,
  selectedGas,
  toAddress,
  toAddressOrName,
});

// Smart contract explainer logic
const prevToAddressIsSmartContract = usePrevious(toAddressIsSmartContract);
useEffect(() => {
  if (
    !prevToAddressIsSmartContract &&
    toAddressIsSmartContract &&
    !toEnsName?.includes('argent.xyz')
  ) {
    showToContractExplainer();
  }
}, [
  prevToAddressIsSmartContract,
  showToContractExplainer,
  toAddressIsSmartContract,
  toEnsName,
]);
```

#### After:
```typescript
const {
  buttonLabel,
  isValidToAddress,
  readyForReview,
  validateToAddress,
  isValidRecipient,
  recipientValidationError,
} = useSendValidations({
  asset,
  assetAmount,
  nft,
  selectedGas,
  toAddress,
  toAddressOrName,
  userAssets: unhiddenAssets,
});

// Removed smart contract explainer logic - now handled in useSendValidations
```

### 3. Added Translation Keys
**File:** `static/json/languages/en_US.json`

#### New Translation Keys:
```json
"send": {
  "validation": {
    "sending_to_token_contract": "You cannot send %{tokenName} to its own contract address",
    "sending_to_token_contract_generic": "You cannot send tokens to a token contract address"
  }
}
```

## Validation Scenarios Covered

### 1. Token to Own Contract
- **Scenario:** User tries to send TEST token to the TEST token contract address
- **Result:** Validation fails with message "You cannot send TEST to its own contract address"

### 2. Token to Any Contract
- **Scenario:** User tries to send TEST token to USDC contract address
- **Result:** Validation fails with message "You cannot send tokens to a token contract address"

### 3. Valid Recipient
- **Scenario:** User tries to send TEST token to a regular wallet address
- **Result:** Validation passes

### 4. Case Insensitive
- **Scenario:** User enters token contract address in different case
- **Result:** Validation still catches it and fails appropriately

### 5. Edge Cases
- **Null/undefined addresses:** Handled gracefully
- **Empty userAssets array:** Validation passes for regular addresses
- **Null asset:** Validation passes for regular addresses

## Benefits of New Approach

1. **More Specific:** Targets actual problematic scenarios rather than all smart contracts
2. **Better UX:** Provides clear error messages about why validation failed
3. **No False Positives:** Doesn't block legitimate smart contract interactions
4. **Removed Argent Exception:** No special casing for specific ENS domains
5. **Immediate Feedback:** Validation happens in real-time, not requiring explainer sheets

## Implementation Details

### Hook Interface Changes:
- **Added:** `userAssets?: ParsedUserAsset[]` parameter
- **Added:** `isValidRecipient: boolean` return value
- **Added:** `recipientValidationError: string | null` return value
- **Removed:** `toAddressIsSmartContract: boolean` return value

### Validation Integration:
- Validation errors are shown directly in the send button label
- `readyForReview` now includes `isValidRecipient` check
- Error messages are localized and context-specific

## Testing Considerations

The new validation logic should be tested for:
1. Token to own contract address (should fail)
2. Token to other token contract addresses (should fail)
3. Token to regular wallet addresses (should pass)
4. Case insensitive address matching
5. Null/undefined handling
6. Empty userAssets array handling

## Future Enhancements

1. **Performance:** Could cache userAssets address lookup for better performance
2. **Whitelist:** Could add allowlist for specific smart contracts that should be allowed
3. **Enhanced Messages:** Could provide more specific error messages based on the type of token contract
4. **Network Specific:** Could have different validation rules per network if needed

---

## Files Modified

1. `src/entries/popup/hooks/send/useSendValidations.ts` - Main validation logic
2. `src/entries/popup/pages/send/index.tsx` - Integration with Send component
3. `static/json/languages/en_US.json` - Translation keys

## Summary

The changes successfully remove the generic smart contract validation and replace it with specific token contract validation that prevents users from sending tokens to token contract addresses, which is the primary use case that needs to be prevented. The new system provides better user experience with clear error messages and removes the "Hold your horses" explainer sheet in favor of immediate validation feedback.