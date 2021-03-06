import { createElement as h, ReactElement } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import Api from "./Api";
import App from "./App";
import Images from "./Images";
import Urls from "./Urls";
import UserDefaults from "./UserDefaults";

declare global {
  interface Window {
    mountpath: string;
  }
}

const Router = ({ children }): ReactElement => h(BrowserRouter, null, children);

const app = h(App, {
  Router,
  api: new Api(window.mountpath),
  urls: new Urls(window.mountpath),
  images: new Images(window.mountpath),
  userDefaults: new UserDefaults(),
});

const container = document.querySelector(".app");

ReactDOM.render(app, container);
