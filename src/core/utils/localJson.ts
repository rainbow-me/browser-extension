export async function fetchJsonLocally(filename: string) {
  try {
    const req = await fetch(chrome.runtime.getURL(`json/${filename}`));
    const json = await req.json();
    return json;
  } catch (e) {
    return {};
  }
}
