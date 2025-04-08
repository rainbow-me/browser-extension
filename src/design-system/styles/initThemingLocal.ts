import { useCurrentThemeStore } from '~/core/state';

export function initThemingLocal() {
  const localTheme = localStorage.getItem('theme');
  if (!localTheme) {
    const currentTheme = useCurrentThemeStore.getState().currentTheme;
    localStorage.setItem('theme', currentTheme);
  }
}
