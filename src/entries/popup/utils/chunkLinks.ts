export default function chunkLinks(text: string) {
  const linkPattern = /<a href="(.*?)".*?>(.*?)<\/a>/g;
  const chunks = [];
  let lastIndex = 0;

  let match;
  while ((match = linkPattern.exec(text)) !== null) {
    // The text between the last link and the current link
    if (match.index > lastIndex) {
      chunks.push({
        type: 'text',
        value: text.substring(lastIndex, match.index),
      });
    }

    // The current link
    chunks.push({
      type: 'link',
      href: match[1],
      value: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  // The text after the last link, if any
  if (lastIndex < text.length) {
    chunks.push({
      type: 'text',
      value: text.substring(lastIndex),
    });
  }

  return chunks;
}
