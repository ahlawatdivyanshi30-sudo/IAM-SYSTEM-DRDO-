import React from "react";

export default function Emblem({ size = 96 }) {
  return (
    <svg
      className="emblem"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="46" fill="#17141a" stroke="#c9a15a" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#7c2635" strokeWidth="8" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#c9a15a" strokeWidth="1" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 50 + 40 * Math.cos(angle);
        const y1 = 50 + 40 * Math.sin(angle);
        const x2 = 50 + 44 * Math.cos(angle);
        const y2 = 50 + 44 * Math.sin(angle);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a15a" strokeWidth="1" />
        );
      })}
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="13"
        fontWeight="600"
        fill="#f3efe9"
        letterSpacing="1"
      >
        IAM
      </text>
    </svg>
  );
}