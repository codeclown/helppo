export default function limitText(text: string, characters: number): string {
  return `${text.slice(0, characters)}${text.length > characters ? "…" : ""}`;
}
