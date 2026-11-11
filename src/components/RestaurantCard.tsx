import React from 'react';
import { Star, Clock, MapPin, Heart, Tag } from 'lucide-react';
import { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onClick,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100/90 shadow-xs hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Banner Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <img
          src={restaurant.bannerImage}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient shadow for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {restaurant.isPromoted && (
              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-300/30">
                Featured
              </span>
            )}
            {restaurant.isPureVeg && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-md text-[10px] font-bold text-white">
                Pure Veg
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            type="button"
            onClick={onToggleFavorite}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-gray-700 hover:text-red-500 transition-all shadow-sm active:scale-90"
            title={isFavorite ? 'Remove from favorites' : 'Save as favorite'}
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          </button>
        </div>

        {/* Bottom Offer Ribbon on Image */}
        {restaurant.offers.length > 0 && (
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1 text-white font-extrabold text-xs tracking-tight drop-shadow-sm truncate">
            <Tag className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">{restaurant.offers[0]}</span>
          </div>
        )}
      </div>

      {/* Restaurant Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-gray-900 text-base leading-snug group-hover:text-orange-600 transition-colors line-clamp-1">
              {restaurant.name}
            </h3>

            {/* Rating Badge */}
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shrink-0">
              <span>{restaurant.rating.toFixed(1)}</span>
              <Star className="w-3 h-3 fill-current" />
            </div>
          </div>

          <p className="text-xs text-gray-500 line-clamp-1 mt-1 font-normal">
            {restaurant.tagline}
          </p>

          <p className="text-xs text-gray-600 font-medium mt-1 truncate">
            {restaurant.cuisine.join(' • ')}
          </p>
        </div>

        {/* Card Footer: Delivery Time, Distance, Cost */}
        <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1 text-gray-700 font-bold">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>{restaurant.deliveryTimeMinutes} mins</span>
          </div>

          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>{restaurant.distanceKm} km</span>
          </div>

          <div className="text-gray-700 font-semibold">
            ${restaurant.priceForTwo} for two
          </div>
        </div>
      </div>
    </div>
  );
};
