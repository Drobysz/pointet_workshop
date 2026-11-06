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

export default function SalesChart({ data }: { data: AnalyticsPoint[] }) {
  const t = useTranslations("dashboard");
  const { formatAnalyticsBucket, formatCurrency, formatNumber } = useAppFormatters();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid stroke="#e8e8ed" vertical={false} />
        <XAxis
          dataKey="bucket"
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => formatAnalyticsBucket(String(value))}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => formatNumber(Number(value))}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          labelFormatter={(label) => formatAnalyticsBucket(String(label))}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name={t("revenue")}
          stroke="#0071e3"
          strokeWidth={2}
          fill="#0071e3"
          fillOpacity={0.12}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
