// src/components/KPICard.jsx
import React from "react";
import LineGraph from "./LineGraph";

export default function KPICard({
  title,
  value,
  unit,
  unitPosition,
  trend,
  currentData = [],
  previousData = [],
  days = [], // optional
  previousDays = [], // optional
  color = "#8525b2",
  lightColor = "#e2ceed",
  timePeriod = "30d",
}) {
  const trendColor =
    typeof trend === "number"
      ? trend >= 0
        ? "text-green-600"
        : "text-red-600"
      : "text-gray-500";
  const trendLabel =
    typeof trend === "number"
      ? `${trend > 0 ? "+" : ""}${trend.toFixed(1)}%`
      : "";

  return (
    <div className="p-4 bg-white rounded-xl shadow border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {unitPosition === "prefix" && unit}
            {value}
            {unitPosition === "suffix" && unit}
          </div>
        </div>
        <div className={`text-xs ${trendColor}`}>{trendLabel}</div>
      </div>

      <LineGraph
        currentData={currentData}
        previousData={previousData}
        days={days}
        previousDays={previousDays}
        color={color}
        lightColor={lightColor}
        unit={unit}
        unitPosition={unitPosition}
        timePeriod={timePeriod} // '7d' or '30d'
      />
    </div>
  );
}
