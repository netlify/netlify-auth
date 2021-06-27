import { h, Component } from "preact";
import { connect } from "mobx-preact";
import Modal from "./modal";
import SiteURLForm from "./forms/siteurl";
import LogoutForm from "./forms/logout";
import UserForm from "./forms/user";
import Providers from "./forms/providers";
import Message from "./forms/message";

const pagesWithHeader = { login: true, signup: true };
const pages = {
  login: {
    login: true,
    button: "log_in",
    button_saving: "logging_in",
    email: true,
    password: "current-password",
    link: "amnesia",
    link_text: "forgot_password",
    providers: true
  },
  signup: {
    signup: true,
    button: "sign_up",
    button_saving: "signing_up",
    name: true,
    email: true,
    password: "new-password",
    providers: true
  },
  amnesia: {
    title: "recover_password",
    button: "send_recovery_email",
    button_saving: "sending_recovery_email",
    email: true,
    link: "login",
    link_text: "never_mind"
  },
  updatePassword: {
    title: "update_password",
    button: "update_password",
    button_saving: "updating_password",
    password: "new-password",
    link: "login",
    link_text: "never_mind"
  },
  invite: {
    title: "complete_your_signup",
    button: "sign_up",
    button_saving: "signing_up",
    password: "new-password",
    providers: true
  },
  user: {
    title: "logged_in"
  }
};

@connect(["store"])
class App extends Component {
  handleClose = () => this.props.store.closeModal();
  handlePage = (page) => this.props.store.openModal(page);
  handleLogout = () => this.props.store.logout();
  handleSiteURL = (url) => this.props.store.setSiteURL(url);
  clearSiteURL = (url) => this.props.store.clearSiteURL();
  clearStoreError = () => this.props.store.setError();
  handleExternalLogin = (provider) => this.props.store.externalLogin(provider);
  handleUser = ({ name, email, password }) => {
    const { store } = this.props;

    switch (store.modal.page) {
      case "login":
        store.login(email, password);
        break;
      case "signup":
        store.signup(name, email, password);
        break;
      case "amnesia":
        store.requestPasswordRecovery(email);
        break;
      case "invite":
        store.acceptInvite(password);
        break;
      case "updatePassword":
        store.updatePassword(password);
        break;
    }
  };

  renderBody() {
    const { store } = this.props;
    const page = pages[store.modal.page] || {};
    const pageLinkHandler = () => this.handlePage(page.link);

    if (store.isLocal && store.siteURL === null) {
      return (
        <SiteURLForm
          devMode={store.siteURL != null}
          onSiteURL={store.siteURL ? this.clearSiteURL : this.handleSiteURL}
          t={store.translate}
        />
      );
    }
    if (!store.settings) {
      return;
    }
    if (store.user && store.modal.page !== "updatePassword") {
      return (
        <LogoutForm
          user={store.user}
          saving={store.saving}
          onUpdatePassword={() => this.handlePage("updatePassword")}
          onLogout={this.handleLogout}
          t={store.translate}
        />
      );
    }
    if (store.modal.page === "signup" && store.settings.disable_signup) {
      return <Message type="signup_disabled" t={store.translate} />;
    }

    return (
      <div>
        <UserForm
          page={page}
          message={store.message}
          saving={store.saving}
          onSubmit={this.handleUser}
          namePlaceholder={store.namePlaceholder}
          t={store.translate}
        />
        {!store.user && page.link && store.gotrue && (
          <button
            onclick={pageLinkHandler}
            className="btnLink forgotPasswordLink"
          >
            {store.translate(page.link_text)}
          </button>
        )}
        {store.isLocal ? (
          <SiteURLForm
            devMode={store.siteURL != null}
            onSiteURL={store.siteURL ? this.clearSiteURL : this.handleSiteURL}
            t={store.translate}
          />
        ) : (
          <div />
        )}
      </div>
    );
  }

  renderProviders() {
    const { store } = this.props;

    if (!(store.gotrue && store.settings)) {
      return null;
    }
    if (store.modal.page === "signup" && store.settings.disable_signup) {
      return null;
    }
    const page = pages[store.modal.page] || {};

    if (!page.providers) {
      return null;
    }

    const providers = [
      "Google",
      "GitHub",
      "GitLab",
      "BitBucket",
      "SAML"
    ].filter((p) => store.settings.external[p.toLowerCase()]);

    return providers.length ? (
      <Providers
        providers={providers}
        labels={store.settings.external_labels || {}}
        onLogin={this.handleExternalLogin}
        t={store.translate}
      />
    ) : null;
  }

  render() {
    const { store } = this.props;
    const showHeader = pagesWithHeader[store.modal.page];
    const showSignup = store.settings && !store.settings.disable_signup;
    const page = pages[store.modal.page] || {};

    return (
      <div>
        <Modal
          page={page}
          error={store.error}
          showHeader={showHeader}
          showSignup={showSignup}
          devSettings={!store.gotrue}
          loading={!store.error && store.gotrue && !store.settings}
          isOpen={store.modal.isOpen}
          onPage={this.handlePage}
          onClose={this.handleClose}
          logo={store.modal.logo}
          t={store.translate}
          isLocal={store.isLocal}
          clearSiteURL={this.clearSiteURL}
          clearStoreError={this.clearStoreError}
        >
          {this.renderBody()}
          {this.renderProviders()}
        </Modal>
      </div>
    );
  }
}

export default App;
