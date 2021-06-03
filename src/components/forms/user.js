import { h, Component } from "preact";
import Message from "./message";
import Button from "./button";

export default class UserForm extends Component {
  constructor(props) {
    super(props);
    this.state = { name: "", email: "", password: "" };
  }

  handleInput = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleLogin = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.state);
  };

  render() {
    const { page, message, saving, namePlaceholder, t } = this.props;
    const { name, email, password } = this.state;

    return (
      <form
        onsubmit={this.handleLogin}
        className={`form ${saving ? "disabled" : ""}`}
      >
        {message && <Message type={message} t={t} />}
        {page.name && (
          <div className="formGroup">
            <label>
              <span className="visuallyHidden">
                {t("form_name_placeholder")}
              </span>
              <input
                className="formControl"
                type="name"
                name="name"
                value={name}
                placeholder={
                  namePlaceholder ? namePlaceholder : t("form_name_label")
                }
                autocapitalize="off"
                required
                oninput={this.handleInput}
              />
              <div className="inputFieldIcon inputFieldName" />
            </label>
          </div>
        )}
        {page.email && (
          <div className="formGroup">
            <label>
              <span className="visuallyHidden">{t("form_name_label")}</span>
              <input
                className="formControl"
                type="email"
                name="email"
                value={email}
                placeholder={t("form_email_placeholder")}
                autocomplete="email"
                autocapitalize="off"
                required
                oninput={this.handleInput}
              />
              <div className="inputFieldIcon inputFieldEmail" />
            </label>
          </div>
        )}
        {page.password && (
          <div className="formGroup">
            <label>
              <span className="visuallyHidden">{t("form_password_label")}</span>
              <input
                className="formControl"
                type="password"
                name="password"
                value={password}
                placeholder={t("form_password_placeholder")}
                autocomplete={page.password}
                required
                oninput={this.handleInput}
              />
              <div className="inputFieldIcon inputFieldPassword" />
            </label>
          </div>
        )}
        <Button
          saving={saving}
          text={t(page.button)}
          saving_text={t(page.button_saving)}
        />
      </form>
    );
  }
}
