"use client";

import { useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppFormatters } from "@/hooks";
import type { AnalyticsPoint } from "@/interface/domain";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e4e4e7",
  boxShadow: "0 0 30px -14px rgba(0, 0, 0, 0.35)",
  fontSize: 13,
};

export default function SalesChart({ data }: { data: AnalyticsPoint[] }) {
  const t = useTranslations("dashboard");
  const { formatAnalyticsBucket, formatCurrency, formatNumber } = useAppFormatters();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#fecaca" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e4e4e7" vertical={false} />
        <XAxis
          dataKey="bucket"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#71717a", fontSize: 12 }}
          tickFormatter={(value) => formatAnalyticsBucket(String(value))}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={56}
          tick={{ fill: "#71717a", fontSize: 12 }}
          tickFormatter={(value) => formatNumber(Number(value))}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ stroke: "#fca5a5", strokeWidth: 1 }}
          formatter={(value) => formatCurrency(Number(value))}
          labelFormatter={(label) => formatAnalyticsBucket(String(label))}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name={t("revenue")}
          stroke="#dc2626"
          strokeWidth={2}
          fill="url(#sales-fill)"
          activeDot={{ r: 5, fill: "#dc2626", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
