"use client";

import { useEffect, useRef, useState } from 'react';

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface BaseChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
  animate?: boolean;
}

export function BarChart({
  data,
  width = 400,
  height = 300,
  className = '',
  showLabels = true,
  showValues = false,
  animate = true,
}: BaseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimationProgress(1);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimationProgress(1);
    }
  }, [animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = (width - 60) / data.length;
    const barSpacing = 10;

    // Draw bars
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * (height - 60) * animationProgress;
      const x = 40 + index * (barWidth + barSpacing);
      const y = height - 40 - barHeight;

      // Bar
      ctx.fillStyle = item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Border
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);

      // Label
      if (showLabels) {
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + barWidth / 2, height - 20);
      }

      // Value
      if (showValues) {
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);
      }
    });

    // Draw axes
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(35, 20);
    ctx.lineTo(35, height - 35);
    ctx.lineTo(width - 20, height - 35);
    ctx.stroke();

  }, [data, width, height, showLabels, showValues, animationProgress]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  );
}

export function LineChart({
  data,
  width = 400,
  height = 300,
  className = '',
  showLabels = true,
  showValues = false,
  animate = true,
}: BaseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimationProgress(1);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimationProgress(1);
    }
  }, [animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...data.map(d => d.value));
    const pointSpacing = (width - 60) / (data.length - 1);

    // Draw line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    data.forEach((item, index) => {
      const x = 40 + index * pointSpacing;
      const y = height - 40 - (item.value / maxValue) * (height - 60) * animationProgress;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Point
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      if (showLabels) {
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x, height - 20);
      }

      // Value
      if (showValues) {
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.value.toString(), x, y - 10);
      }
    });

    ctx.stroke();

  }, [data, width, height, showLabels, showValues, animationProgress]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  );
}

export function PieChart({
  data,
  width = 300,
  height = 300,
  className = '',
  showLabels = true,
  showValues = true,
  animate = true,
}: BaseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimationProgress(1);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimationProgress(1);
    }
  }, [animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2; // Start from top

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * Math.PI * 2 * animationProgress;

      // Slice
      ctx.fillStyle = item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      if (showLabels && animationProgress === 1) {
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, labelX, labelY);
      }

      // Value
      if (showValues && animationProgress === 1) {
        const valueAngle = currentAngle + sliceAngle / 2;
        const valueX = centerX + Math.cos(valueAngle) * (radius * 0.5);
        const valueY = centerY + Math.sin(valueAngle) * (radius * 0.5);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.value.toString(), valueX, valueY);
      }

      currentAngle += sliceAngle;
    });

  }, [data, width, height, showLabels, showValues, animationProgress]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  );
}

export function AreaChart({
  data,
  width = 400,
  height = 300,
  className = '',
  showLabels = true,
  showValues = false,
  animate = true,
}: BaseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimationProgress(1);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimationProgress(1);
    }
  }, [animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...data.map(d => d.value));
    const pointSpacing = (width - 60) / (data.length - 1);

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');

    // Draw area
    ctx.fillStyle = gradient;
    ctx.beginPath();

    data.forEach((item, index) => {
      const x = 40 + index * pointSpacing;
      const y = height - 40 - (item.value / maxValue) * (height - 60) * animationProgress;

      if (index === 0) {
        ctx.moveTo(x, height - 40);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Close the area
    ctx.lineTo(40 + (data.length - 1) * pointSpacing, height - 40);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    data.forEach((item, index) => {
      const x = 40 + index * pointSpacing;
      const y = height - 40 - (item.value / maxValue) * (height - 60) * animationProgress;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Point
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.stroke();

    // Labels and values
    if (animationProgress === 1) {
      data.forEach((item, index) => {
        const x = 40 + index * pointSpacing;
        const y = height - 40 - (item.value / maxValue) * (height - 60);

        if (showLabels) {
          ctx.fillStyle = '#333';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(item.label, x, height - 20);
        }

        if (showValues) {
          ctx.fillStyle = '#333';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(item.value.toString(), x, y - 10);
        }
      });
    }

  }, [data, width, height, showLabels, showValues, animationProgress]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  );
}

// Chart container with responsive behavior
interface ChartContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({ title, children, className = '' }: ChartContainerProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="flex justify-center">
        {children}
      </div>
    </div>
  );
}

// Simple metrics display
interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  className?: string;
}

export function MetricsCard({ title, value, change, icon, className = '' }: MetricsCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center gap-1 ${
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%</span>
              <span>vs mês anterior</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}