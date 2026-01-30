import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function Sparkline({ 
  data = [], 
  width = 60, 
  height = 24, 
  color = '#00C805',
  strokeWidth = 1.5,
  showGradient = false,
}) {
  if (!data || data.length < 2) {
    return <View style={{ width, height }} />;
  }

  // Normalize data to fit in the view
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;
  
  // Sample data if too many points
  const maxPoints = 50;
  const sampledData = data.length > maxPoints 
    ? data.filter((_, i) => i % Math.ceil(data.length / maxPoints) === 0)
    : data;
  
  const points = sampledData.map((value, index) => {
    const x = (index / (sampledData.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height * 0.8 - height * 0.1;
    return { x, y };
  });

  // Create SVG path
  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  // Determine color based on trend
  const isPositive = data[data.length - 1] >= data[0];
  const lineColor = color || (isPositive ? '#00C805' : '#FF3B30');

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {showGradient && (
          <Defs>
            <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
              <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
            </LinearGradient>
          </Defs>
        )}
        <Path
          d={pathData}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
