import { useAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { useFavoritesStore } from '~/core/state/favorites';

export function useFavoriteAssets() {
  const { favorites, addFavorite, removeFavorite } = useFavoritesStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: favoritesData } = useAssets({
    assetAddresses: favorites,
    currency,
  });
  return {
    favorites: favoritesData,
    addFavorite,
    removeFavorite,
  };
}
