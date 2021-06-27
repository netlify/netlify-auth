jest.mock("./components/modal.css", () => "");
jest.mock("gotrue-js", () => {
  const mock = jest.fn().mockImplementation(({ APIUrl, setCookie }) => {
    return {
      settings: jest.fn().mockResolvedValue({
        external: {
          bitbucket: false,
          github: false,
          gitlab: false,
          google: false,
          facebook: false,
          email: true,
          saml: false
        },
        external_labels: {},
        disable_signup: false,
        autoconfirm: false
      }),
      currentUser: jest.fn(),
      APIUrl,
      setCookie
    };
  });
  return mock;
});

describe("netlifyIdentity", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe("on", () => {
    it("should invoke login callback when user is set to an object", () => {
      const { default: store } = require("./state/store");
      const { default: netlifyIdentity } = require("./netlify-identity");

      const loginCallback = jest.fn();
      netlifyIdentity.on("login", loginCallback);

      store.user = {
        name: "user"
      };

      expect(loginCallback).toHaveBeenCalledTimes(1);
      expect(loginCallback).toHaveBeenCalledWith({ name: "user" });
    });

    it("should invoke logout callback when user is set to null", () => {
      const { default: store } = require("./state/store");
      store.user = {
        name: "user"
      };

      const { default: netlifyIdentity } = require("./netlify-identity");

      const logoutCallback = jest.fn();
      netlifyIdentity.on("logout", logoutCallback);

      store.user = null;

      expect(logoutCallback).toHaveBeenCalledTimes(1);
    });

    it("should not invoke login callback when user is set to null", () => {
      const { default: store } = require("./state/store");
      store.user = {
        name: "user"
      };

      const { default: netlifyIdentity } = require("./netlify-identity");

      const loginCallback = jest.fn();
      netlifyIdentity.on("login", loginCallback);

      store.user = null;

      expect(loginCallback).toHaveBeenCalledTimes(0);
    });

    it("should not invoke logout callback when user is set to an object", () => {
      const { default: store } = require("./state/store");
      store.user = null;

      const { default: netlifyIdentity } = require("./netlify-identity");

      const loginCallback = jest.fn();
      netlifyIdentity.on("logout", loginCallback);

      store.user = {
        name: "user"
      };

      expect(loginCallback).toHaveBeenCalledTimes(0);
    });
  });

  describe("off", () => {
    it("should not throw when an unregistered callback is removed", () => {
      const { default: netlifyIdentity } = require("./netlify-identity");

      expect(() => netlifyIdentity.off("login", () => undefined)).not.toThrow();
    });

    it("should remove all callbacks when called with only first argument", () => {
      const { default: store } = require("./state/store");
      const { default: netlifyIdentity } = require("./netlify-identity");

      const loginCallback1 = jest.fn();
      const loginCallback2 = jest.fn();

      netlifyIdentity.on("login", loginCallback1);
      netlifyIdentity.on("login", loginCallback2);

      store.user = {
        name: "user"
      };

      expect(loginCallback1).toHaveBeenCalledTimes(1);
      expect(loginCallback2).toHaveBeenCalledTimes(1);

      loginCallback1.mockClear();
      loginCallback2.mockClear();

      netlifyIdentity.off("login");

      store.user = {
        name: "other user"
      };

      expect(loginCallback1).toHaveBeenCalledTimes(0);
      expect(loginCallback2).toHaveBeenCalledTimes(0);
    });

    it("should remove a specific callback when called with two arguments", () => {
      const { default: store } = require("./state/store");
      const { default: netlifyIdentity } = require("./netlify-identity");

      const loginCallback1 = jest.fn();
      const loginCallback2 = jest.fn();

      netlifyIdentity.on("login", loginCallback1);
      netlifyIdentity.on("login", loginCallback2);

      store.user = {
        name: "user"
      };

      expect(loginCallback1).toHaveBeenCalledTimes(1);
      expect(loginCallback2).toHaveBeenCalledTimes(1);

      loginCallback1.mockClear();
      loginCallback2.mockClear();

      netlifyIdentity.off("login", loginCallback1);

      store.user = {
        name: "other user"
      };

      expect(loginCallback1).toHaveBeenCalledTimes(0);
      expect(loginCallback2).toHaveBeenCalledTimes(1);
    });
  });

  describe("init", () => {
    it("should only invoke init event once when on localhost and netlifySiteURL is set", () => {
      window.location = { hostname: "localhost" };
      localStorage.setItem("netlifySiteURL", "https://my-site.netlify.app/");

      const { default: store } = require("./state/store");
      const { default: netlifyIdentity } = require("./netlify-identity");

      const initCallback = jest.fn();
      netlifyIdentity.on("init", initCallback);

      netlifyIdentity.init();

      expect(initCallback).toHaveBeenCalledTimes(1);
      expect(store.siteURL).toEqual("https://my-site.netlify.app/");
      expect(store.gotrue.APIUrl).toEqual(
        "https://my-site.netlify.app/.netlify/identity"
      );
      expect(store.gotrue.setCookie).toEqual(false);
    });
  });

  describe("open", () => {
    it("should invoke open event when called with no arguments", () => {
      const { default: store } = require("./state/store");
      const { default: netlifyIdentity } = require("./netlify-identity");
      store.openModal = jest.fn();

      netlifyIdentity.open();

      expect(store.openModal).toHaveBeenCalledTimes(1);
      expect(store.openModal).toHaveBeenCalledWith("login");
    });
  });

  it("should invoke open event when called with a valid argument", () => {
    const { default: store } = require("./state/store");
    const { default: netlifyIdentity } = require("./netlify-identity");
    store.openModal = jest.fn();

    netlifyIdentity.open("signup");

    expect(store.openModal).toHaveBeenCalledTimes(1);
    expect(store.openModal).toHaveBeenCalledWith("signup");
  });

  it("should invoke open event with user if store.user exists", () => {
    const { default: store } = require("./state/store");
    const { default: netlifyIdentity } = require("./netlify-identity");
    store.openModal = jest.fn();
    store.user = {
      name: "foo"
    };

    netlifyIdentity.open();

    expect(store.openModal).toHaveBeenCalledTimes(1);
    expect(store.openModal).toHaveBeenCalledWith("user");
  });

  it("should invoke open event with the updatePassword action if store.user exists", () => {
    const { default: store } = require("./state/store");
    const { default: netlifyIdentity } = require("./netlify-identity");
    store.openModal = jest.fn();
    store.user = {
      name: "foo"
    };

    netlifyIdentity.open("updatePassword");

    expect(store.openModal).toHaveBeenCalledTimes(1);
    expect(store.openModal).toHaveBeenCalledWith("updatePassword");
  });

  it("should not invoke open event when called with an invalid argument", () => {
    const { default: store } = require("./state/store");
    const { default: netlifyIdentity } = require("./netlify-identity");
    store.openModal = jest.fn();

    const openInvalidAction = () => netlifyIdentity.open("invalid");

    expect(openInvalidAction).toThrow("Invalid action for open: invalid");
  });
});
