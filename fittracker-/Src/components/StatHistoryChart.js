import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Line, Circle } from 'react-native-svg';

export default function StatHistoryChart({ entries = [], width = 280, height = 100, color = '#00c2c2' }) {
  if (!entries.length) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={styles.emptyText}>Complete tasks to see progress</Text>
      </View>
    );
  }

  const sorted = [...entries].reverse();
  const values = sorted.map((e) => e.newValue ?? 0);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const pad = 8;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const pts = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * w;
    const y = pad + h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  const last = values[values.length - 1];
  const lastX = pad + w;
  const lastY = pad + h - ((last - min) / range) * h;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Line x1={pad} y1={pad + h} x2={width - pad} y2={pad + h} stroke="#2a3548" strokeWidth={1} />
        <Polyline points={pts} fill="none" stroke={color} strokeWidth={2} />
        <Circle cx={lastX} cy={lastY} r={4} fill={color} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1117', borderRadius: 10 },
  emptyText: { color: '#666', fontSize: 12 },
});
