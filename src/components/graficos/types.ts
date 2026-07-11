export type ChartDatum = {
  label: string;
  value: number;
};

export type DonutDatum = ChartDatum & {
  color: string;
};
