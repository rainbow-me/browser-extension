import { useCallback, useEffect, useState } from 'react';
import { unstable_useBlocker as useBlocker } from 'react-router-dom';

export const useNavigationBlocker = ({
  onProceed,
}: {
  onProceed?: () => void;
}) => {
  const [shouldBlock, setShouldBlock] = useState(false);
  const [shouldProceed, setShouldProceed] = useState(false);
  const blocker = useBlocker(shouldBlock);

  const blockNavigation = () => setShouldBlock(true);

  const unblockNavigation = useCallback(() => {
    setShouldBlock(false);
    blocker?.reset?.();
  }, [blocker]);

  const proceedNavigation = useCallback(() => {
    unblockNavigation();
    setShouldProceed(true);
  }, [unblockNavigation]);

  useEffect(() => {
    if (shouldProceed) {
      onProceed?.();
    }
  }, [onProceed, shouldProceed]);

  return { proceedNavigation, blockNavigation, unblockNavigation };
};
