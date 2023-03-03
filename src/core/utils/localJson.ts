export async function fetchJsonLocally(filename: string) {
  const req = await fetch(chrome.runtime.getURL(`json/${filename}`));
  const json = await req.json();
  return json;
}
