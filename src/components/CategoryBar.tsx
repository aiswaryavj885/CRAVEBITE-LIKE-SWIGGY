import React from 'react';
import { Utensils } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  count: number;
  image: string;
}

interface CategoryBarProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="py-4 border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
              What are you craving today?
            </h2>
          </div>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => onSelectCategory('All')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Scrollable list */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {/* 'All' option */}
          <button
            onClick={() => onSelectCategory('All')}
            className={`flex flex-col items-center gap-2 p-2 rounded-2xl min-w-[76px] transition-all duration-200 shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-500 scale-105'
                : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs ${
              selectedCategory === 'All' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <Utensils className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold whitespace-nowrap">All Items</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? 'All' : cat.name)}
                className={`flex flex-col items-center gap-2 p-2 rounded-2xl min-w-[80px] transition-all duration-200 shrink-0 group ${
                  isSelected
                    ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-500 scale-105'
                    : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xs relative bg-gray-100 group-hover:scale-105 transition-transform">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-orange-500/20" />
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold whitespace-nowrap group-hover:text-orange-600 transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {cat.count} items
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
