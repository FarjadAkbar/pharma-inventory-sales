"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Search, MoreHorizontal, Trash2, Edit, Eye } from "lucide-react"
import { useDebounce } from "@/lib/debounce"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface ActionButton<T> {
  label: string
  icon?: React.ReactNode
  onClick: (item: T) => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  disabled?: (item: T) => boolean
  hidden?: (item: T) => boolean
}

interface BulkAction<T> {
  label: string
  icon?: React.ReactNode
  onClick: (items: T[]) => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  disabled?: (items: T[]) => boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  pagination?: {
    page: number
    pages: number
    total: number
    onPageChange: (page: number) => void
  }
  actions?: ActionButton<T>[]
  bulkActions?: BulkAction<T>[]
  loading?: boolean
  selectable?: boolean
  onSelectionChange?: (selectedItems: T[]) => void
  getItemId?: (item: T) => string | number
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Search...",
  onSearch,
  pagination,
  actions = [],
  bulkActions = [],
  loading = false,
  selectable = false,
  onSelectionChange,
  getItemId = (item) => item.id || item.key,
  emptyMessage = "No data found",
  className = "",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<T[]>([])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)
  const debouncedSearch = useDebounce(searchQuery, 300)

  const onSearchRef = useRef(onSearch)
  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    if (onSearchRef.current) {
      onSearchRef.current(debouncedSearch)
    }
  }, [debouncedSearch])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems([...data])
      onSelectionChange?.(data)
    } else {
      setSelectedItems([])
      onSelectionChange?.([])
    }
  }

  const handleSelectItem = (item: T, checked: boolean) => {
    let newSelection: T[]
    if (checked) {
      newSelection = [...selectedItems, item]
    } else {
      newSelection = selectedItems.filter(selected => getItemId(selected) !== getItemId(item))
    }
    setSelectedItems(newSelection)
    onSelectionChange?.(newSelection)
  }

  const isItemSelected = (item: T) => {
    return selectedItems.some(selected => getItemId(selected) === getItemId(item))
  }

  const isAllSelected = data.length > 0 && selectedItems.length === data.length

  const handleActionClick = (action: ActionButton<T>, item: T) => {
    if (action.disabled && action.disabled(item)) return
    action.onClick(item)
  }

  const handleBulkActionClick = (action: BulkAction<T>) => {
    if (action.disabled && action.disabled(selectedItems)) return
    action.onClick(selectedItems)
  }

  const handleDeleteClick = (item: T) => {
    setItemToDelete(item)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      const deleteAction = actions.find(action => action.label.toLowerCase().includes('delete'))
      if (deleteAction) {
        deleteAction.onClick(itemToDelete)
      }
    }
    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }

  const renderActions = (item: T) => {
    if (!Array.isArray(actions) || actions.length === 0) return null

    const visibleActions = actions.filter(action => !(action.hidden && action.hidden(item)))
    
    if (visibleActions.length === 0) return null

    if (visibleActions.length === 1) {
      const action = visibleActions[0]
      return (
        <Button
          variant={action.variant || "outline"}
          size="sm"
          onClick={() => handleActionClick(action, item)}
          disabled={action.disabled?.(item)}
        >
          {action.icon}
          {action.label}
        </Button>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {visibleActions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => handleActionClick(action, item)}
              disabled={action.disabled?.(item)}
              className={action.variant === "destructive" ? "text-destructive" : ""}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Bulk Actions */}
      <div className="flex items-center justify-between">
        {onSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        
        {Array.isArray(bulkActions) && bulkActions.length > 0 && selectedItems.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedItems.length} selected
            </span>
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => handleBulkActionClick(action)}
                disabled={action.disabled?.(selectedItems)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead 
                  key={column.key as string}
                  style={{ width: column.width }}
                  className={column.sortable ? "cursor-pointer hover:bg-muted/50" : ""}
                >
                  {column.header}
                </TableHead>
              ))}
              {Array.isArray(actions) && actions.length > 0 && <TableHead className="w-12">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (Array.isArray(actions) && actions.length > 0 ? 1 : 0)} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (Array.isArray(actions) && actions.length > 0 ? 1 : 0)} className="text-center py-8">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={getItemId(item) || index}>
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={isItemSelected(item)}
                        onCheckedChange={(checked) => handleSelectItem(item, checked as boolean)}
                        aria-label={`Select ${getItemId(item)}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key as string}>
                      {column.render ? column.render(item) : item[column.key as keyof T]}
                    </TableCell>
                  ))}
                  {Array.isArray(actions) && actions.length > 0 && (
                    <TableCell>
                      {renderActions(item)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((pagination.page - 1) * 10 + 1, pagination.total)} to{" "}
            {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the selected item.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
