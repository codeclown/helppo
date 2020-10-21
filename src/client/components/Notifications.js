import classNames from "classnames";
import { createElement as h } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

export const NotificationDelays = {
  QUICK: 2000,
  SLOW: 5000,
};

export const NotificationStyles = {
  DEFAULT: "default",
  SUCCESS: "success",
  DANGER: "danger",
};

const Notifications = ({ notifications, hideNotification }) => {
  return h(
    TransitionGroup,
    { className: "Notifications" },
    notifications.map((notification) =>
      h(
        CSSTransition,
        {
          key: notification.id,
          timeout: 300,
          classNames: "Notifications-notification-transition",
        },
        h(
          "div",
          {
            className: classNames(
              "Notifications-notification",
              `Notifications-notification--${notification.options.style}`
            ),
            onClick: () => hideNotification(notification),
          },
          notification.message
        )
      )
    )
  );
};

export default Notifications;
