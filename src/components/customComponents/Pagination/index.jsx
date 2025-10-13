
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // Number of page links to show directly (e.g., 1 ... 4 5 6 ... 10)
    const half = Math.floor(maxPagesToShow / 2)

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= half + 1) {
        // Near the beginning
        for (let i = 1; i <= maxPagesToShow - 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("ellipsis", totalPages)
      } else if (currentPage >= totalPages - half) {
        // Near the end
        pageNumbers.push(1, "ellipsis")
        for (let i = totalPages - (maxPagesToShow - 2); i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        // In the middle
        pageNumbers.push(1, "ellipsis")
        for (let i = currentPage - half + 1; i <= currentPage + half - 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("ellipsis", totalPages)
      }
    }
    return pageNumbers
  }



  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="w-2/4 text-xs text-zinc-700">
        Showing <span className="text-zinc-900">{startItem}</span> to <span className="text-zinc-900">{endItem}</span> of <span className="text-zinc-900">{totalItems}</span> entries
      </div>
      <UIPagination className={'ml-auto justify-end'}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
          </PaginationItem>

          {getPageNumbers().map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          </PaginationItem>
        </PaginationContent>
      </UIPagination>
    </div>
  )
}
