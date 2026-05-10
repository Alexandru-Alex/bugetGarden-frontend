import { Dimensions } from "react-native";
import Svg, { Text as SvgText } from "react-native-svg";

const { width: W } = Dimensions.get("window");

const SVG_W = W - 16;
const R_OUT = 180;
const R_IN  =  92;
const CX = SVG_W / 2;
const CY = R_OUT + 60;
const SVG_H = CY + 12;

function charOnArc(s: number, r: number) {
  const θ = Math.PI - s / r;
  return {
    x: CX + r * Math.cos(θ),
    y: CY - r * Math.sin(θ),
    rot: 90 - θ * (180 / Math.PI),
  };
}

function ArcWord({ word, r, fontSize, charSpacing }: {
  word: string; r: number; fontSize: number; charSpacing: number;
}) {
  const totalWidth = (word.length - 1) * charSpacing;
  const midArc = (Math.PI * r) / 2;
  const startArc = midArc - totalWidth / 2;

  const chars = word.split('').map((char, i) => {
    const { x, y, rot } = charOnArc(startArc + i * charSpacing, r);
    return { char, x, y, rot };
  });

  return (
    <>
      {chars.map(({ char, x, y, rot }, i) => (
        <SvgText key={`sh-${i}`} x={x} y={y} fontSize={fontSize}
          fontFamily="Pacifico_400Regular" textAnchor="middle"
          fill="rgba(90,40,0,0.85)" stroke="rgba(90,40,0,0.85)"
          strokeWidth={14} strokeLinejoin="round"
          transform={`rotate(${rot}, ${x}, ${y})`}>
          {char}
        </SvgText>
      ))}
      {chars.map(({ char, x, y, rot }, i) => (
        <SvgText key={`gl-${i}`} x={x} y={y} fontSize={fontSize}
          fontFamily="Pacifico_400Regular" textAnchor="middle"
          fill="rgba(240,175,40,0.35)" stroke="rgba(240,175,40,0.35)"
          strokeWidth={6} strokeLinejoin="round"
          transform={`rotate(${rot}, ${x}, ${y})`}>
          {char}
        </SvgText>
      ))}
      {chars.map(({ char, x, y, rot }, i) => (
        <SvgText key={`m-${i}`} x={x} y={y} fontSize={fontSize}
          fontFamily="Pacifico_400Regular" textAnchor="middle"
          fill="#FFE566" stroke="#FFE566" strokeWidth={2.5} strokeLinejoin="round"
          transform={`rotate(${rot}, ${x}, ${y})`}>
          {char}
        </SvgText>
      ))}
    </>
  );
}

export function ArcTitle() {
  return (
    <Svg width={SVG_W} height={SVG_H} style={{ overflow: "visible" }} pointerEvents="none">
      <ArcWord word="Money"  r={R_OUT} fontSize={58} charSpacing={38} />
      <ArcWord word="Garden" r={R_IN}  fontSize={50} charSpacing={32} />
    </Svg>
  );
}
