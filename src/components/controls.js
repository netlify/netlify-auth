import { h, Component } from "preact";
import { connect } from "mobx-preact";

@connect(["store"])
class Controls extends Component {
  handleSignup = (e) => {
    e.preventDefault();
    this.props.store.openModal("signup");
  };

  handleLogin = (e) => {
    e.preventDefault();
    this.props.store.openModal("login");
  };

  handleUpdatePassword = (e) => {
    e.preventDefault();
    this.props.store.openModal("updatePassword");
  };

  handleLogout = (e) => {
    e.preventDefault();
    this.props.store.openModal("user");
  };

  handleButton = (e) => {
    e.preventDefault();
    this.props.store.openModal(this.props.store.user ? "user" : "login");
  };

  render() {
    const { user, translate: t } = this.props.store;

    if (this.props.mode === "button") {
      return (
        <a
          className="netlify-identity-button"
          href="#"
          onClick={this.handleButton}
        >
          {this.props.text || (user ? t("log_out") : t("log_in"))}
        </a>
      );
    }

    if (user) {
      return (
        <ul className="netlify-identity-menu">
          <li className="netlify-identity-item netlify-identity-user-details">
            {t("logged_in_as")}{" "}
            <span className="netlify-identity-user">
              {user.user_metadata.name || user.email}
            </span>
          </li>
          <li className="netlify-identity-item">
            <a
              className="netlify-identity-logout"
              href="#"
              onClick={this.handleLogout}
            >
              {t("log_out")}
            </a>
          </li>
          <li className="netlify-identity-item">
            <a
              className="netlify-identity-update-password"
              href="#"
              onClick={this.handleUpdatePassword}
            >
              {t("update_password")}
            </a>
          </li>
        </ul>
      );
    }

    return (
      <ul className="netlify-identity-menu">
        <li className="netlify-identity-item">
          <a
            className="netlify-identity-signup"
            href="#"
            onClick={this.handleSignup}
          >
            {t("sign_up")}
          </a>
        </li>
        <li className="netlify-identity-item">
          <a
            className="netlify-identity-login"
            href="#"
            onClick={this.handleLogin}
          >
            {t("log_in")}
          </a>
        </li>
      </ul>
    );
  }
}

export default Controls;
