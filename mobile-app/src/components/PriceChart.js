import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

export default function PriceChart({ 
  data = [], 
  width = screenWidth - 40, 
  height = 200, 
  color = '#FF3B30',
  showGrid = true,
  showDot = true,
}) {
  if (!data || data.length < 2) {
    return <View style={{ width, height }} />;
  }

  const padding = { top: 20, right: 20, bottom: 20, left: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Extract prices from data (handles both [timestamp, price] and just price arrays)
  const prices = data.map(item => Array.isArray(item) ? item[1] : item);
  
  const minValue = Math.min(...prices);
  const maxValue = Math.max(...prices);
  const range = maxValue - minValue || 1;

  // Calculate points
  const points = prices.map((value, index) => {
    const x = padding.left + (index / (prices.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((value - minValue) / range) * chartHeight;
    return { x, y };
  });

  // Create SVG path for line
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  // Create area path (for gradient fill)
  const areaPath = linePath + 
    ` L ${points[points.length - 1].x.toFixed(2)} ${height - padding.bottom} ` +
    `L ${padding.left} ${height - padding.bottom} Z`;

  // Determine trend color
  const isPositive = prices[prices.length - 1] >= prices[0];
  const lineColor = color || (isPositive ? '#00C805' : '#FF3B30');

  // Grid lines (horizontal dashed lines)
  const gridLines = showGrid ? [0.25, 0.5, 0.75].map(ratio => ({
    y: padding.top + chartHeight * ratio,
  })) : [];

  const lastPoint = points[points.length - 1];

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
            <Stop offset="0.5" stopColor={lineColor} stopOpacity="0.1" />
            <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {gridLines.map((line, index) => (
          <Line
            key={index}
            x1={padding.left}
            y1={line.y}
            x2={width - padding.right}
            y2={line.y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ))}

        {/* Area fill */}
        <Path
          d={areaPath}
          fill="url(#areaGradient)"
        />

        {/* Price line */}
        <Path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current price dot */}
        {showDot && lastPoint && (
          <>
            <Circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={6}
              fill={lineColor}
              opacity={0.3}
            />
            <Circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={4}
              fill={lineColor}
            />
          </>
        )}
      </Svg>
    </View>
  );
}
