"use client";

import React, { useState, useMemo } from "react";
import {
  DataTableProps,
  DataTableAction,
  SortDirection,
} from "@/utils/types/data_table_props";
import { Button } from "./Button";
import {
  Search,
  Pencil,
  Trash2,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export function DataTable<T extends object = Record<string, unknown>>({
  data = [],
  columns = [],
  actions,
  keyExtractor,
  loading = false,
  emptyMessage = "ไม่พบข้อมูล",
  searchable = true,
  searchPlaceholder = "ค้นหาข้อมูล...",
  pageSize = 30,
  pageSizeOptions = [10, 20, 30, 50, 100],
  sortable = true,
  defaultSortKey,
  defaultSortDirection,
  className = "",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState<number | null>(null);

  // Sorting state
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    defaultSortDirection || null
  );

  const currentPageSize = userPageSize ?? pageSize;

  const handlePageSizeChange = (newSize: number) => {
    setUserPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSort = (colKey: string, isColumnSortable?: boolean) => {
    if (!sortable || isColumnSortable === false) return;

    if (sortKey === colKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortKey(colKey);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      return columns.some((col) => {
        const val = (item as Record<string, unknown>)[col.key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [data, columns, searchQuery]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortable || !sortKey || !sortDirection) {
      return filteredData;
    }

    const column = columns.find((c) => c.key === sortKey);
    const sorted = [...filteredData];

    sorted.sort((a, b) => {
      if (column?.sorter) {
        const res = column.sorter(a, b);
        return sortDirection === "asc" ? res : -res;
      }

      const recA = a as Record<string, unknown>;
      const recB = b as Record<string, unknown>;
      const valA = recA[sortKey];
      const valB = recB[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      // Handle numbers
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      // Handle dates
      if (
        (valA instanceof Date || typeof valA === "string") &&
        (valB instanceof Date || typeof valB === "string")
      ) {
        const timeA = new Date(valA as string | Date).getTime();
        const timeB = new Date(valB as string | Date).getTime();
        if (
          !isNaN(timeA) &&
          !isNaN(timeB) &&
          (String(valA).includes("-") || String(valA).includes("/"))
        ) {
          return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
        }
      }

      // Handle strings with Thai locale
      const strA = String(valA);
      const strB = String(valB);
      const cmp = strA.localeCompare(strB, "th", {
        numeric: true,
        sensitivity: "base",
      });
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [filteredData, sortable, sortKey, sortDirection, columns]);

  // Pagination calculation
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / currentPageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * currentPageSize;
    return sortedData.slice(start, start + currentPageSize);
  }, [sortedData, safeCurrentPage, currentPageSize]);

  // Page size options calculation
  const resolvedPageSizeOptions = useMemo(() => {
    const opts = Array.from(
      new Set([...pageSizeOptions, currentPageSize])
    ).sort((a, b) => a - b);
    return opts;
  }, [pageSizeOptions, currentPageSize]);

  // Determine row key
  const getRowKey = (record: T, index: number): string | number => {
    if (keyExtractor) return keyExtractor(record, index);
    const rec = record as Record<string, unknown>;
    if (typeof rec.id === "string" || typeof rec.id === "number") {
      return rec.id;
    }
    return index;
  };

  const hasActions = Boolean(
    actions &&
      (actions.onEdit ||
        actions.onDelete ||
        (actions.customActions && actions.customActions.length > 0))
  );

  return (
    <div
      className={`w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      {/* Table Toolbar */}
      {searchable && (
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 transition"
            />
          </div>

          <div className="text-xs text-slate-500 self-end sm:self-center">
            ทั้งหมด <span className="font-semibold text-slate-700">{totalItems}</span> รายการ
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, index) => {
                const isColumnSortable = sortable && col.sortable !== false;
                const isSorted = isColumnSortable && sortKey === col.key;

                return (
                  <th
                    key={String(col.key) || index}
                    style={{ width: col.width }}
                    onClick={() =>
                      isColumnSortable && handleSort(col.key, col.sortable)
                    }
                    className={`py-3.5 px-4 text-xs font-semibold tracking-wider uppercase transition-colors select-none ${
                      isColumnSortable
                        ? "cursor-pointer hover:bg-slate-100/80 group"
                        : ""
                    } ${
                      isSorted
                        ? "text-primary bg-primary-light/50"
                        : "text-slate-600"
                    } ${
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === "center"
                          ? "justify-center"
                          : col.align === "right"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <span>{col.header}</span>
                      {isColumnSortable && (
                        <span className="shrink-0 transition-colors">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-40 group-hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}

              {hasActions && (
                <th
                  style={{ width: actions?.width || "140px" }}
                  className={`py-3.5 px-4 text-xs font-semibold text-slate-600 tracking-wider uppercase ${
                    actions?.align === "left"
                      ? "text-left"
                      : actions?.align === "right"
                      ? "text-right"
                      : "text-center"
                  }`}
                >
                  {actions?.header || "จัดการ"}
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              // Loading state
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="py-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                    <span className="text-xs">กำลังโหลดข้อมูล...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="py-12 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-500">
                      {emptyMessage}
                    </p>
                    {searchQuery && (
                      <p className="text-xs text-slate-400">
                        ไม่พบข้อมูลที่ตรงกับคำค้นหา &quot;{searchQuery}&quot;
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              // Rows
              paginatedData.map((record, rowIndex) => {
                const globalIndex =
                  (safeCurrentPage - 1) * currentPageSize + rowIndex;
                const rowKey = getRowKey(record, globalIndex);

                return (
                  <tr
                    key={rowKey}
                    className="hover:bg-slate-50/80 transition-colors text-sm text-slate-700"
                  >
                    {columns.map((col, colIndex) => {
                      const value = (record as Record<string, unknown>)[
                        col.key
                      ];
                      const renderedContent = col.render
                        ? col.render(value, record, globalIndex)
                        : (value !== null && value !== undefined
                        ? String(value)
                        : "-");

                      return (
                        <td
                          key={String(col.key) || colIndex}
                          className={`py-3.5 px-4 ${
                            col.align === "center"
                              ? "text-center"
                              : col.align === "right"
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {renderedContent}
                        </td>
                      );
                    })}

                    {hasActions && (
                      <td className="py-3 px-4">
                        <div
                          className={`flex items-center gap-1.5 ${
                            actions?.align === "left"
                              ? "justify-start"
                              : actions?.align === "right"
                              ? "justify-end"
                              : "justify-center"
                          }`}
                        >
                          {/* Built-in Edit Button */}
                          {actions?.onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={
                                actions.isEditDisabled
                                  ? actions.isEditDisabled(record, globalIndex)
                                  : false
                              }
                              className="p-1.5! text-slate-600 hover:text-primary hover:bg-primary-light rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                              title={actions.editLabel || "แก้ไขข้อมูล"}
                              onClick={() => actions.onEdit!(record, globalIndex)}
                              icon={<Pencil className="w-4 h-4" />}
                            />
                          )}

                          {/* Built-in Delete Button */}
                          {actions?.onDelete && (() => {
                            const isDeleteDisabled = actions.isDeleteDisabled
                              ? actions.isDeleteDisabled(record, globalIndex)
                              : false;

                            return (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isDeleteDisabled}
                                className="p-1.5! text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                title={
                                  isDeleteDisabled
                                    ? "ไม่สามารถลบบัญชี Superadmin ได้"
                                    : actions.deleteLabel || "ลบข้อมูล"
                                }
                                onClick={() =>
                                  !isDeleteDisabled &&
                                  actions.onDelete!(record, globalIndex)
                                }
                                icon={<Trash2 className="w-4 h-4" />}
                              />
                            );
                          })()}

                          {/* Custom Action Buttons */}
                          {actions?.customActions?.map((customAction: DataTableAction<T>) => {
                            if (
                              customAction.show &&
                              !customAction.show(record, globalIndex)
                            ) {
                              return null;
                            }

                            const isActionDisabled = customAction.disabled
                              ? customAction.disabled(record, globalIndex)
                              : false;

                            return (
                              <Button
                                key={customAction.name}
                                variant={customAction.variant || "ghost"}
                                size="sm"
                                disabled={isActionDisabled}
                                className={customAction.className || "p-1.5!"}
                                title={customAction.label}
                                onClick={() =>
                                  customAction.onClick(record, globalIndex)
                                }
                                text={customAction.label}
                                icon={customAction.icon}
                              />
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="py-3 px-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              แสดง {(safeCurrentPage - 1) * currentPageSize + 1} ถึง{" "}
              {Math.min(safeCurrentPage * currentPageSize, totalItems)} จากทั้งหมด{" "}
              <span className="font-semibold text-slate-700">{totalItems}</span>{" "}
              รายการ
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="data-table-page-size" className="text-slate-500">
                แสดงหน้าละ:
              </label>
              <select
                id="data-table-page-size"
                value={currentPageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-8 px-2 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition"
              >
                {resolvedPageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} รายการ
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-md border border-slate-200 enabled:hover:bg-slate-50 enabled:hover:text-slate-800 disabled:opacity-40 enabled:cursor-pointer disabled:cursor-not-allowed transition"
              aria-label="Previous Page"
              title="หน้าก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-medium text-slate-700">
              หน้า {safeCurrentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-md border border-slate-200 enabled:hover:bg-slate-50 enabled:hover:text-slate-800 disabled:opacity-40 enabled:cursor-pointer disabled:cursor-not-allowed transition"
              aria-label="Next Page"
              title="หน้าถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
