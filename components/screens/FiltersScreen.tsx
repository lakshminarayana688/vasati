import React, { useState } from 'react';
import {
  ChevronLeft,
  Snowflake,
  Wifi,
  Utensils,
  SquareParking,
  Zap,
  Shirt,
  ShieldCheck,
  ArrowUpDown,
  Check
} from 'lucide-react';

interface FiltersScreenProps {
  onBack: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

export interface FilterState {
  maxBudget: number;
  gender: string;
  pgType: string;
  food: string;
  facilities: string[];
}

const FACILITIES_LIST = [
  { key: 'ac', name: 'AC', icon: Snowflake },
  { key: 'wifi', name: 'Wi-Fi', icon: Wifi },
  { key: 'meals', name: 'Meals', icon: Utensils },
  { key: 'parking', name: 'Parking', icon: SquareParking },
  { key: 'power_backup', name: 'Power Backup', icon: Zap },
  { key: 'laundry', name: 'Laundry', icon: Shirt },
  { key: 'security', name: 'Security', icon: ShieldCheck },
  { key: 'lift', name: 'Lift', icon: ArrowUpDown },
];

export const FiltersScreen: React.FC<FiltersScreenProps> = ({
  onBack,
  onApply,
  initialFilters,
}) => {
  const [maxBudget, setMaxBudget] = useState<number>(initialFilters?.maxBudget || 25000);
  const [gender, setGender] = useState<string>(initialFilters?.gender || 'Any');
  const [pgType, setPgType] = useState<string>(initialFilters?.pgType || 'Any');
  const [food, setFood] = useState<string>(initialFilters?.food || 'Any');
  const [facilities, setFacilities] = useState<string[]>(initialFilters?.facilities || ['wifi', 'meals']);

  const handleReset = () => {
    setMaxBudget(30000);
    setGender('Any');
    setPgType('Any');
    setFood('Any');
    setFacilities([]);
  };

  const toggleFacility = (key: string) => {
    if (facilities.includes(key)) {
      setFacilities(facilities.filter(f => f !== key));
    } else {
      setFacilities([...facilities, key]);
    }
  };

  const handleApply = () => {
    onApply({
      maxBudget,
      gender,
      pgType,
      food,
      facilities,
    });
  };

  return (
    <div className="w-full h-full bg-white flex flex-col justify-between font-sans relative">
      {/* Top Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-gray-100 text-vasati-dark transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h2 className="text-lg font-extrabold text-vasati-dark">Filters</h2>

        <button
          onClick={handleReset}
          className="text-xs font-bold text-vasati-purple hover:underline"
        >
          Reset
        </button>
      </div>

      {/* Scrollable Filters Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-6">
        {/* Budget (Monthly Rent) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-extrabold text-vasati-dark">Budget (Monthly Rent)</h3>
            <span className="text-xs font-bold text-vasati-purple">
              Up to ₹{maxBudget.toLocaleString('en-IN')}/mo
            </span>
          </div>

          <input
            type="range"
            min={3000}
            max={30000}
            step={500}
            value={maxBudget}
            onChange={e => setMaxBudget(Number(e.target.value))}
            className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-vasati-purple"
          />

          <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mt-2">
            <span>₹3K</span>
            <span>₹30K+</span>
          </div>
        </div>

        {/* Gender */}
        <div>
          <h3 className="text-sm font-extrabold text-vasati-dark mb-2.5">Gender</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {['Any', 'Boys', 'Girls'].map(g => {
              const isSelected = gender === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-vasati-purple text-white shadow-md shadow-vasati-purple/20'
                      : 'bg-gray-50 text-gray-600 border border-gray-200/60 hover:bg-gray-100'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* PG Type */}
        <div>
          <h3 className="text-sm font-extrabold text-vasati-dark mb-2.5">PG Type</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {['Any', 'Single', 'Sharing'].map(t => {
              const isSelected = pgType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPgType(t)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-vasati-purple text-white shadow-md shadow-vasati-purple/20'
                      : 'bg-gray-50 text-gray-600 border border-gray-200/60 hover:bg-gray-100'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Food */}
        <div>
          <h3 className="text-sm font-extrabold text-vasati-dark mb-2.5">Food</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {['Any', 'Veg', 'Non-Veg'].map(f => {
              const isSelected = food === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFood(f)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-vasati-purple text-white shadow-md shadow-vasati-purple/20'
                      : 'bg-gray-50 text-gray-600 border border-gray-200/60 hover:bg-gray-100'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Facilities Grid */}
        <div>
          <h3 className="text-sm font-extrabold text-vasati-dark mb-3">Facilities</h3>
          <div className="grid grid-cols-4 gap-2.5">
            {FACILITIES_LIST.map(item => {
              const isSelected = facilities.includes(item.key);
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleFacility(item.key)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl aspect-square border transition-all ${
                    isSelected
                      ? 'bg-vasati-purple-soft border-vasati-purple text-vasati-purple shadow-sm'
                      : 'bg-white border-gray-200/80 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-vasati-purple' : 'text-gray-600'}`} />
                  <span className="text-[10px] font-bold text-center leading-tight">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Apply Button */}
      <div className="p-5 border-t border-gray-100 bg-white">
        <button
          onClick={handleApply}
          className="w-full py-3.5 rounded-full bg-vasati-purple hover:bg-vasati-purple-dark text-white font-extrabold text-sm shadow-xl shadow-vasati-purple/25 transition-all duration-200 active:scale-98"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

