import React from 'react';
import { SlidersHorizontal, Star, Clock, Tag, ArrowUpDown, X } from 'lucide-react';

interface FiltersBarProps {
  restaurantCount: number;
  isVegOnly: boolean;
  onToggleVegOnly: () => void;
  minRating: number | null;
  onSelectMinRating: (rating: number | null) => void;
  maxDeliveryTime: number | null;
  onSelectMaxDeliveryTime: (mins: number | null) => void;
  hasOffersOnly: boolean;
  onToggleHasOffersOnly: () => void;
  sortBy: string;
  onSelectSortBy: (sort: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  restaurantCount,
  isVegOnly,
  onToggleVegOnly,
  minRating,
  onSelectMinRating,
  maxDeliveryTime,
  onSelectMaxDeliveryTime,
  hasOffersOnly,
  onToggleHasOffersOnly,
  sortBy,
  onSelectSortBy,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="py-4 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Count & Quick Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none no-scrollbar">
            <span className="text-sm font-bold text-gray-800 whitespace-nowrap mr-1">
              {restaurantCount} {restaurantCount === 1 ? 'Restaurant' : 'Restaurants'}
            </span>

            {/* Veg Chip */}
            <button
              onClick={onToggleVegOnly}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                isVegOnly
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>🥬 Pure Veg</span>
            </button>

            {/* Rating 4.5+ Chip */}
            <button
              onClick={() => onSelectMinRating(minRating === 4.5 ? null : 4.5)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                minRating === 4.5
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>4.5+ Rating</span>
            </button>

            {/* Fast Delivery (<30 mins) */}
            <button
              onClick={() => onSelectMaxDeliveryTime(maxDeliveryTime === 30 ? null : 30)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                maxDeliveryTime === 30
                  ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Under 30 mins</span>
            </button>

            {/* Has Offers */}
            <button
              onClick={onToggleHasOffersOnly}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                hasOffersOnly
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Great Offers</span>
            </button>

            {/* Reset */}
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Right: Sort Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort by:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => onSelectSortBy(e.target.value)}
              className="text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-orange-500 cursor-pointer shadow-xs hover:border-gray-300"
            >
              <option value="relevance">Relevance (Featured)</option>
              <option value="rating">Rating: High to Low</option>
              <option value="deliveryTime">Delivery Time: Fastest</option>
              <option value="priceLowToHigh">Cost: Low to High</option>
              <option value="priceHighToLow">Cost: High to Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
