import type { LucideIcon } from "lucide-react";

export type ChartDatum = {
  label: string;
  value: number;
};

export type DonutDatum = ChartDatum & {
  color: string;
};

export type KpiDatum = {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  deltaLabel?: string;
  trend?: "up" | "down";
};

export type RankedDatum = {
  label: string;
  value: number;
  valueLabel: string;
};

export type StackedSeriesDatum = {
  label: string;
  segments: { key: string; value: number }[];
};

export type StackedSeriesLegend = {
  key: string;
  label: string;
  color: string;
};
