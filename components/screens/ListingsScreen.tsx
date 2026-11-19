import React, { useState } from 'react';
import {
  ChevronLeft,
  MapPin,
  Star,
  Heart,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Map as MapIcon,
  List as ListIcon
} from 'lucide-react';

interface ListingsScreenProps {
  properties: any[];
  onBack: () => void;
  onOpenFilters: () => void;
  onSelectProperty: (propertyId: string) => void;
  savedIds: string[];
  onToggleSave: (propertyId: string) => void;
}

export const ListingsScreen: React.FC<ListingsScreenProps> = ({
  properties,
  onBack,
  onOpenFilters,
  onSelectProperty,
  savedIds,
  onToggleSave,
}) => {
  const [showMapView, setShowMapView] = useState(false);
  const [selectedMapPin, setSelectedMapPin] = useState<any>(null);

  return (
    <div className="w-full h-full bg-vasati-lavender flex flex-col justify-between font-sans relative">
      {/* Top Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between bg-white border-b border-vasati-purple-border/40 z-10">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-vasati-purple-soft/50 text-vasati-dark transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h2 className="text-lg font-extrabold text-vasati-dark">PGs Near You</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMapView(!showMapView)}
            className="w-8 h-8 rounded-full bg-vasati-purple-soft text-vasati-purple flex items-center justify-center hover:bg-vasati-purple hover:text-white transition-all shadow-sm"
            title={showMapView ? 'Switch to List' : 'Switch to Map'}
          >
            {showMapView ? <ListIcon className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Results Count & Quick Filter Bar */}
      <div className="px-5 py-2.5 bg-white/70 backdrop-blur-sm border-b border-vasati-purple-border/30 flex items-center justify-between text-xs">
        <span className="font-extrabold text-vasati-dark">
          {properties.length} PGs found
        </span>

        <button
          onClick={onOpenFilters}
          className="flex items-center gap-1 font-bold text-vasati-purple hover:underline"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Main Content Area: List View or Interactive Map View */}
      {showMapView ? (
        // Interactive Simulated Map View
        <div className="relative flex-1 bg-purple-50 overflow-hidden flex flex-col justify-end p-4">
          {/* Map Graphic Background */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#5C16C5_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Interactive Pins */}
          {properties.map((p, index) => {
            const isSelected = selectedMapPin?.id === p.id;
            const topPositions = ['20%', '35%', '50%', '65%', '40%'];
            const leftPositions = ['25%', '60%', '35%', '70%', '45%'];
            return (
              <div
                key={p.id}
                onClick={() => setSelectedMapPin(p)}
                style={{
                  position: 'absolute',
                  top: topPositions[index % topPositions.length],
                  left: leftPositions[index % leftPositions.length],
                }}
                className={`cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                }`}
              >
                <div className="bg-vasati-purple text-white px-2.5 py-1 rounded-full text-[11px] font-black shadow-lg flex items-center gap-1 border-2 border-white">
                  <span>₹{(p.monthly_rent_from / 1000).toFixed(0)}K</span>
                </div>
              </div>
            );
          })}

          {/* Bottom Card for Selected Pin */}
          {selectedMapPin && (
            <div
              onClick={() => onSelectProperty(selectedMapPin.id)}
              className="bg-white rounded-2xl p-3 shadow-2xl border border-purple-100 z-30 cursor-pointer flex items-center gap-3 animate-fade-in"
            >
              <img
                src={selectedMapPin.cover_image}
                alt={selectedMapPin.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-vasati-dark truncate">{selectedMapPin.name}</h4>
                <p className="text-xs text-gray-500">{selectedMapPin.locality}</p>
                <p className="text-xs font-black text-vasati-purple mt-0.5">
                  ₹{selectedMapPin.monthly_rent_from.toLocaleString('en-IN')}/mo
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-vasati-purple" />
            </div>
          )}
        </div>
      ) : (
        // List View matching Reference Image Screen 4 with Responsive Grid
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 max-w-6xl mx-auto w-full">
          {properties.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-base font-bold text-vasati-dark">No PGs match your filters</p>
              <p className="text-xs text-vasati-secondary mt-1">Try resetting some filters to see more results</p>
              <button
                onClick={onOpenFilters}
                className="mt-4 px-5 py-2 rounded-full bg-gradient-to-r from-vasati-purple to-vasati-purple-vibrant hover:from-vasati-royal hover:to-vasati-purple text-white text-xs font-bold shadow-card active:scale-95 transition-all"
              >
                Modify Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(pg => {
                const isSaved = savedIds.includes(pg.id);
                return (
                  <div
                    key={pg.id}
                    onClick={() => onSelectProperty(pg.id)}
                    className="bg-white rounded-3xl p-3.5 shadow-card hover:shadow-card-hover border border-vasati-purple-border/50 hover:border-vasati-purple/40 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                  {/* Property Image with Badges */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden">
                    <img
                      src={pg.cover_image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80'}
                      alt={pg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Premium Tag */}
                    {pg.is_premium === 1 && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-vasati-purple to-vasati-purple-vibrant text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 text-vasati-orange" />
                        Premium
                      </div>
                    )}

                    {/* Save Heart Button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onToggleSave(pg.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Property Details */}
                  <div className="mt-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-vasati-dark tracking-tight">
                          {pg.name}
                        </h3>
                        <p className="text-xs text-vasati-secondary flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-vasati-purple shrink-0" />
                          <span>{pg.locality}, {pg.city}</span>
                        </p>
                      </div>

                      {/* Star Rating Badge */}
                      <div className="flex items-center gap-1 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-amber-900">{pg.rating}</span>
                        <span className="text-[10px] text-vasati-secondary">({pg.review_count >= 1000 ? `${(pg.review_count / 1000).toFixed(1)}k` : pg.review_count})</span>
                      </div>
                    </div>

                    {/* Price and Action Button */}
                    <div className="mt-3 flex items-center justify-between border-t border-vasati-purple-border/30 pt-3">
                      <div>
                        <span className="text-lg font-black text-vasati-purple">
                          ₹{pg.monthly_rent_from.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-vasati-secondary font-medium"> / month</span>

                        {/* Facility Pills matching Reference Image */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {(
                            pg.facilities && pg.facilities.length > 0
                              ? pg.facilities.slice(0, 3)
                              : pg.id === 'prop_green_comfort'
                                ? ['AC', 'Wi-Fi', 'Parking']
                                : pg.id === 'prop_comfort_stay'
                                  ? ['AC', 'Wi-Fi']
                                  : ['AC', 'Meals', 'Wi-Fi']
                          ).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-vasati-purple-soft text-vasati-purple text-[10px] font-bold border border-vasati-purple-border/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Arrow Action Button matching design */}
                      <button className="w-9 h-9 rounded-full bg-gradient-to-r from-vasati-purple to-vasati-purple-vibrant flex items-center justify-center text-white shadow-md shadow-vasati-purple/30 group-hover:from-vasati-royal group-hover:to-vasati-purple transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

