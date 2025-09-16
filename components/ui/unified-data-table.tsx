"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Download, 
  RefreshCw,
  Settings,
  MoreHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterOption {
  key: string
  label: string
  type: 'select' | 'date' | 'text' | 'number' | 'boolean'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

interface Column {
  key: string
  header: string
  render?: (item: any) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
}

interface UnifiedDataTableProps {
  data: any[]
  columns: Column[]
  loading?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearch?: (value: string) => void
  filters?: FilterOption[]
  onFiltersChange?: (filters: Record<string, any>) => void
  pagination?: {
    page: number
    pages: number
    total: number
    onPageChange: (page: number) => void
  }
  actions?: (item: any) => React.ReactNode
  bulkActions?: {
    label: string
    action: (selectedItems: any[]) => void
    icon?: React.ComponentType<{ className?: string }>
  }[]
  onRefresh?: () => void
  onExport?: () => void
  className?: string
  emptyMessage?: string
  showSearch?: boolean
  showFilters?: boolean
  showBulkActions?: boolean
  showRefresh?: boolean
  showExport?: boolean
  showSettings?: boolean
}

export function UnifiedDataTable({
  data,
  columns,
  loading = false,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearch,
  filters = [],
  onFiltersChange,
  pagination,
  actions,
  bulkActions = [],
  onRefresh,
  onExport,
  className,
  emptyMessage = "No data available",
  showSearch = true,
  showFilters = true,
  showBulkActions = true,
  showRefresh = true,
  showExport = true,
  showSettings = true,
}: UnifiedDataTableProps) {
  const [search, setSearch] = useState(searchValue)
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (search && onSearch) {
      onSearch(search)
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        result = result.filter(item => {
          const itemValue = item[key]
          if (typeof value === 'string') {
            return itemValue?.toString().toLowerCase().includes(value.toLowerCase())
          }
          return itemValue === value
        })
      }
    })

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [data, search, activeFilters, sortConfig])

  const handleSearch = (value: string) => {
    setSearch(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value }
    setActiveFilters(newFilters)
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  const clearFilter = (key: string) => {
    const newFilters = { ...activeFilters }
    delete newFilters[key]
    setActiveFilters(newFilters)
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    if (onFiltersChange) {
      onFiltersChange({})
    }
  }

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredData.map((_, index) => index.toString())))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (index: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(index)
    } else {
      newSelected.delete(index)
    }
    setSelectedItems(newSelected)
  }

  const getActiveFiltersCount = () => {
    return Object.values(activeFilters).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length
  }

  const renderFilterDropdown = () => {
    if (filters.length === 0) return null

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel>Advanced Filters</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {filters.map((filter) => (
            <div key={filter.key} className="p-3 space-y-2">
              <label className="text-sm font-medium">{filter.label}</label>
              
              {filter.type === 'select' && filter.options && (
                <select
                  className="w-full p-2 border rounded-md text-sm"
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              
              {filter.type === 'text' && (
                <Input
                  placeholder={filter.placeholder || `Filter by ${filter.label}`}
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="text-sm"
                />
              )}
              
              {filter.type === 'date' && (
                <Input
                  type="date"
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="text-sm"
                />
              )}
              
              {filter.type === 'number' && (
                <Input
                  type="number"
                  placeholder={filter.placeholder || `Filter by ${filter.label}`}
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="text-sm"
                />
              )}
              
              {filter.type === 'boolean' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={filter.key}
                    checked={activeFilters[filter.key] || false}
                    onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor={filter.key} className="text-sm">
                    {filter.label}
                  </label>
                </div>
              )}
            </div>
          ))}
          
          <DropdownMenuSeparator />
          <div className="p-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const renderBulkActions = () => {
    if (bulkActions.length === 0 || selectedItems.size === 0) return null

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {selectedItems.size} selected
        </span>
        {bulkActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => action.action(Array.from(selectedItems).map(i => filteredData[parseInt(i)]))}
          >
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        ))}
      </div>
    )
  }

  const renderPagination = () => {
    if (!pagination) return null

    const { page, pages, total, onPageChange } = pagination

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
          >
            Next
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {showSearch && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            
            {showFilters && renderFilterDropdown()}
            
            {getActiveFiltersCount() > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} active
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {showRefresh && onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {showExport && onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            {showSettings && (
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {renderBulkActions()}
      </CardHeader>
      
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">{emptyMessage}</div>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {showBulkActions && (
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === filteredData.length && filteredData.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </TableHead>
                  )}
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        column.sortable && "cursor-pointer hover:bg-muted/50",
                        column.width && `w-[${column.width}]`
                      )}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.header}
                        {column.sortable && (
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-transform",
                            sortConfig?.key === column.key && sortConfig.direction === 'asc' && "rotate-180"
                          )} />
                        )}
                      </div>
                    </TableHead>
                  ))}
                  {actions && <TableHead className="w-12">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={index}>
                    {showBulkActions && (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(index.toString())}
                          onChange={(e) => handleSelectItem(index.toString(), e.target.checked)}
                          className="rounded"
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render ? column.render(item) : item[column.key]}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {actions(item)}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {renderPagination()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
