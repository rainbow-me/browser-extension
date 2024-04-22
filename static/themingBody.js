const localTheme = localStorage.getItem('theme');
// theme is deined in theming.js as a variable that gets the value of the theme from localStorage
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
if (darkModeMediaQuery.matches) {
  // The user prefers a dark color scheme
  if (localTheme === 'dark') {
    document.body.classList.add('lt-dc', 'dt-dc');
  } else {
    document.body?.classList.add('lt-lc', 'dt-lc');
  }
} else {
  // The user prefers a light color scheme or no preference
  if (localTheme === 'dark') {
    document.body?.classList.add('lt-dc', 'dt-lc');
  } else {
    document.body?.classList.add('lt-lc', 'lt-lc');
  }
}
