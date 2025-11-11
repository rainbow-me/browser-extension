import { useEffect, useMemo, useRef, useState } from 'react';

import { LocalStorage, SessionStorage } from '~/core/storage';
import { UserStatusResult, getUserStatus } from '~/core/utils/userStatus';

// Storage keys that affect user status
const storageKeys = [
  { storage: LocalStorage, key: 'vault' },
  { storage: SessionStorage, key: 'hasKeychains' },
  { storage: SessionStorage, key: 'encryptionKey' },
  { storage: SessionStorage, key: 'salt' },
] as const;

/**
 * Hook that subscribes to user status changes by watching underlying storage keys.
 * Status is computed from keychain state stored in LocalStorage (vault) and
 * SessionStorage (encryptionKey, salt, hasKeychains).
 *
 * @returns Object containing:
 *   - status: Current user status, automatically updates when underlying storage changes
 *   - isLoading: Boolean indicating if initial status is still loading
 */
export const useAuth = () => {
  const [status, setStatus] = useState<UserStatusResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribesRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    const updateStatus = async () => {
      const newStatus = await getUserStatus();
      setStatus(newStatus);
      setIsLoading(false);
    };

    void updateStatus();

    // Set up listeners for all storage keys
    // Use a ref to ensure cleanup always has access to unsubscribe functions
    let isMounted = true;
    Promise.all(
      storageKeys.map(({ storage, key }) =>
        storage.listen(key, () => {
          void updateStatus();
        }),
      ),
    ).then((unsubs) => {
      if (isMounted) {
        unsubscribesRef.current = unsubs;
      } else {
        // Component unmounted before Promise.all resolved, clean up immediately
        unsubs.forEach((unsubscribe) => unsubscribe());
      }
    });

    return () => {
      isMounted = false;
      // Clean up all listeners
      unsubscribesRef.current.forEach((unsubscribe) => unsubscribe());
      unsubscribesRef.current = [];
    };
  }, []);

  return useMemo(() => ({ status, isLoading }), [status, isLoading]);
};

// Re-export type for convenience
export type { UserStatusResult };
