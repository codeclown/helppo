import classNames from "classnames";
import { createElement as h } from "react";

const LoadingSpinner = ({ height = 32, dim }) => {
  const boxes = [
    { x: 0, y: 0, animationPhase: 0 },
    { x: 0, y: 1, animationPhase: 1 },
    { x: 0, y: 2, animationPhase: 2 },
    { x: 2, y: 0, animationPhase: 2 },
    { x: 2, y: 1, animationPhase: 3 },
    { x: 2, y: 2, animationPhase: 4 },
    { x: 1, y: 1, animationPhase: 2 },
  ];
  return h(
    "svg",
    {
      className: classNames("LoadingSpinner", dim && "LoadingSpinner--dim"),
      height,
      viewBox: "0 0 90 90",
      xmlns: "http://www.w3.org/2000/svg",
    },
    boxes.map(({ x, y, animationPhase }, index) =>
      h(
        "rect",
        {
          key: index,
          className: "LoadingSpinner__rect",
          width: 24,
          height: 24,
          x: x * 30 + 3,
          y: y * 30 + 3,
          rx: 10,
        },
        h("animate", {
          attributeName: "opacity",
          repeatCount: "indefinite",
          from: 0,
          to: 1,
          dur: "0.5s",
          begin: `${animationPhase * 0.1}s`,
        })
      )
    )
  );
};

export default LoadingSpinner;
