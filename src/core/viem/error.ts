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
