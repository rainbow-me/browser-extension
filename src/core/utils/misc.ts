export function random() {
  const min = 1;
  const max = 1000000;
  return Math.floor(Math.random() * (max - min) + min);
}
