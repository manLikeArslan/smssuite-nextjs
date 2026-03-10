"use client";

import React, { useMemo } from 'react';

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
}

export function Sparkline({ data, width = 200, height = 40, color = "#0A0B1A" }: SparklineProps) {
    const points = useMemo(() => {
        if (data.length < 2) return "";

        const max = Math.max(...data, 1); // Avoid division by zero
        const xStep = width / (data.length - 1);

        return data.map((val, i) => {
            const x = i * xStep;
            const y = height - (val / max) * height;
            return `${x},${y}`;
        }).join(" ");
    }, [data, width, height]);

    const pathData = useMemo(() => {
        if (data.length < 2) return "";

        const max = Math.max(...data, 1);
        const xStep = width / (data.length - 1);

        // Create smooth cubic bezier path
        let d = `M 0,${height - (data[0] / max) * height}`;

        for (let i = 0; i < data.length - 1; i++) {
            const x1 = i * xStep;
            const y1 = height - (data[i] / max) * height;
            const x2 = (i + 1) * xStep;
            const y2 = height - (data[i + 1] / max) * height;

            const cx = (x1 + x2) / 2;
            d += ` C ${cx},${y1} ${cx},${y2} ${x2},${y2}`;
        }

        return d;
    }, [data, width, height]);

    return (
        <svg width={width} height={height} className="overflow-visible" viewBox={`0 0 ${width} ${height}`}>
            <defs>
                <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Area fill */}
            <path
                d={`${pathData} L ${width},${height} L 0,${height} Z`}
                fill="url(#sparkline-grad)"
                className="transition-all duration-500 ease-in-out"
            />

            {/* Line */}
            <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500 ease-in-out"
            />
        </svg>
    );
}
