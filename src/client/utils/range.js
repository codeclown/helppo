export default function range(start, end) {
  return [...Array(end - start + 1).keys()].map((i) => start + i);
}
