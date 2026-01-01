import type { SVGProps } from "react";

type SVGPropsType = SVGProps<SVGSVGElement>;

type CircleIconProps = SVGPropsType & {
  circleColor: string;
  children: JSX.Element | JSX.Element[];
};

const CircleIcon = ({ circleColor, children, ...props }: CircleIconProps) => (
  <svg width={58} height={58} viewBox="0 0 58 58" fill="none" {...props}>
    <circle cx={29} cy={29} r={29} fill={circleColor} />
    <g
      transform="translate(17 17)"
      fill="none"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </g>
  </svg>
);

const ZapGlyph = (
  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
);

const ActivityGlyph = (
  <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
);

const GaugeGlyph = (
  <>
    <path d="m12 14 4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </>
);

const PercentGlyph = (
  <>
    <line x1="19" x2="5" y1="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </>
);

const CompassGlyph = (
  <>
    <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
    <circle cx="12" cy="12" r="10" />
  </>
);

const ShuffleGlyph = (
  <>
    <path d="m18 14 4 4-4 4" />
    <path d="m18 2 4 4-4 4" />
    <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" />
    <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" />
    <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" />
  </>
);

const ArrowUpRightGlyph = (
  <>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </>
);

const ArrowDownLeftGlyph = (
  <>
    <path d="M17 7 7 17" />
    <path d="M17 17H7V7" />
  </>
);

const WavesGlyph = (
  <>
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
  </>
);

const LayersGlyph = (
  <>
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
  </>
);

export function VoltageA(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#3FD97F" {...props}>
      {ZapGlyph}
    </CircleIcon>
  );
}

export function VoltageB(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#FF9C55" {...props}>
      {ZapGlyph}
    </CircleIcon>
  );
}

export function VoltageC(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#8155FF" {...props}>
      {ZapGlyph}
    </CircleIcon>
  );
}

export function Current(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#18BFFF" {...props}>
      {ActivityGlyph}
    </CircleIcon>
  );
}

export function Voltage(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#3FD97F" {...props}>
      {ZapGlyph}
    </CircleIcon>
  );
}

export function Power(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#8155FF" {...props}>
      {GaugeGlyph}
    </CircleIcon>
  );
}

export function PowerFactor(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#FF9C55" {...props}>
      {PercentGlyph}
    </CircleIcon>
  );
}

export function AngleCurrent(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#18BFFF" {...props}>
      {CompassGlyph}
    </CircleIcon>
  );
}

export function AngleVoltage(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#3FD97F" {...props}>
      {CompassGlyph}
    </CircleIcon>
  );
}

export function PhaseShift(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#8155FF" {...props}>
      {ShuffleGlyph}
    </CircleIcon>
  );
}

export function PowerDirect(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#3FD97F" {...props}>
      {ArrowUpRightGlyph}
    </CircleIcon>
  );
}

export function PowerReverse(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#FF9C55" {...props}>
      {ArrowDownLeftGlyph}
    </CircleIcon>
  );
}

export function PowerReactive(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#8155FF" {...props}>
      {WavesGlyph}
    </CircleIcon>
  );
}

export function PowerComplex(props: SVGPropsType) {
  return (
    <CircleIcon circleColor="#18BFFF" {...props}>
      {LayersGlyph}
    </CircleIcon>
  );
}
