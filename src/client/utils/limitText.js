export default function limitText(string, characters) {
  return `${string.slice(0, characters)}${
    string.length > characters ? "…" : ""
  }`;
}
