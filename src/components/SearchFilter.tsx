import { Search, Filter, X, Accessibility, Baby, DollarSign, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { FilterOptions } from '../lib/types';

interface SearchFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  resultCount: number;
  totalCount: number;
}

export default function SearchFilter({ filters, onFilterChange, resultCount, totalCount }: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const toggleFilter = (key: keyof Omit<FilterOptions, 'search'>) => {
    onFilterChange({ ...filters, [key]: !filters[key] });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      wheelchairAccessible: false,
      babyChanging: false,
      freeOnly: false,
      genderNeutral: false,
      workingOnly: false,
      verifiedOnly: false,
    });
  };

  const hasActiveFilters =
    filters.wheelchairAccessible ||
    filters.babyChanging ||
    filters.freeOnly ||
    filters.genderNeutral ||
    filters.workingOnly ||
    filters.verifiedOnly;

  const filterButtons = [
    { key: 'wheelchairAccessible' as const, icon: Accessibility, label: 'Wheelchair', color: 'blue' },
    { key: 'babyChanging' as const, icon: Baby, label: 'Baby Change', color: 'pink' },
    { key: 'freeOnly' as const, icon: DollarSign, label: 'Free', color: 'green' },
    { key: 'genderNeutral' as const, icon: Users, label: 'Gender Neutral', color: 'purple' },
    { key: 'workingOnly' as const, icon: CheckCircle, label: 'Working', color: 'emerald' },
    { key: 'verifiedOnly' as const, icon: AlertTriangle, label: 'Verified', color: 'amber' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Search Bar */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by name or address..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toggle & Results Count */}
      <div className="px-3 pb-2 flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {[filters.wheelchairAccessible, filters.babyChanging, filters.freeOnly, filters.genderNeutral, filters.workingOnly, filters.verifiedOnly].filter(Boolean).length}
            </span>
          )}
        </button>
        <span className="text-sm text-gray-500">
          {resultCount === totalCount
            ? `${totalCount} locations`
            : `${resultCount} of ${totalCount}`}
        </span>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-3">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(({ key, icon: Icon, label, color }) => (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filters[key]
                    ? `bg-${color}-100 text-${color}-700 ring-2 ring-${color}-500`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={filters[key] ? {
                  backgroundColor: color === 'blue' ? '#dbeafe' :
                                  color === 'pink' ? '#fce7f3' :
                                  color === 'green' ? '#dcfce7' :
                                  color === 'purple' ? '#f3e8ff' :
                                  color === 'emerald' ? '#d1fae5' :
                                  color === 'amber' ? '#fef3c7' : '#f3f4f6',
                  color: color === 'blue' ? '#1d4ed8' :
                        color === 'pink' ? '#be185d' :
                        color === 'green' ? '#15803d' :
                        color === 'purple' ? '#7c3aed' :
                        color === 'emerald' ? '#047857' :
                        color === 'amber' ? '#b45309' : '#4b5563'
                } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
