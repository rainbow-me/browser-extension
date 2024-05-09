const theme = localStorage.getItem('theme');
if (theme === 'dark') {
  // The user prefers a dark color scheme
  document.documentElement.classList.add('dt');
} else {
  // The user prefers a light color scheme or no preference
  document.documentElement.classList.add('lt');
}
