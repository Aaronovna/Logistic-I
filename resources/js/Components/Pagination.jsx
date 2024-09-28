import { useState } from "react";

import { useStateContext } from "@/context/contextProvider";

const usePagination = ({ totalItems, itemsPerPage }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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

export default function Pagination({ data = [], filteredData = [], itemsPerPage = 20, renderItem, visible = true, hidePage = false }) {
  const {theme} = useStateContext();
  
  const effectiveData = filteredData.length > 0 ? filteredData : data;
  const { currentPage, totalPages, handlePageChange, startIndex, endIndex } = usePagination({
    totalItems: effectiveData.length,
    itemsPerPage,
  });

  const currentData = effectiveData.slice(startIndex, endIndex);

  return (
    <div className={`pagination relative`}>
      <div className={`items-container ${visible ? '' : 'hidden'}`}>
        {currentData.map((item, index) => renderItem(item, index))}
      </div>

      <div
        style={{ outlineColor: theme?.border }}
        className={`w-full flex outline-card bottom-4 sticky ml-auto backdrop-blur-sm ${hidePage ? 'hidden' : ''}`}
      >
        <button
          style={{ background: theme?.accent, color: theme?.background }}
          className='p-2 rounded-l-md'
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          {'<'}
        </button>
        <button
          style={{ background: theme?.accent, color: theme?.background }}
          className='p-2'
          onClick={() => handlePageChange(1)}
        >
          {'<<'}
        </button>

        {[...Array(totalPages).keys()].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className='flex-1'
              style={{
                background: currentPage === pageNumber ? theme?.secondary : theme?.blur,
                color: theme?.text,
              }}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          style={{ background: theme?.accent, color: theme?.background }}
          className='p-2'
          onClick={() => handlePageChange(totalPages)}
        >
          {'>>'}
        </button>
        <button
          style={{ background: theme?.accent, color: theme?.background }}
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