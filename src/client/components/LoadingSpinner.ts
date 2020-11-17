import classNames from "classnames";
import { createElement as h, ReactElement } from "react";

const pointRadius = 8;
const pointAmount = 8;
const points = [];
for (let i = 0; i < pointAmount; i++) {
  const radius = 45 - pointRadius;
  const theta = (2 * Math.PI * i) / pointAmount;
  points.push({
    x: 45 + radius * Math.cos(theta),
    y: 45 + radius * Math.sin(theta),
    animationPhase: i,
  });
}

const LoadingSpinner = ({
  height = 32,
  dim,
}: {
  height: number;
  dim?: boolean;
}): ReactElement => {
  return h(
    "svg",
    {
      className: classNames("LoadingSpinner", dim && "LoadingSpinner--dim"),
      height,
      viewBox: "0 0 90 90",
      xmlns: "http://www.w3.org/2000/svg",
    },
    points.map(({ x, y, animationPhase }, index) =>
      h(
        "circle",
        {
          key: index,
          className: "LoadingSpinner__rect",
          cx: x,
          cy: y,
          r: pointRadius,
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
