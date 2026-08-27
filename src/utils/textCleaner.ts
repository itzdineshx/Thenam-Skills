/**
 * Cleans and strips raw markdown symbols, asterisks, hashtags, and formatting artifacts
 * from text content so it displays as clean, readable text.
 */
export const cleanPostContent = (text?: string): string => {
  if (!text) return '';
  return text
    // 1. Remove bold/italic asterisks: **text** -> text, *text* -> text
    .replace(/\*{1,3}([^*]+?)\*{1,3}/g, '$1')
    // Remove leftover stray asterisks
    .replace(/\*+/g, '')
    // 2. Remove markdown headers: ### Header -> Header, ## Header -> Header
    .replace(/^#{1,6}\s+/gm, '')
    // 3. Remove markdown strikethrough: ~~text~~ -> text
    .replace(/~~([^~]+?)~~/g, '$1')
    // 4. Remove markdown backticks: `code` -> code, ```code``` -> code
    .replace(/`{1,3}([^`]+?)`{1,3}/g, '$1')
    .replace(/`+/g, '')
    // 5. Remove markdown blockquotes: > quote -> quote
    .replace(/^>\s+/gm, '')
    // 6. Remove markdown bullet points like * or - at start of line
    .replace(/^[\*\-]\s+/gm, '• ')
    // 7. Remove markdown links: [text](url) -> text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    // 8. Remove invisible zero-width chars and weird control symbols
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // 9. Normalize multiple spaces
    .replace(/[ \t]+/g, ' ')
    .trim();
};
