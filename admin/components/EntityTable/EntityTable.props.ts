import type { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
}

export interface EntityTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  search: string;
  page: number;
  totalPages: number;
  total: number;
  onSearch: (value: string) => void;
  onPage: (page: number) => void;
}
