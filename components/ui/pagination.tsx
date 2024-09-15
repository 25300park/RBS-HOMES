import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const pageNumbers: any = [];

  // We will show the first page, last page, and 2 pages before/after the current page
  const pageLimit = 2; // How many pages to show before/after the current page

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || // Always show the first page
      i === totalPages || // Always show the last page
      (i >= currentPage - pageLimit && i <= currentPage + pageLimit) // Show pages near the current page
    ) {
      pageNumbers.push(i);
    }
  }

  // Render the pagination numbers with ellipses
  return (
    <div className="flex items-center justify-center space-x-2  text-sm">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 px-3 flex items-center gap-2 hover:bg-zinc-100 rounded"
      >
        {"〈"}
        <p>Previous</p>
      </button>

      {/* Render page numbers */}
      {pageNumbers.map((page: any, index: any) => (
        <React.Fragment key={page}>
          {index > 0 && pageNumbers[index - 1] !== page - 1 && (
            <span className="px-2">...</span>
          )}
          <button
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded ${
              page === currentPage
                ? "border bg-white"
                : "bg-white text-black hover:bg-zinc-100"
            } `}
          >
            {page}
          </button>
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
       className="h-8 px-3 flex items-center gap-2 hover:bg-zinc-100 rounded"
      >
        <p>Next</p>
        {"〉"}
      </button>
    </div>
  );
};

export default Pagination;
