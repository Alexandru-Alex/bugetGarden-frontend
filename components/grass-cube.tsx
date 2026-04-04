import React from "react";
import Svg, { Circle, Line, Polygon } from "react-native-svg";

type GrassCubeVariant = "normal" | "hovered" | "today" | "future" | "flower";

const VARIANTS: Record<
  GrassCubeVariant,
  {
    topGrass: string;
    topHighlight: string;
    grassSide: string;
    topOutline: string;
    rightDirt: string;
    leftDirt: string;
    dirtOutline: string;
  }
> = {
  normal: {
    topGrass: "#6BBF68",
    topHighlight: "#82D47F",
    grassSide: "#4E9B4B",
    topOutline: "#3D7B3A",
    rightDirt: "#B8743A",
    leftDirt: "#8A5C2E",
    dirtOutline: "#6B4422",
  },
  hovered: {
    topGrass: "#7ed46a",
    topHighlight: "#9ee88a",
    grassSide: "#5ab050",
    topOutline: "#3D7B3A",
    rightDirt: "#C4804A",
    leftDirt: "#9A6A3E",
    dirtOutline: "#7B5022",
  },
  today: {
    topGrass: "#e8e060",
    topHighlight: "#f5ef90",
    grassSide: "#b0a830",
    topOutline: "#8a8020",
    rightDirt: "#C8A050",
    leftDirt: "#9A7838",
    dirtOutline: "#705820",
  },
  future: {
    topGrass: "#b8d8a8",
    topHighlight: "#d0eac0",
    grassSide: "#90b880",
    topOutline: "#78a060",
    rightDirt: "#C8A880",
    leftDirt: "#A08060",
    dirtOutline: "#807050",
  },
  flower: {
    topGrass: "#4a9e2f",
    topHighlight: "#68c045",
    grassSide: "#357520",
    topOutline: "#2a5a18",
    rightDirt: "#A86030",
    leftDirt: "#7A4820",
    dirtOutline: "#5a3018",
  },
};

interface GrassCubeProps {
  size: number;
  variant?: GrassCubeVariant;
}

export function GrassCube({ size, variant = "normal" }: GrassCubeProps) {
  const c = VARIANTS[variant];

  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Right face - dirt */}
      <Polygon points="50,50 100,25 100,75 50,100" fill={c.rightDirt} />
      {/* Right face highlight */}
      <Polygon
        points="50,50 100,25 100,32 50,57"
        fill="#CC8A52"
        opacity={0.3}
      />

      {/* Left face - dirt */}
      <Polygon points="0,25 50,50 50,100 0,75" fill={c.leftDirt} />
      {/* Left face shadow */}
      <Polygon
        points="0,68 50,93 50,100 0,75"
        fill="#6B4422"
        opacity={0.35}
      />

      {/* Dirt texture - left */}
      <Circle cx={18} cy={55} r={2} fill="#7A4E25" opacity={0.5} />
      <Circle cx={30} cy={70} r={1.5} fill="#7A4E25" opacity={0.4} />
      <Circle cx={12} cy={42} r={1.5} fill="#7A4E25" opacity={0.3} />

      {/* Dirt texture - right */}
      <Circle cx={72} cy={45} r={2} fill="#C4884A" opacity={0.5} />
      <Circle cx={85} cy={60} r={1.5} fill="#C4884A" opacity={0.4} />
      <Circle cx={78} cy={72} r={1.5} fill="#C4884A" opacity={0.3} />

      {/* Grass side strip - left */}
      <Polygon points="0,25 50,50 50,57 0,32" fill={c.grassSide} />
      {/* Grass side strip - right */}
      <Polygon points="50,50 100,25 100,32 50,57" fill={c.grassSide} />

      {/* Top face - grass */}
      <Polygon points="50,0 100,25 50,50 0,25" fill={c.topGrass} />
      {/* Grass highlight */}
      <Polygon
        points="50,0 100,25 75,37 25,12"
        fill={c.topHighlight}
        opacity={0.35}
      />

      {/* Grass tufts */}
      <Line
        x1={30} y1={18} x2={28} y2={11}
        stroke={c.grassSide} strokeWidth={1.5} strokeLinecap="round"
      />
      <Line
        x1={33} y1={16} x2={33} y2={9}
        stroke={c.grassSide} strokeWidth={1.5} strokeLinecap="round"
      />
      <Line
        x1={62} y1={22} x2={60} y2={15}
        stroke={c.grassSide} strokeWidth={1.5} strokeLinecap="round"
      />
      <Line
        x1={65} y1={20} x2={65} y2={13}
        stroke={c.grassSide} strokeWidth={1.5} strokeLinecap="round"
      />

      {/* Linie centrala verticala pentru separare fete laterale */}
      <Line
        x1={50} y1={50} x2={50} y2={100}
        stroke={c.dirtOutline} strokeWidth={0.8} opacity={0.4}
      />
    </Svg>
  );
}
