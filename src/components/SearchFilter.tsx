import { Search, SlidersHorizontal, X, Accessibility, Baby, DollarSign, Users, CheckCircle, ShieldCheck, MapPinned } from 'lucide-react';
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
      search: '', wheelchairAccessible: false, babyChanging: false, freeOnly: false,
      genderNeutral: false, workingOnly: false, verifiedOnly: false, nearbyOnly: false,
    });
  };

  const hasActiveFilters =
    filters.wheelchairAccessible || filters.babyChanging || filters.freeOnly ||
    filters.genderNeutral || filters.workingOnly || filters.verifiedOnly || filters.nearbyOnly;

  const filterButtons = [
    { key: 'workingOnly' as const, icon: CheckCircle, label: 'Open', activeBg: '#dcfce7', activeText: '#15803d' },
    { key: 'freeOnly' as const, icon: DollarSign, label: 'Free', activeBg: '#d1fae5', activeText: '#047857' },
    ...(hasLocation ? [{ key: 'nearbyOnly' as const, icon: MapPinned, label: 'Near me', activeBg: '#f3e8ff', activeText: '#7c3aed' }] : []),
    { key: 'wheelchairAccessible' as const, icon: Accessibility, label: 'Accessible', activeBg: '#dbeafe', activeText: '#1d4ed8' },
    { key: 'babyChanging' as const, icon: Baby, label: 'Baby', activeBg: '#fce7f3', activeText: '#be185d' },
    { key: 'genderNeutral' as const, icon: Users, label: 'Neutral', activeBg: '#f3e8ff', activeText: '#7c3aed' },
    { key: 'verifiedOnly' as const, icon: ShieldCheck, label: 'Verified', activeBg: '#fef3c7', activeText: '#b45309' },
  ];

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by name, address..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all text-sm"
          />
          {filters.search && (
            <button onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <div className="px-3 pb-2.5 flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {hasActiveFilters && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none ${
              showFilters || hasActiveFilters ? 'bg-white/25 text-white' : 'bg-blue-600 text-white'
            }`}>
              {Object.entries(filters).filter(([k, v]) => k !== 'search' && v === true).length}
            </span>
          )}
        </button>
        <span className="text-xs text-gray-400 font-medium">
          {resultCount === totalCount ? `${totalCount} locations` : `${resultCount} of ${totalCount}`}
        </span>
      </div>

      {showFilters && (
        <div className="px-3 pb-3 border-t border-gray-50 pt-3">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(({ key, icon: Icon, label, activeBg, activeText }) => (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  filters[key]
                    ? 'border-transparent shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                style={filters[key] ? { backgroundColor: activeBg, color: activeText } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-2.5 text-xs text-gray-400 hover:text-gray-600 font-medium">
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
