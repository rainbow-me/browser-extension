const MAX_CAUSE_DEPTH = 10;

const CHAIN_NOT_FOUND_MESSAGE_RE = /^Chain \d+ not found$/;

function getCause(error: unknown): unknown {
  if (error === null || typeof error !== 'object' || !('cause' in error)) {
    return undefined;
  }
  return Reflect.get(error, 'cause');
}

/** Walk `error` and each `cause` (up to {@link MAX_CAUSE_DEPTH}), first match wins. */
function walkErrorCause(
  error: unknown,
  predicate: (node: unknown) => boolean,
): boolean {
  let current: unknown = error;
  let depth = 0;

  while (current != null && depth < MAX_CAUSE_DEPTH) {
    if (predicate(current)) {
      return true;
    }
    current = getCause(current);
    depth += 1;
  }

  return false;
}

/**
 * True when the failure is because the wallet has no RPC config for this chain
 * (see `getViemClient` → `Chain ${chainId} not found`), including when wrapped
 * by `getProvider` as `Failed to create provider` with a `cause` chain.
 */
export function isChainNotConfiguredError(error: unknown): boolean {
  return walkErrorCause(
    error,
    (node) =>
      node instanceof Error && CHAIN_NOT_FOUND_MESSAGE_RE.test(node.message),
  );
}

/**
 * True when `error` or a nested `cause` is a **transient** ethers v5
 * `NETWORK_ERROR` from `@ethersproject/providers` (e.g. JsonRpcProvider
 * `_uncachedDetectNetwork` with `event: "noNetwork"` when the RPC does not
 * respond to `eth_chainId` / `net_version`).
 *
 * Not all `NETWORK_ERROR`s are transient: the same code is used for
 * `event: "changed"` (chain mismatch vs expected network), `invalidNetwork`,
 * `blockSkew`, etc. Those should surface so misconfiguration is visible in
 * Sentry rather than being treated as a flaky RPC.
 */
export function isTransientEthersNetworkError(error: unknown): boolean {
  return walkErrorCause(error, (node) => {
    if (node === null || typeof node !== 'object') {
      return false;
    }
    if (!('code' in node)) {
      return false;
    }
    const code = Reflect.get(node, 'code');
    if (code !== 'NETWORK_ERROR') {
      return false;
    }
    const event = 'event' in node ? Reflect.get(node, 'event') : undefined;
    return event === 'noNetwork';
  });
}
