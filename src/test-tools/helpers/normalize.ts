export default function normalize(text: string | undefined): string {
  return String(text).replace(/\s+/g, ' ').trim();
}
