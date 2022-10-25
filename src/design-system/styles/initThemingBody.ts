import { themeClasses } from './theme';

export function initThemingBody() {
  // Set the initial color contexts to match their respective themes
  document.body.classList.add(
    themeClasses.lightTheme.lightContext,
    themeClasses.darkTheme.darkContext,
  );
}
