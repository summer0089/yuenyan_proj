import React from "react";
import { ButtonVariant } from "./button_props";

export type SortDirection = "asc" | "desc" | null;

export interface DataTableColumn<T = object> {
  key: string;
  header: React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  sorter?: (a: T, b: T) => number;
}

export interface DataTableAction<T = object> {
  name: string;
  label?: string;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick: (record: T, index: number) => void;
  show?: (record: T, index: number) => boolean;
  disabled?: (record: T, index: number) => boolean;
}

export interface DataTableActionOptions<T = object> {
  header?: React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  onEdit?: (record: T, index: number) => void;
  onDelete?: (record: T, index: number) => void;
  editLabel?: string;
  deleteLabel?: string;
  customActions?: DataTableAction<T>[];
  isDeleteDisabled?: (record: T, index: number) => boolean;
  isEditDisabled?: (record: T, index: number) => boolean;
}

export interface DataTableProps<T = object> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableActionOptions<T>;
  keyExtractor?: (record: T, index: number) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  sortable?: boolean;
  defaultSortKey?: string;
  defaultSortDirection?: "asc" | "desc";
  className?: string;
}
