import { Button } from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

export const PointsReferralSheet = () => {
  const navigate = useRainbowNavigate();

  const backToHome = () =>
    navigate(ROUTES.HOME, {
      state: { skipTransitionOnRoute: ROUTES.HOME },
    });

  const navigateToOnboarding = () => navigate(ROUTES.POINTS_ONBOARDING);

  return (
    <BottomSheet zIndex={zIndexes.ACTIVITY_DETAILS} show>
      <Button
        onClick={backToHome}
        color="accent"
        height="36px"
        variant="raised"
      >
        {'Go back'}
      </Button>
      <Button
        onClick={navigateToOnboarding}
        color="accent"
        height="36px"
        variant="raised"
      >
        {'Go to onboarding'}
      </Button>
    </BottomSheet>
  );
};
