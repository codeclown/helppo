const QUERY_TEXTAREA_HEIGHT = "helppo.query_textarea_height";

export default function userDefaults() {
  function get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (exception) {
      return null;
    }
  }
  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (exception) {
      // do nothing
    }
  }

  return {
    getQueryTextareaHeight() {
      return get(QUERY_TEXTAREA_HEIGHT);
    },

    setQueryTextareaHeight(value) {
      return set(QUERY_TEXTAREA_HEIGHT, value);
    },
  };
}
