export type { KpiDatum } from "@/components/ui/KpiTile";

export type ChartDatum = {
  label: string;
  value: number;
};

export type DonutDatum = ChartDatum & {
  color: string;
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
