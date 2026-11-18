import React from 'react';
import { ChevronLeft, Heart, MapPin, Star, ArrowRight } from 'lucide-react';

interface SavedListViewProps {
  onBack: () => void;
  savedProperties: any[];
  onSelectProperty: (propertyId: string) => void;
  onToggleSave: (propertyId: string) => void;
}

export const SavedListView: React.FC<SavedListViewProps> = ({
  onBack,
  savedProperties,
  onSelectProperty,
  onToggleSave,
}) => {
  return (
    <div className="w-full h-full bg-vasati-lavender flex flex-col justify-between font-sans relative">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between bg-white border-b border-gray-100">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-gray-100 text-vasati-dark"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-extrabold text-vasati-dark">Saved PGs</h2>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {savedProperties.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-700">No saved PGs yet</h3>
            <p className="text-xs text-gray-400 mt-1">
              Tap the heart icon on any PG card to bookmark it for later.
            </p>
          </div>
        ) : (
          savedProperties.map(pg => (
            <div
              key={pg.id}
              onClick={() => onSelectProperty(pg.id)}
              className="bg-white rounded-3xl p-3.5 shadow-card hover:shadow-card-hover border border-gray-100 transition-all cursor-pointer relative"
            >
              <div className="relative w-full h-36 rounded-2xl overflow-hidden">
                <img
                  src={pg.cover_image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80'}
                  alt={pg.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onToggleSave(pg.id);
                  }}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-red-500 shadow-sm"
                >
                  <Heart className="w-4 h-4 fill-red-500" />
                </button>
              </div>

              <div className="mt-3 flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-vasati-dark">{pg.name}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-vasati-purple" />
                    {pg.locality}, {pg.city}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-800">{pg.rating}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
                <div>
                  <span className="text-base font-black text-vasati-purple">
                    ₹{pg.monthly_rent_from?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-400"> / mo</span>
                </div>
                <button className="w-8 h-8 rounded-full bg-vasati-purple text-white flex items-center justify-center shadow-md">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

