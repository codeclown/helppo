import classNames from "classnames";
import { createElement as h, ReactElement } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

export enum NotificationDelays {
  QUICK = 2000,
  SLOW = 5000,
}

export enum NotificationStyles {
  DEFAULT = "default",
  SUCCESS = "success",
  DANGER = "danger",
}

export interface NotificationOptions {
  clearAfter: NotificationDelays;
  style: NotificationStyles;
}

export interface Notification {
  id: number;
  message: ReactElement | string;
  options: {
    clearAfter: NotificationDelays;
    style: NotificationStyles;
  };
}

interface NotificationsProps {
  notifications: Notification[];
  hideNotification: (notification: Notification) => void;
}

const Notifications = ({
  notifications,
  hideNotification,
}: NotificationsProps): ReactElement => {
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
