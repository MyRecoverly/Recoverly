// src/components/LineGraph.js
import React, { useState, useCallback, useMemo } from "react";

/**
 * LineGraph — safe, date-aligned (Europe/Amsterdam)
 * - timePeriod: '7d' | '30d'
 * - If `days` provided (YYYY-MM-DD), align by date. Otherwise align by index.
 * - No Date parsing on YYYY-MM-DD to avoid timezone shifts.
 */
export default function LineGraph({
  currentData,
  previousData,
  days, // optional: ['YYYY-MM-DD', ...] same length as currentData
  previousDays, // optional
  color = "#8525b2",
  lightColor = "#e2ceed",
  unit = "",
  timePeriod = "30d",
  unitPosition,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Defensive arrays
  const currValsRaw = Array.isArray(currentData) ? currentData.map(Number) : [];
  const prevValsRaw = Array.isArray(previousData)
    ? previousData.map(Number)
    : [];
  const currDaysRaw = Array.isArray(days) ? days : [];
  const prevDaysRaw = Array.isArray(previousDays) ? previousDays : [];

  // Helpers to build Amsterdam day frame
  function getAmsTodayYMD() {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Amsterdam",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return fmt.format(new Date()); // YYYY-MM-DD
  }
  function ymdToUTC(ymd) {
    const [y, m, d] = (ymd || "").split("-").map((v) => parseInt(v, 10));
    return new Date(Date.UTC(y || 1970, (m || 1) - 1, d || 1));
  }
  function addDaysUTC(dt, n) {
    return new Date(dt.getTime() + n * 86400000);
  }
  function toYMD(dt) {
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const d = String(dt.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function buildFrame(n) {
    const today = ymdToUTC(getAmsTodayYMD());
    const out = [];
    for (let i = n - 1; i >= 0; i--) out.push(toYMD(addDaysUTC(today, -i)));
    return out;
  }

  const frameDays = useMemo(
    () => buildFrame(timePeriod === "7d" ? 7 : 30),
    [timePeriod]
  );

  // Align by date if days are provided; otherwise by index
  function align(values, valueDays, frame) {
    if (
      Array.isArray(valueDays) &&
      valueDays.length === values.length &&
      valueDays.length > 0
    ) {
      const map = new Map();
      for (let i = 0; i < values.length; i++) {
        const k = (valueDays[i] || "").slice(0, 10);
        if (k) map.set(k, Number(values[i]) || 0);
      }
      return frame.map((d) => (map.has(d) ? map.get(d) : 0));
    }
    // index-align fallback
    const out = frame.map((_, i) => Number(values[i]) || 0);
    return out;
  }

  const currVals = useMemo(
    () => align(currValsRaw, currDaysRaw, frameDays),
    [currValsRaw, currDaysRaw, frameDays]
  );
  const prevVals = useMemo(
    () => align(prevValsRaw, prevDaysRaw, frameDays),
    [prevValsRaw, prevDaysRaw, frameDays]
  );

  // SVG geometry & scales
  const viewBoxWidth = 220,
    viewBoxHeight = 100;
  const padding = { top: 5, right: 5, bottom: 20, left: 40 };
  const graphWidth = viewBoxWidth - padding.left - padding.right;
  const graphHeight = viewBoxHeight - padding.top - padding.bottom;

  const all = [...currVals, ...prevVals];
  const minVal = all.length ? Math.min(...all) : 0;
  const maxVal = all.length ? Math.max(...all) : 1;
  const effMax = maxVal === minVal ? minVal + 1 : maxVal;

  const xScale = currVals.length > 1 ? graphWidth / (currVals.length - 1) : 0;
  const yScale = (v) =>
    graphHeight - ((v - minVal) / (effMax - minVal)) * graphHeight;

  const fmtLabel = useCallback((ymd) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || "");
    if (!m) return ymd || "";
    const mm = parseInt(m[2], 10),
      dd = parseInt(m[3], 10);
    const names = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${names[Math.max(0, Math.min(11, mm - 1))]} ${dd}`;
  }, []);

  const onMove = useCallback(
    (e) => {
      if (!currVals.length) return setHoveredPoint(null);
      const rect = e.currentTarget.getBoundingClientRect();
      const scaledX = ((e.clientX - rect.left) / rect.width) * viewBoxWidth;
      let idx = 0,
        best = Infinity;
      for (let i = 0; i < currVals.length; i++) {
        const x = i * xScale + padding.left;
        const d = Math.abs(scaledX - x);
        if (d < best) {
          best = d;
          idx = i;
        }
      }
      const x = idx * xScale + padding.left;
      const y = yScale(currVals[idx] ?? 0) + padding.top;
      setHoveredPoint({
        index: idx,
        value: currVals[idx],
        previousValue: prevVals[idx] ?? null,
        x,
        y,
        dateLabel: fmtLabel(frameDays[idx]),
      });
    },
    [currVals, prevVals, xScale, yScale, frameDays, fmtLabel]
  );

  const onLeave = useCallback(() => setHoveredPoint(null), []);

  if (!currVals.length) {
    return (
      <div className="text-gray-400 text-sm h-full flex items-center justify-center">
        No data to display.
      </div>
    );
  }

  const pathD = (arr) => {
    if (arr.length < 2) return "";
    let d = `M${padding.left},${yScale(arr[0]) + padding.top}`;
    for (let i = 1; i < arr.length; i++) {
      d += `L${i * xScale + padding.left},${yScale(arr[i]) + padding.top}`;
    }
    return d;
  };
  const currPath = pathD(currVals);
  const prevPath = pathD(prevVals);

  // Axes
  const yAxisLabels = [];
  const gridLines = [];
  for (let i = 0; i < 3; i++) {
    const v = minVal + (effMax - minVal) * (1 - i / 2);
    const y = yScale(v) + padding.top;
    let text = v.toFixed(0);
    if (unit === "€") text = `${unit}${v.toFixed(0)}`;
    else if (unit === "%") text = `${v.toFixed(0)}${unit}`;
    yAxisLabels.push(
      <text
        key={`y-${i}`}
        x={padding.left - 20}
        y={y + 3}
        textAnchor="end"
        alignmentBaseline="middle"
        className="text-xs fill-gray-500"
      >
        {text}
      </text>
    );
    gridLines.push(
      <line
        key={`g-${i}`}
        x1={padding.left}
        y1={y}
        x2={viewBoxWidth - padding.right}
        y2={y}
        stroke="#e0e0e0"
        strokeDasharray="2 2"
        strokeWidth="0.5"
      />
    );
  }

  const xIdxs =
    currVals.length <= 3
      ? [...Array(currVals.length).keys()]
      : [0, Math.floor(currVals.length / 2), currVals.length - 1];
  const xAxisLabels = xIdxs.map((i, n) => {
    const x =
      i * xScale +
      padding.left +
      (n === 0 ? 5 : n === xIdxs.length - 1 ? -5 : 0);
    return (
      <text
        key={`x-${i}`}
        x={x}
        y={viewBoxHeight - padding.bottom + 20}
        textAnchor="middle"
        className="text-xs fill-gray-500"
      >
        {fmtLabel(frameDays[i])}
      </text>
    );
  });

  return (
    <div className="relative w-full h-24 mt-2 flex items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {gridLines}
        {yAxisLabels}
        {xAxisLabels}

        <path
          d={prevPath}
          fill="none"
          stroke={lightColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={currPath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {hoveredPoint && (
          <>
            <line
              x1={hoveredPoint.x}
              y1={5}
              x2={hoveredPoint.x}
              y2={viewBoxHeight - 20}
              stroke="#888"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <rect
              x={hoveredPoint.x - 45}
              y={hoveredPoint.y - 20}
              width="90"
              height="40"
              fill="rgba(255,255,255,0.95)"
              stroke="#ccc"
              strokeWidth="0.5"
              rx="4"
              ry="4"
            />
            <text
              x={hoveredPoint.x}
              y={hoveredPoint.y - 7}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize="8"
              fill="#666"
            >
              {hoveredPoint.dateLabel}
            </text>
            <circle
              cx={hoveredPoint.x - 30}
              cy={hoveredPoint.y + 5}
              r="2"
              fill={color}
            />
            <text
              x={hoveredPoint.x - 20}
              y={hoveredPoint.y + 5}
              textAnchor="start"
              alignmentBaseline="middle"
              fontSize="10"
              fill="#333"
              fontWeight="bold"
            >
              {unitPosition === "prefix" && unit}
              {Number.isFinite(hoveredPoint.value)
                ? unit === "€"
                  ? hoveredPoint.value.toFixed(2)
                  : hoveredPoint.value.toFixed(0)
                : "N/A"}
              {unitPosition === "suffix" && unit}
            </text>
            {hoveredPoint.previousValue != null && (
              <>
                <circle
                  cx={hoveredPoint.x - 30}
                  cy={hoveredPoint.y + 17}
                  r="2"
                  fill={lightColor}
                />
                <text
                  x={hoveredPoint.x - 20}
                  y={hoveredPoint.y + 17}
                  textAnchor="start"
                  alignmentBaseline="middle"
                  fontSize="8"
                  fill="#888"
                >
                  Prev: {unitPosition === "prefix" && unit}
                  {unit === "€"
                    ? Number(hoveredPoint.previousValue).toFixed(2)
                    : Number(hoveredPoint.previousValue).toFixed(0)}
                  {unitPosition === "suffix" && unit}
                </text>
              </>
            )}
          </>
        )}
      </svg>
    </div>
  );
}
