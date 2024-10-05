import { useState } from "react";
import { useStateContext } from "@/context/contextProvider";

const calculateTotalPages = (totalItems, itemsPerPage) => {
  return Math.ceil(totalItems / itemsPerPage);
};

const usePagination = ({ totalItems, itemsPerPage }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = calculateTotalPages(totalItems, itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return {
    currentPage,
    totalPages,
    handlePageChange,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: currentPage * itemsPerPage,
  };
};

export default function Pagination({ data = [], filteredData = [], itemsPerPage = 20, renderItem, visible = true, hidePage = false, className = '' }) {
  const { theme } = useStateContext();
  const effectiveData = filteredData.length > 0 ? filteredData : data;
  const { currentPage, totalPages, handlePageChange, startIndex, endIndex } = usePagination({
    totalItems: effectiveData.length,
    itemsPerPage,
  });

  const currentData = effectiveData.slice(startIndex, endIndex);

  // Adjust page range display to show only 20 pages
  const maxPageButtons = 1;

  // Ensure the displayed page numbers always include 20 items
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = startPage + maxPageButtons - 1;

  // If endPage exceeds totalPages, adjust startPage so that we still display 20 pages
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  return (
    <div className={'relative w-full h-full flex flex-col ' + className}>
      <div className={`items-container ${visible ? '' : 'hidden'}`}>
        {currentData.map((item, index) => renderItem(item, index))}
      </div>

      <div
        style={{ outlineColor: theme?.border }}
        className={`flex bottom-4 md:w-fit w-full self-end ${hidePage ? 'hidden' : ''}`}
      >
        {/* Previous Button */}
        <button
          
          className='p-2 rounded-l-md'
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          {'<'}
        </button>

        {/* First Page Button */}
        <button
          
          className='p-2'
          onClick={() => handlePageChange(1)}
        >
          {'<<'}
        </button>

        {/* Render page numbers within the adjusted range */}
        {[...Array(endPage - startPage + 1).keys()].map((_, index) => {
          const pageNumber = startPage + index;
          return (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className='md:w-10 w-0 flex-1 md:flex-none'
              
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Last Page Button */}
        <button
          
          className='p-2'
          onClick={() => handlePageChange(totalPages)}
        >
          {'>>'}
        </button>

        {/* Next Button */}
        <button
          
          className='p-2 rounded-r-md'
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};
