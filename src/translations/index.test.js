describe("translations", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("should return translation for default locale", () => {
    const { getTranslation } = require("./");
    expect(getTranslation("log_in")).toEqual("Log in");
  });

  it("should return translation for 'en' locale", () => {
    const { getTranslation } = require("./");
    expect(getTranslation("log_in", "en")).toEqual("Log in");
  });

  it("should return translation for 'fr' locale", () => {
    const { getTranslation } = require("./");
    expect(getTranslation("log_in", "fr")).toEqual("Connexion");
  });

  it("should return translation for 'hu' locale", () => {
    const { getTranslation } = require("./");
    expect(getTranslation("log_in", "hu")).toEqual("Bejelentkezés");
  });

  it("should return translation for 'es' locale", () => {
    const { getTranslation } = require("./");
    expect(getTranslation("log_in", "es")).toEqual("Iniciar sesión");
  });

  it("should return translation for 'pt' locale", () => {
    const { getTranslation } = require("./");
    expect(getTranslation("log_in", "pt")).toEqual("Entrar");
  });

  it("should return translation for 'ru' locale", () => {
    const { getTranslation } = require("./");
    expect(getTranslation("log_in", "ru")).toEqual("Войти");
  });

  it("should return key for non existing translation", () => {
    const { getTranslation } = require("./");
    expect(getTranslation("unknown_key")).toEqual("unknown_key");
  });

  it("should default to 'en' on missing key", () => {
    jest.mock("./en.json", () => ({ log_in: "Log in" }));
    jest.mock("./fr.json", () => ({}));
    jest.mock("./hu.json", () => ({}));
    jest.mock("./es.json", () => ({}));
    jest.mock("./pt.json", () => ({}));
    jest.mock("./ru.json", () => ({}));

    const { getTranslation } = require("./");
    expect(getTranslation("log_in")).toEqual("Log in");
    expect(getTranslation("log_in", "fr")).toEqual("Log in");
    expect(getTranslation("log_in", "hu")).toEqual("Log in");
    expect(getTranslation("log_in", "es")).toEqual("Log in");
    expect(getTranslation("log_in", "pt")).toEqual("Log in");
    expect(getTranslation("log_in", "ru")).toEqual("Log in");
  });
});
