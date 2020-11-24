const QUERY_TEXTAREA_HEIGHT = "helppo.query_textarea_height";

function get(key: string) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (exception) {
    return null;
  }
}
function set(key: string, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (exception) {
    // do nothing
  }
}

export default class UserDefaults {
  getQueryTextareaHeight(): number {
    return get(QUERY_TEXTAREA_HEIGHT);
  }

  setQueryTextareaHeight(value: number): void {
    return set(QUERY_TEXTAREA_HEIGHT, value);
  }
}
