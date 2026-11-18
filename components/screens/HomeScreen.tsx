import React, { useState } from 'react';
import {
  MapPin,
  Bell,
  Search,
  ChevronDown,
  ArrowRight,
  Star,
  Heart,
  SlidersHorizontal,
  Home,
  Bookmark,
  CalendarCheck,
  User,
  Sparkles
} from 'lucide-react';

interface HomeScreenProps {
  onOpenFilters: () => void;
  onOpenListings: (filterParams?: any) => void;
  onSelectProperty: (propertyId: string) => void;
  onNavigateTab: (tab: 'home' | 'search' | 'saved' | 'bookings' | 'profile') => void;
  savedIds: string[];
  onToggleSave: (propertyId: string) => void;
  properties: any[];
}

const CITIES = ['Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi-NCR', 'Chennai'];
const CATEGORIES = ['All', 'Boys', 'Girls', 'Co-living'];

const POPULAR_AREAS = [
  {
    name: 'Koramangala',
    count: '34 PGs',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Indiranagar',
    count: '28 PGs',
    image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Whitefield',
    count: '42 PGs',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'HSR Layout',
    count: '30 PGs',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'BTM Layout',
    count: '25 PGs',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenFilters,
  onOpenListings,
  onSelectProperty,
  onNavigateTab,
  savedIds,
  onToggleSave,
  properties,
}) => {
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const featured = properties.filter(p => p.is_featured);

  return (
    <div className="w-full h-full bg-white flex flex-col justify-between font-sans relative pb-20">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {/* Top Header: Location Selector & Notification Bell */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center gap-1.5 text-vasati-dark font-bold text-base hover:text-vasati-purple transition-colors"
            >
              <MapPin className="w-5 h-5 text-vasati-dark" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-4 h-4 text-vasati-dark" />
            </button>

            {cityDropdownOpen && (
              <div className="absolute top-8 left-0 z-50 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 w-44">
                {CITIES.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCity(c);
                      setCityDropdownOpen(false);
                      onOpenListings({ city: c });
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-vasati-purple-soft transition-colors ${
                      selectedCity === c ? 'text-vasati-purple font-bold' : 'text-gray-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-vasati-dark" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-vasati-orange ring-2 ring-white" />
            </button>

            {notificationsOpen && (
              <div className="absolute top-10 right-0 z-50 bg-white rounded-3xl shadow-2xl border border-purple-100 p-4 w-72 animate-fade-in text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
                  <h4 className="font-extrabold text-vasati-dark">Notifications</h4>
                  <span className="text-[10px] text-vasati-purple font-bold">Mark all read</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                    <p className="font-bold text-vasati-purple text-[11px]">Visit Request Approved!</p>
                    <p className="text-gray-600 text-[10px] mt-0.5">Host at Sri Sai PG confirmed your visit for Nov 20, 11:00 AM.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="font-bold text-emerald-800 text-[11px]">Booking Confirmed</p>
                    <p className="text-gray-600 text-[10px] mt-0.5">Booking BK-VAS-2026-8812 is confirmed. Welcome to VASATI!</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="font-bold text-gray-700 text-[11px]">Rent Reminder</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">Next billing date scheduled for 1st Dec 2026.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="px-5 mt-1">
          <h1 className="text-2xl font-extrabold text-vasati-dark tracking-tight leading-tight">
            Find the Best <br />
            PGs Near You
          </h1>
          <p className="text-xs font-medium text-gray-500 mt-1">
            Comfortable • Safe • Affordable
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="px-5 mt-4">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onOpenListings({ query: searchQuery });
                }
              }}
              placeholder="Search by area, location..."
              className="w-full pl-11 pr-12 py-3 bg-gray-50/90 border border-gray-200/80 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vasati-purple/30 focus:border-vasati-purple transition-all"
            />
            <button
              onClick={onOpenFilters}
              className="absolute right-2 p-2 rounded-xl bg-vasati-purple-soft text-vasati-purple hover:bg-vasati-purple hover:text-white transition-colors"
              title="Open Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-5 mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  onOpenListings({ category: cat === 'All' ? '' : cat });
                }}
                className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-vasati-purple text-white shadow-md shadow-vasati-purple/20'
                    : 'bg-gray-100/90 text-gray-700 hover:bg-gray-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Promotional Banner Card */}
        <div className="px-5 mt-5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-vasati-purple via-purple-700 to-vasati-purple-light p-4 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="max-w-[55%]">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-1.5 backdrop-blur-sm">
                  Limited Offer
                </span>
                <h3 className="text-base font-extrabold leading-snug">
                  Premium PGs <br />
                  Starting from <br />
                  <span className="text-vasati-orange font-black">₹6,000/month</span>
                </h3>
                <button
                  onClick={() => onOpenListings({ maxRent: 8000 })}
                  className="mt-3 px-4 py-1.5 rounded-full bg-vasati-orange hover:bg-vasati-orange-dark text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bedroom Thumbnail */}
              <div className="w-[125px] h-[95px] rounded-2xl overflow-hidden shadow-lg border border-white/20">
                <img
                  src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=400&q=80"
                  alt="Premium PG"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-1 mt-3">
              <span className="w-4 h-1.5 rounded-full bg-white" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* Popular Areas Section */}
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-vasati-dark">Popular Areas</h3>
            <button
              onClick={() => onOpenListings()}
              className="text-xs font-bold text-vasati-purple flex items-center gap-1 hover:underline"
            >
              <span>See all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {POPULAR_AREAS.map(area => (
              <div
                key={area.name}
                onClick={() => onOpenListings({ locality: area.name })}
                className="flex-shrink-0 w-28 group cursor-pointer"
              >
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
                  <img
                    src={area.image}
                    alt={area.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <p className="text-xs font-bold leading-tight truncate">{area.name}</p>
                    <p className="text-[10px] text-white/80">{area.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured PGs Section */}
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-vasati-dark">Featured PGs</h3>
            <button
              onClick={() => onOpenListings()}
              className="text-xs font-bold text-vasati-purple flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {featured.slice(0, 2).map(pg => {
              const isSaved = savedIds.includes(pg.id);
              return (
                <div
                  key={pg.id}
                  onClick={() => onSelectProperty(pg.id)}
                  className="bg-white rounded-3xl p-3 border border-gray-100 shadow-card hover:shadow-card-hover transition-all cursor-pointer relative"
                >
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden">
                    <img
                      src={pg.cover_image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80'}
                      alt={pg.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-vasati-purple text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-vasati-orange" />
                      Premium
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onToggleSave(pg.id);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`}
                      />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
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
                      <span className="text-[10px] text-gray-400">({pg.review_count})</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2.5">
                    <div>
                      <span className="text-base font-black text-vasati-purple">
                        ₹{pg.monthly_rent_from.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-gray-400 font-medium"> / month</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-vasati-purple flex items-center justify-center text-white shadow-md">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Navigation Bar matching Reference Image */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 py-2.5 px-6 flex items-center justify-between shadow-nav z-30">
        <button
          onClick={() => onNavigateTab('home')}
          className="flex flex-col items-center gap-0.5 text-vasati-purple"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button
          onClick={() => onNavigateTab('search')}
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-vasati-purple transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Search</span>
        </button>

        <button
          onClick={() => onNavigateTab('saved')}
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-vasati-purple transition-colors"
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px] font-medium">Saved</span>
        </button>

        <button
          onClick={() => onNavigateTab('bookings')}
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-vasati-purple transition-colors"
        >
          <CalendarCheck className="w-5 h-5" />
          <span className="text-[10px] font-medium">Bookings</span>
        </button>

        <button
          onClick={() => onNavigateTab('profile')}
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-vasati-purple transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
};

