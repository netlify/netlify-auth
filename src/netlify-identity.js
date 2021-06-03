import { h, render } from "preact";
import { observe } from "mobx";
import { Provider } from "mobx-preact";
import GoTrue from "gotrue-js";
import App from "./components/app";
import store from "./state/store";
import Controls from "./components/controls";
import modalCSS from "./components/modal.css";

const callbacks = {};
function trigger(callback) {
  const cbMap = callbacks[callback] || new Set();
  Array.from(cbMap.values()).forEach((cb) => {
    cb.apply(cb, Array.prototype.slice.call(arguments, 1));
  });
}

const validActions = {
  login: true,
  signup: true,
  error: true
};

const netlifyIdentity = {
  on: (event, cb) => {
    callbacks[event] = callbacks[event] || new Set();
    callbacks[event].add(cb);
  },
  off: (event, cb) => {
    if (callbacks[event]) {
      if (cb) {
        callbacks[event].delete(cb);
      } else {
        callbacks[event].clear();
      }
    }
  },
  open: (action) => {
    action = action || "login";
    if (!validActions[action]) {
      throw new Error(`Invalid action for open: ${action}`);
    }
    store.openModal(store.user ? "user" : action);
  },
  close: () => {
    store.closeModal();
  },
  currentUser: () => {
    return store.gotrue && store.gotrue.currentUser();
  },
  logout: () => {
    return store.logout();
  },
  get gotrue() {
    if (!store.gotrue) {
      store.openModal("login");
    }
    return store.gotrue;
  },
  refresh(force) {
    if (!store.gotrue) {
      store.openModal("login");
    }
    return store.gotrue.currentUser().jwt(force);
  },
  init: (options) => {
    init(options);
  },
  setLocale: (locale) => {
    if (locale) {
      store.locale = locale;
    }
  },
  store
};

const localHosts = {
  localhost: true,
  "127.0.0.1": true,
  "0.0.0.0": true
};

function instantiateGotrue(APIUrl) {
  const isLocal = localHosts[document.location.hostname];
  if (APIUrl) {
    return new GoTrue({ APIUrl, setCookie: !isLocal });
  }
  if (isLocal) {
    store.setIsLocal(isLocal);
    const siteURL = localStorage.getItem("netlifySiteURL");
    if (siteURL) {
      // setting a siteURL will invoke instantiateGotrue again with the relevant APIUrl
      store.setSiteURL(siteURL);
    }
    return null;
  }

  return new GoTrue({ setCookie: !isLocal });
}

let root;
let shadow;

observe(store.modal, "isOpen", () => {
  if (!store.settings) {
    store.loadSettings();
  }
  if (store.modal.isOpen) {
    trigger("open", store.modal.page);
  } else {
    trigger("close");
  }
});

observe(store, "siteURL", () => {
  if (store.siteURL === null || store.siteURL === undefined) {
    localStorage.removeItem("netlifySiteURL");
  } else {
    localStorage.setItem("netlifySiteURL", store.siteURL);
  }

  let apiUrl;
  if (store.siteURL) {
    const siteUrl = store.siteURL.replace(/\/$/, "");
    apiUrl = `${siteUrl}/.netlify/identity`;
  }
  store.init(instantiateGotrue(apiUrl), true);
});

observe(store, "user", () => {
  if (store.user) {
    trigger("login", store.user);
  } else {
    trigger("logout");
  }
});

observe(store, "gotrue", () => {
  store.gotrue && trigger("init", store.gotrue.currentUser());
});

observe(store, "error", () => {
  trigger("error", store.error);
});

const routes = /(confirmation|invite|recovery|email_change)_token=([^&]+)/;
const errorRoute = /error=access_denied&error_description=403/;
const accessTokenRoute = /access_token=/;

function runRoutes() {
  const hash = (document.location.hash || "").replace(/^#\/?/, "");
  if (!hash) {
    return;
  }

  const m = hash.match(routes);
  if (m) {
    store.verifyToken(m[1], m[2]);
    document.location.hash = "";
  }

  const em = hash.match(errorRoute);
  if (em) {
    store.openModal("signup");
    document.location.hash = "";
  }

  const am = hash.match(accessTokenRoute);
  if (am) {
    const params = {};
    hash.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      params[key] = value;
    });
    if (!!document && params["access_token"]) {
      document.cookie = `nf_jwt=${params["access_token"]}`;
    }
    if (params["state"]) {
      try {
        // skip initialization for implicit auth
        const state = decodeURIComponent(params["state"]);
        const { auth_type } = JSON.parse(state);
        if (auth_type === "implicit") {
          return;
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }
    document.location.hash = "";
    store.openModal("login");
    store.completeExternalLogin(params);
  }
}

function init(options = {}) {
  const { APIUrl, logo = true, namePlaceholder, locale } = options;

  if (locale) {
    store.locale = locale;
  }

  const controlEls = document.querySelectorAll(
    "[data-netlify-identity-menu],[data-netlify-identity-button]"
  );
  Array.prototype.slice.call(controlEls).forEach((el) => {
    let controls = null;
    const mode =
      el.getAttribute("data-netlify-identity-menu") === null
        ? "button"
        : "menu";
    render(
      <Provider store={store}>
        <Controls mode={mode} text={el.innerText.trim()} />
      </Provider>,
      el,
      controls
    );
  });

  store.init(instantiateGotrue(APIUrl));
  store.modal.logo = logo;
  store.setNamePlaceholder(namePlaceholder);

  const wrapper = document.createElement("div");

  root = render(
    <Provider store={store}>
      <App />
    </Provider>,
    wrapper,
    root
  );
  runRoutes();

  const container = options.container
    ? document.querySelector(options.container)
    : document.body;
  const shadowRoot = document.createElement("div");
  container.appendChild(shadowRoot);
  shadow = shadowRoot.attachShadow({ mode: "open" });

  const styles = document.createElement("style");
  styles.textContent = modalCSS.toString();
  shadow.appendChild(styles);
  shadow.appendChild(wrapper);
}

export default netlifyIdentity;
