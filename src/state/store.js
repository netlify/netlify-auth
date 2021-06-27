import { observable, action } from "mobx";
import { defaultLocale, getTranslation } from "../translations";

const store = observable({
  user: null,
  recovered_user: null,
  message: null,
  settings: null,
  gotrue: null,
  error: null,
  siteURL: null,
  remember: true,
  saving: false,
  invite_token: null,
  email_change_token: null,
  namePlaceholder: null,
  modal: {
    page: "login",
    isOpen: false,
    logo: true
  },
  locale: defaultLocale
});

store.setNamePlaceholder = action(function setNamePlaceholder(namePlaceholder) {
  store.namePlaceholder = namePlaceholder;
});

store.startAction = action(function startAction() {
  store.saving = true;
  store.error = null;
  store.message = null;
});

store.setError = action(function setError(err) {
  store.saving = false;
  store.error = err;
});

store.init = action(function init(gotrue, reloadSettings) {
  if (gotrue) {
    store.gotrue = gotrue;
    store.user = gotrue.currentUser();
    if (store.user) {
      store.modal.page = "user";
    }
  }
  if (reloadSettings) {
    store.loadSettings();
  }
});

store.loadSettings = action(function loadSettings() {
  if (store.settings) {
    return;
  }
  if (!store.gotrue) {
    return;
  }

  store.gotrue
    .settings()
    .then(action((settings) => (store.settings = settings)))
    .catch(
      action((err) => {
        store.error = new Error(
          `Failed to load settings from ${store.gotrue.api.apiURL}`
        );
      })
    );
});

store.setIsLocal = action(function setIsLocal(isLocal) {
  store.isLocal = isLocal;
});

store.setSiteURL = action(function setSiteURL(url) {
  store.siteURL = url;
});

store.clearSiteURL = action(function clearSiteURL() {
  store.gotrue = null;
  store.siteURL = null;
  store.settings = null;
});

store.login = action(function login(email, password) {
  store.startAction();
  return store.gotrue
    .login(email, password, store.remember)
    .then(
      action((user) => {
        store.user = user;
        store.modal.page = "user";
        store.invite_token = null;
        if (store.email_change_token) {
          store.doEmailChange();
        }
        store.saving = false;
      })
    )
    .catch(store.setError);
});

store.externalLogin = action(function externalLogin(provider) {
  // store.startAction();
  store.error = null;
  store.message = null;
  const url = store.invite_token
    ? store.gotrue.acceptInviteExternalUrl(provider, store.invite_token)
    : store.gotrue.loginExternalUrl(provider);
  window.location.href = url;
});

store.completeExternalLogin = action(function completeExternalLogin(params) {
  store.startAction();
  store.gotrue
    .createUser(params, store.remember)
    .then((user) => {
      store.user = user;
      store.modal.page = "user";
      store.saving = false;
    })
    .catch(store.setError);
});

store.signup = action(function signup(name, email, password) {
  store.startAction();
  return store.gotrue
    .signup(email, password, { full_name: name })
    .then(
      action(() => {
        if (store.settings.autoconfirm) {
          store.login(email, password, store.remember);
        } else {
          store.message = "confirm";
        }
        store.saving = false;
      })
    )
    .catch(store.setError);
});

store.logout = action(function logout() {
  if (store.user) {
    store.startAction();
    return store.user
      .logout()
      .then(
        action(() => {
          store.user = null;
          store.modal.page = "login";
          store.saving = false;
        })
      )
      .catch(store.setError);
  } else {
    store.modal.page = "login";
    store.saving = false;
  }
});

store.updatePassword = action(function updatePassword(password) {
  store.startAction();
  const user = store.recovered_user || store.user;
  user
    .update({ password })
    .then((user) => {
      store.user = user;
      store.recovered_user = null;
      store.message = "password_changed";
      store.saving = false;
    })
    .catch(store.setError);
});

store.acceptInvite = action(function acceptInvite(password) {
  store.startAction();
  store.gotrue
    .acceptInvite(store.invite_token, password, store.remember)
    .then((user) => {
      store.saving = false;
      store.invite_token = null;
      store.user = user;
      store.modal.page = "user";
    })
    .catch(store.setError);
});

store.doEmailChange = action(function doEmailChange() {
  store.startAction();
  return store.user
    .update({ email_change_token: store.email_change_token })
    .then(
      action((user) => {
        store.user = user;
        store.email_change_token = null;
        store.message = "email_changed";
        store.saving = false;
      })
    )
    .catch(store.setError);
});

store.verifyToken = action(function verifyToken(type, token) {
  const gotrue = store.gotrue;
  store.modal.isOpen = true;

  switch (type) {
    case "confirmation":
      store.startAction();
      store.modal.page = "signup";
      gotrue
        .confirm(token, store.remember)
        .then(
          action((user) => {
            store.user = user;
            store.saving = false;
          })
        )
        .catch(
          action((err) => {
            console.error(err);
            store.message = "verfication_error";
            store.modal.page = "signup";
            store.saving = false;
          })
        );
      break;
    case "email_change":
      store.email_change_token = token;
      store.modal.page = "message";
      if (store.user) {
        store.doEmailChange();
      } else {
        store.modal.page = "login";
      }
      break;
    case "invite":
      store.modal.page = type;
      store.invite_token = token;
      break;
    case "recovery":
      store.startAction();
      store.modal.page = type;
      store.gotrue
        .recover(token, store.remember)
        .then((user) => {
          store.saving = false;
          store.recovered_user = user;
        })
        .catch((err) => {
          store.saving = false;
          store.error = err;
          store.modal.page = "login";
        });
      break;
    default:
      store.error = "Unknown token type";
  }
});

store.requestPasswordRecovery = action(function requestPasswordRecovery(email) {
  store.startAction();
  store.gotrue
    .requestPasswordRecovery(email)
    .then(
      action(() => {
        store.message = "password_mail";
        store.saving = false;
      })
    )
    .catch(store.setError);
});

store.openModal = action(function open(page) {
  store.modal.page = page;
  store.modal.isOpen = true;
});

store.closeModal = action(function close() {
  store.modal.isOpen = false;
  store.error = null;
  store.message = null;
  store.saving = false;
});

store.translate = action(function translate(key) {
  return getTranslation(key, store.locale);
});

export default store;
