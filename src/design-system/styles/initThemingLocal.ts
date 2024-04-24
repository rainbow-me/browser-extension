import { currentThemeStore } from '~/core/state/currentSettings/currentTheme';

export function initThemingLocal() {
  const localTheme = localStorage.getItem('theme');
  if (!localTheme) {
    const currentTheme = currentThemeStore.getState().currentTheme;
    localStorage.setItem('theme', currentTheme);
  }
}
