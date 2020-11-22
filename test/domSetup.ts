import { within, BoundFunctions, queries } from "@testing-library/dom";
import jsdomGlobal from "jsdom-global";

let cleanup: () => void = null;

// https://github.com/testing-library/dom-testing-library/issues/831
export type Screen = BoundFunctions<typeof queries>;
export function useDom(): Screen {
  if (cleanup) {
    cleanup();
  }
  cleanup = jsdomGlobal();
  return within(document.body);
}

export function doneWithDom(): void {
  if (cleanup) {
    cleanup();
  }
}
