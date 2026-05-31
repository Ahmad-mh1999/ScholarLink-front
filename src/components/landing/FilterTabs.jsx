import React from 'react';

const FilterTabs = ({ activeFilter, onFilterChange }) => {
  const filters = ['All', 'This Week', 'This Month'];

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-12">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeFilter === filter
              ? 'bg-[#319795] text-white shadow-lg shadow-teal-500/30'
              : 'bg-white text-[#2D3748] border border-gray-200 hover:border-[#319795] hover:text-[#319795]'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
