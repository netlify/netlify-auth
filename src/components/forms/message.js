import { h, Component } from "preact";

const messages = {
  confirm: {
    type: "success",
    text: "message_confirm"
  },
  password_mail: {
    type: "success",
    text: "message_password_mail"
  },
  password_changed: {
    type: "success",
    text: "message_password_changed"
  },
  email_changed: {
    type: "success",
    text: "message_email_changed"
  },
  verfication_error: {
    type: "error",
    text: "message_verfication_error"
  },
  signup_disabled: {
    type: "error",
    text: "message_signup_disabled"
  }
};

export default class Message extends Component {
  render() {
    const { type, t } = this.props;
    const msg = messages[type];

    return (
      <div className={`flashMessage ${msg.type}`}>
        <span>{t(msg.text)}</span>
      </div>
    );
  }
}
