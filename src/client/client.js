import { createElement as h } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import * as api from "./api";

const app = h(App, {
  mountpath: window.mountpath,
  Router: BrowserRouter,
  api,
});

const container = document.querySelector(".app");

ReactDOM.render(app, container);
