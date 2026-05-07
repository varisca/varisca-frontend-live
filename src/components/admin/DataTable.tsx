import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, Search, X,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ─── Types ──────────────────────────────────────────────────────────

export interface Column<T> {
  key: string;
  header: string;
  /** Render cell contents */
  render?: (row: T) => React.ReactNode;
  /** Value used for sorting (defaults to row[key]) */
  sortValue?: (row: T) => string | number;
  /** Whether sorted by default and in what direction */
  sortable?: boolean;
  /** Minimum width */
  minWidth?: number;
  /** Align */
  align?: 'left' | 'center' | 'right';
  /** Hidden */
  hidden?: boolean;
}

export interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
  onClick: (selectedIds: string[]) => void;
  /** If set, show this message in a confirmation dialog before calling onClick */
  confirmMessage?: string;
  confirmTitle?: string;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  /** Unique ID accessor (defaults to row.id) */
  idAccessor?: (row: T) => string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Fields to search on. If not provided search searches across all rendered column keys */
  searchFields?: (keyof T)[];
  /** Bulk actions shown when rows are selected */
  bulkActions?: BulkAction[];
  /** Page size options */
  pageSizeOptions?: number[];
  /** Default page size */
  defaultPageSize?: number;
  /** Called when a row is clicked */
  onRowClick?: (row: T) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state icon */
  emptyIcon?: React.ReactNode;
  /** Whether to show the search bar */
  searchable?: boolean;
  /** Extra header actions (e.g. export button) */
  headerActions?: React.ReactNode;
  /** Whether to enable row selection */
  selectable?: boolean;
  /** CSS class for the wrapper */
  className?: string;
  /** Row class getter */
  rowClassName?: (row: T) => string;
}

// ─── Component ──────────────────────────────────────────────────────

