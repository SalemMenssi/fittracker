import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, G, Text as SvgText } from 'react-native-svg';
import { INTELLIGENCE_KEYS, INTELLIGENCE_META } from '../data/intelligenceConstants';

const LABELS = {
  linguistic: 'Word',
  logicalMathematical: 'Logic',
  spatial: 'Spatial',
  musical: 'Rhythm',
  bodilyKinesthetic: 'Body',
  naturalistic: 'Nature',
  interpersonal: 'Social',
  intrapersonal: 'Self',
};

export default function IntelligenceRadarChart({ stats = {}, size = 260, maxValue = 5 }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.32;
  const n = INTELLIGENCE_KEYS.length;
  const max = Math.max(maxValue, 1);

  const angleFor = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i, value) => {
    const ratio = Math.min(Math.max((value ?? 1) / max, 0.05), 1);
    const a = angleFor(i);
    return {
      x: cx + Math.cos(a) * radius * ratio,
      y: cy + Math.sin(a) * radius * ratio,
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = INTELLIGENCE_KEYS.map((key, i) =>
    point(i, stats[key] ?? 1)
  );
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={[styles.wrap, { width: size, height: size + 24 }]}>
      <Svg width={size} height={size}>
        {gridLevels.map((level) => {
          const pts = INTELLIGENCE_KEYS.map((_, i) => {
            const p = point(i, max * level);
            return `${p.x},${p.y}`;
          }).join(' ');
          return (
            <Polygon
              key={level}
              points={pts}
              fill="none"
              stroke="#2a3548"
              strokeWidth={1}
            />
          );
        })}

        {INTELLIGENCE_KEYS.map((_, i) => {
          const outer = point(i, max);
          return (
            <Line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="#2a3548"
              strokeWidth={1}
            />
          );
        })}

        <Polygon
          points={polygonPoints}
          fill="rgba(0, 194, 194, 0.25)"
          stroke="#00c2c2"
          strokeWidth={2}
        />

        {dataPoints.map((p, i) => (
          <Circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={INTELLIGENCE_META[INTELLIGENCE_KEYS[i]]?.color || '#00c2c2'}
          />
        ))}

        {INTELLIGENCE_KEYS.map((key, i) => {
          const labelPt = point(i, max * 1.18);
          return (
            <SvgText
              key={`lbl-${key}`}
              x={labelPt.x}
              y={labelPt.y}
              fill={INTELLIGENCE_META[key]?.color || '#8a9bb0'}
              fontSize="10"
              fontWeight="600"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {LABELS[key]}
            </SvgText>
          );
        })}

        <Circle cx={cx} cy={cy} r={3} fill="#00c2c2" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center', alignItems: 'center' },
});
