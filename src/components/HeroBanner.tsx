import React from 'react';
import { Tag, Sparkles, Clock, ShieldCheck, ArrowRight, Flame } from 'lucide-react';
import { PromoCode } from '../types';

interface HeroBannerProps {
  promos: PromoCode[];
  onSelectPromo: (code: string) => void;
  onExploreCategory: (category: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  promos,
  onSelectPromo,
  onExploreCategory,
}) => {
  return (
    <div className="pt-4 pb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 text-white shadow-xl shadow-orange-600/15">
          {/* Subtle background food motifs */}
          <div className="absolute -right-10 -bottom-10 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 lg:opacity-40 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-300 via-transparent to-transparent" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-100 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Instant Delivery in 25–35 Mins</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Cravings Delivered. <br className="hidden sm:inline" />
                <span className="text-amber-200">Hot, Fresh & Fast.</span>
              </h1>

              <p className="text-sm sm:text-base text-orange-50 font-normal max-w-xl leading-relaxed">
                Order handcrafted pizzas, juicy burgers, authentic dum biryanis, fresh sushi, and late-night desserts from the best restaurants around you.
              </p>

              {/* Promo chips */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-orange-100 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Tap to copy popular discount promo codes:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {promos.map((promo) => (
                    <button
                      key={promo.code}
                      onClick={() => onSelectPromo(promo.code)}
                      className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/25 hover:bg-black/40 border border-white/20 backdrop-blur-sm text-xs font-mono font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span className="text-amber-300 group-hover:text-amber-200 font-extrabold">{promo.code}</span>
                      <span className="text-[11px] text-white/80 font-sans font-medium">
                        {promo.discountPercent > 0 ? `${promo.discountPercent}% OFF` : 'FREE DEL'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Highlights & Fast Perks */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 mb-2">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold">Lightning Fast</h2>
                <p className="text-xs text-orange-100">Live order rider tracking with real-time ETA</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-400/20 flex items-center justify-center text-emerald-300 mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold">100% Hygienic</h2>
                <p className="text-xs text-orange-100">Sanitized packaging & tamper-evident seals</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-rose-400/20 flex items-center justify-center text-rose-300 mb-2">
                  <Flame className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold">Chef's Specials</h2>
                <p className="text-xs text-orange-100">Daily fresh specials & exclusive house recipes</p>
              </div>

              <div
                onClick={() => onExploreCategory('Pizza')}
                className="bg-white/15 hover:bg-white/25 cursor-pointer backdrop-blur-md border border-white/25 rounded-2xl p-4 flex flex-col justify-between transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold flex items-center gap-1">
                  Explore Menu
                </h2>
                <p className="text-xs text-orange-100">Browse trending dishes & curated combos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