export function DataTable<T extends { id: string }>({
  data,
  columns,
  idAccessor,
  searchPlaceholder = 'Search...',
  searchFields,
  bulkActions,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,
  onRowClick,
  emptyMessage = 'No data found.',
  emptyIcon,
  searchable = true,
  headerActions,
  selectable = true,
  className,
  rowClassName,
}: DataTableProps<T>) {
  const getId = useCallback(
    (row: T) => (idAccessor ? idAccessor(row) : row.id),
    [idAccessor],
  );

  // ─── State ─────────────────────────────────────
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingBulk, setPendingBulk] = useState<{ action: BulkAction; ids: string[] } | null>(null);

  const visibleColumns = useMemo(
    () => columns.filter(c => !c.hidden),
    [columns],
  );

  // ─── Filtered Data ─────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row => {
      if (searchFields) {
        return searchFields.some(f => {
          const val = row[f];
          return val != null && String(val).toLowerCase().includes(q);
        });
      }
      // Default: search across all visible column keys
      return visibleColumns.some(col => {
        const val = (row as any)[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      });
    });
  }, [data, search, searchFields, visibleColumns]);

  // ─── Sorted Data ───────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = visibleColumns.find(c => c.key === sortKey);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const valA = col.sortValue ? col.sortValue(a) : (a as any)[col.key] ?? '';
      const valB = col.sortValue ? col.sortValue(b) : (b as any)[col.key] ?? '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filtered, sortKey, sortDir, visibleColumns]);

  // ─── Pagination ────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginated = sorted.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  // Reset to page 1 on search/filter change
  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handlePageSizeChange = (val: string) => {
    setPageSize(Number(val));
    setCurrentPage(1);
  };

  // ─── Sort handler ──────────────────────────────
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // ─── Selection ─────────────────────────────────
  const allOnPageSelected = paginated.length > 0 && paginated.every(r => selectedIds.has(getId(r)));

  const toggleAll = () => {
    if (allOnPageSelected) {
      const newSet = new Set(selectedIds);
      paginated.forEach(r => newSet.delete(getId(r)));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      paginated.forEach(r => newSet.add(getId(r)));
      setSelectedIds(newSet);
    }
  };

  const toggleRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // ─── Render ────────────────────────────────────
  const SortIcon = ({ col }: { col: Column<T> }) => {
    if (col.sortable === false) return null;
    if (sortKey !== col.key) return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3.5 w-3.5 text-primary" />
      : <ChevronDown className="h-3.5 w-3.5 text-primary" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* ─── Toolbar ──────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {searchable && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="pl-9 pr-8"
            />
            {search && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        {/* Bulk actions bar */}
        {selectable && selectedIds.size > 0 && bulkActions && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-1.5">
            <span className="text-sm font-medium text-primary">
              {selectedIds.size} selected
            </span>
            {bulkActions.map((action, i) => (
              <Button
                key={i}
                size="sm"
                variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                className="h-7 text-xs"
                onClick={() => {
                  const ids = Array.from(selectedIds);
                  if (action.confirmMessage) {
                    setPendingBulk({ action, ids });
                  } else {
                    action.onClick(ids);
                    setSelectedIds(new Set());
                  }
                }}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {headerActions}
        </div>
      </div>

      {/* ─── Table ────────────────────────────────── */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {selectable && (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={allOnPageSelected && paginated.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                )}
                {visibleColumns.map(col => (
                  <TableHead
                    key={col.key}
                    style={{ minWidth: col.minWidth }}
                    className={cn(
                      'whitespace-nowrap select-none',
                      col.sortable !== false && 'cursor-pointer hover:text-foreground transition-colors',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                    )}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div className={cn(
                      'flex items-center gap-1.5',
                      col.align === 'center' && 'justify-center',
                      col.align === 'right' && 'justify-end',
                    )}>
                      {col.header}
                      {col.sortable !== false && <SortIcon col={col} />}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + (selectable ? 1 : 0)}>
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      {emptyIcon && <div className="mb-3 opacity-40">{emptyIcon}</div>}
                      <p className="text-sm">{emptyMessage}</p>
                      {search && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleSearch('')}
                          className="mt-2"
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(row => {
                  const id = getId(row);
                  return (
                    <TableRow
                      key={id}
                      className={cn(
                        'group transition-colors',
                        onRowClick && 'cursor-pointer',
                        selectedIds.has(id) && 'bg-primary/5',
                        rowClassName?.(row),
                      )}
                      onClick={(e) => {
                        // Don't trigger row click if clicking checkbox
                        if ((e.target as HTMLElement).closest('[role="checkbox"]')) return;
                        onRowClick?.(row);
                      }}
                    >
                      {selectable && (
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(id)}
                            onCheckedChange={() => toggleRow(id)}
                          />
                        </TableCell>
                      )}
                      {visibleColumns.map(col => (
                        <TableCell
                          key={col.key}
                          className={cn(
                            col.align === 'center' && 'text-center',
                            col.align === 'right' && 'text-right',
                          )}
                        >
                          {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ─── Pagination ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(s => (
                <SelectItem key={s} value={String(s)}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="hidden sm:inline">
            · Showing {sorted.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, sorted.length)} of {sorted.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {/* Page numbers */}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let page: number;
            if (totalPages <= 5) {
              page = i + 1;
            } else if (safeCurrentPage <= 3) {
              page = i + 1;
            } else if (safeCurrentPage >= totalPages - 2) {
              page = totalPages - 4 + i;
            } else {
              page = safeCurrentPage - 2 + i;
            }
            return (
              <Button
                key={page}
                variant={safeCurrentPage === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete / destructive action confirmation */}
      <AlertDialog open={!!pendingBulk} onOpenChange={(open) => !open && setPendingBulk(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingBulk?.action.confirmTitle ?? 'Confirm'}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingBulk?.action.confirmMessage ?? 'Are you sure you want to continue?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingBulk) {
                  pendingBulk.action.onClick(pendingBulk.ids);
                  setSelectedIds(new Set());
                  setPendingBulk(null);
                }
              }}
            >
              {pendingBulk?.action.label ?? 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
