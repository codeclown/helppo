import { createElement as h } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import api from "./api";
import urls from "./urls";

const app = h(App, {
  mountpath: window.mountpath,
  Router: BrowserRouter,
  api: api(window.mountpath),
  urls: urls(window.mountpath),
});

const container = document.querySelector(".app");

ReactDOM.render(app, container);
