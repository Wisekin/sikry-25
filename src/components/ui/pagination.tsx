"use client"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid"
import { Button } from "@/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  className = "",
}: PaginationProps) {
  // Calculate the range of items being displayed
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = startPage + maxPagesToShow - 1

    if (endPage > totalPages) {
      endPage = totalPages
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 ${className}`}>
      <div className="text-sm text-gray-500">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      <div className="flex items-center gap-2">
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Items per page:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
              <SelectTrigger className="w-16 h-8">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronDoubleLeftIcon className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>

          <div className="hidden sm:flex items-center gap-1 mx-2">
            {pageNumbers.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="h-8 w-8"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRightIcon className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronDoubleRightIcon className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
