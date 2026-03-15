import { Search, Filter, X, Accessibility, Baby, DollarSign, Users, CheckCircle, AlertTriangle, MapPinned } from 'lucide-react';
import { useState } from 'react';
import type { FilterOptions } from '../lib/types';

interface SearchFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  resultCount: number;
  totalCount: number;
  hasLocation: boolean;
}

export default function SearchFilter({ filters, onFilterChange, resultCount, totalCount, hasLocation }: SearchFilterProps) {
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
      nearbyOnly: false,
    });
  };

  const hasActiveFilters =
    filters.wheelchairAccessible || filters.babyChanging || filters.freeOnly ||
    filters.genderNeutral || filters.workingOnly || filters.verifiedOnly || filters.nearbyOnly;

  const filterButtons = [
    { key: 'workingOnly' as const, icon: CheckCircle, label: 'Open', color: 'green' },
    { key: 'freeOnly' as const, icon: DollarSign, label: 'Free', color: 'emerald' },
    ...(hasLocation ? [{ key: 'nearbyOnly' as const, icon: MapPinned, label: '<1km', color: 'purple' }] : []),
    { key: 'wheelchairAccessible' as const, icon: Accessibility, label: 'Accessible', color: 'blue' },
    { key: 'babyChanging' as const, icon: Baby, label: 'Baby', color: 'pink' },
    { key: 'genderNeutral' as const, icon: Users, label: 'Neutral', color: 'purple' },
    { key: 'verifiedOnly' as const, icon: AlertTriangle, label: 'Verified', color: 'amber' },
  ];

  const getActiveColor = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: '#dbeafe', text: '#1d4ed8' },
      pink: { bg: '#fce7f3', text: '#be185d' },
      green: { bg: '#dcfce7', text: '#15803d' },
      emerald: { bg: '#d1fae5', text: '#047857' },
      purple: { bg: '#f3e8ff', text: '#7c3aed' },
      amber: { bg: '#fef3c7', text: '#b45309' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="p-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search toilets..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="px-2.5 pb-2 flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
              {Object.entries(filters).filter(([k, v]) => k !== 'search' && v === true).length}
            </span>
          )}
        </button>
        <span className="text-xs text-gray-500">
          {resultCount === totalCount ? `${totalCount} locations` : `${resultCount} of ${totalCount}`}
        </span>
      </div>

      {showFilters && (
        <div className="px-2.5 pb-2.5 border-t border-gray-100 pt-2.5">
          <div className="flex flex-wrap gap-1.5">
            {filterButtons.map(({ key, icon: Icon, label, color }) => {
              const activeColor = getActiveColor(color);
              return (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    filters[key]
                      ? 'ring-1 ring-offset-1'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={filters[key] ? { backgroundColor: activeColor.bg, color: activeColor.text } : {}}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              );
            })}
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline">
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
