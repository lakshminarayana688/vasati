'use client';

import React, { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/screens/SplashScreen';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { FiltersScreen, FilterState } from '@/components/screens/FiltersScreen';
import { ListingsScreen } from '@/components/screens/ListingsScreen';
import { DetailsScreen } from '@/components/screens/DetailsScreen';
import { BookingScreen } from '@/components/screens/BookingScreen';
import { PaymentScreen } from '@/components/screens/PaymentScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { BookingsListView } from '@/components/screens/BookingsListView';
import { SavedListView } from '@/components/screens/SavedListView';
import { OwnerPortal } from '@/components/owner/OwnerPortal';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { VasatiLogo } from '@/components/VasatiLogo';
import { AuthModal } from '@/components/AuthModal';
import {
  Smartphone,
  Monitor,
  User,
  Building,
  Shield,
  Wifi,
  Battery,
  Signal,
  Layers,
  Sparkles
} from 'lucide-react';

export default function VasatiApp() {
  // Navigation & Role states
  const [activeRole, setActiveRole] = useState<'customer' | 'owner' | 'admin'>('customer');
  const [viewMode, setViewMode] = useState<'mobile' | 'responsive'>('mobile');
  const [activeScreen, setActiveScreen] = useState<
    'splash' | 'home' | 'filters' | 'listings' | 'details' | 'booking' | 'payment' | 'profile' | 'bookings_list' | 'saved_list'
  >('home');

  // Properties & Saved data
  const [properties, setProperties] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>(['prop_sri_sai']);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('prop_sri_sai');
  const [activeFilters, setActiveFilters] = useState<Partial<FilterState>>({});
  const [currentBookingDetails, setCurrentBookingDetails] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Fetch properties
  const loadProperties = async (filters: any = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.maxBudget) params.append('maxRent', filters.maxBudget.toString());
      if (filters.gender && filters.gender !== 'Any') params.append('gender', filters.gender);
      if (filters.pgType && filters.pgType !== 'Any') params.append('pgType', filters.pgType);
      if (filters.food && filters.food !== 'Any') params.append('food', filters.food);
      if (filters.facilities && filters.facilities.length > 0) {
        params.append('amenities', filters.facilities.join(','));
      }
      if (filters.locality) params.append('locality', filters.locality);
      if (filters.query) params.append('q', filters.query);
      if (filters.category) params.append('category', filters.category);

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch saved IDs
  const loadSaved = async () => {
    try {
      const res = await fetch('/api/saved?userId=usr_cust_1');
      const data = await res.json();
      if (data.success && data.savedIds) {
        setSavedIds(data.savedIds);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProperties();
    loadSaved();
  }, []);

  // Save / Bookmark toggle
  const handleToggleSave = async (propertyId: string) => {
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr_cust_1', propertyId }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.saved) {
          setSavedIds(prev => [...prev, propertyId]);
        } else {
          setSavedIds(prev => prev.filter(id => id !== propertyId));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters);
    loadProperties(filters);
    setActiveScreen('listings');
  };

  const handleOpenListings = (customParams?: any) => {
    if (customParams) {
      loadProperties({ ...activeFilters, ...customParams });
    }
    setActiveScreen('listings');
  };

  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
    setActiveScreen('details');
  };

  const handleBookNow = (prop: any) => {
    setSelectedPropertyId(prop.id);
    setActiveScreen('booking');
  };

  const handleContinueToPayment = (details: any) => {
    setCurrentBookingDetails(details);
    setActiveScreen('payment');
  };

  const handlePaymentSuccess = (confirmedBooking: any) => {
    setActiveScreen('bookings_list');
  };

  const handleNavigateTab = (tab: 'home' | 'search' | 'saved' | 'bookings' | 'profile') => {
    switch (tab) {
      case 'home':
        setActiveScreen('home');
        break;
      case 'search':
        setActiveScreen('listings');
        break;
      case 'saved':
        setActiveScreen('saved_list');
        break;
      case 'bookings':
        setActiveScreen('bookings_list');
        break;
      case 'profile':
        setActiveScreen('profile');
        break;
    }
  };

  // Render Customer Screen
  const renderCustomerScreen = () => {
    const selectedProp = properties.find(p => p.id === selectedPropertyId) || properties[0] || {
      id: 'prop_sri_sai',
      name: 'Sri Sai PG',
      locality: 'Koramangala',
      city: 'Bengaluru',
      monthly_rent_from: 8000,
      rating: 4.7,
      review_count: 1240,
    };

    const savedProps = properties.filter(p => savedIds.includes(p.id));

    switch (activeScreen) {
      case 'splash':
        return (
          <SplashScreen
            onGetStarted={() => setActiveScreen('home')}
            onLogin={() => setShowAuthModal(true)}
          />
        );
      case 'home':
        return (
          <HomeScreen
            onOpenFilters={() => setActiveScreen('filters')}
            onOpenListings={handleOpenListings}
            onSelectProperty={handleSelectProperty}
            onNavigateTab={handleNavigateTab}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            properties={properties}
          />
        );
      case 'filters':
        return (
          <FiltersScreen
            onBack={() => setActiveScreen('home')}
            onApply={handleApplyFilters}
            initialFilters={activeFilters}
          />
        );
      case 'listings':
        return (
          <ListingsScreen
            properties={properties}
            onBack={() => setActiveScreen('home')}
            onOpenFilters={() => setActiveScreen('filters')}
            onSelectProperty={handleSelectProperty}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
          />
        );
      case 'details':
        return (
          <DetailsScreen
            propertyId={selectedPropertyId}
            onBack={() => setActiveScreen('listings')}
            onBookNow={handleBookNow}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
          />
        );
      case 'booking':
        return (
          <BookingScreen
            property={selectedProp}
            onBack={() => setActiveScreen('details')}
            onContinueToPayment={handleContinueToPayment}
          />
        );
      case 'payment':
        return (
          <PaymentScreen
            bookingDetails={currentBookingDetails}
            onBack={() => setActiveScreen('booking')}
            onPaymentSuccess={handlePaymentSuccess}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onNavigateTab={handleNavigateTab}
            onOpenBookings={() => setActiveScreen('bookings_list')}
            onOpenSaved={() => setActiveScreen('saved_list')}
            onLogout={() => {
              setActiveScreen('splash');
              setShowAuthModal(true);
            }}
          />
        );
      case 'bookings_list':
        return (
          <BookingsListView
            onBack={() => setActiveScreen('profile')}
            onSelectProperty={handleSelectProperty}
          />
        );
      case 'saved_list':
        return (
          <SavedListView
            onBack={() => setActiveScreen('home')}
            savedProperties={savedProps}
            onSelectProperty={handleSelectProperty}
            onToggleSave={handleToggleSave}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EDF6] flex flex-col items-center justify-start text-vasati-dark">
      {/* Top Utility Control Header */}
      <nav className="w-full bg-white border-b border-purple-100 shadow-sm py-2.5 px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & App Tagline */}
          <div className="flex items-center gap-3">
            <VasatiLogo size="sm" showTagline={false} />
            <div className="hidden sm:block h-5 w-px bg-purple-200" />
            <span className="hidden sm:inline-block text-xs font-bold text-gray-500">
              Your Space. Our Priority.
            </span>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-gray-100/90 p-1 rounded-full text-xs font-bold">
            <button
              onClick={() => setActiveRole('customer')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                activeRole === 'customer'
                  ? 'bg-vasati-purple text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer App</span>
            </button>

            <button
              onClick={() => setActiveRole('owner')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                activeRole === 'owner'
                  ? 'bg-vasati-purple text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>PG Owner Hub</span>
            </button>

            <button
              onClick={() => setActiveRole('admin')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                activeRole === 'admin'
                  ? 'bg-vasati-purple text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>VASATI Admin</span>
            </button>
          </div>

          {/* View Mode Switcher (only relevant for Customer App) */}
          {activeRole === 'customer' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 p-1 rounded-full text-xs font-bold">
                <button
                  onClick={() => setViewMode('mobile')}
                  title="Mobile App Frame"
                  className={`p-1.5 rounded-full transition-all ${
                    viewMode === 'mobile' ? 'bg-white text-vasati-purple shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('responsive')}
                  title="Full Web View"
                  className={`p-1.5 rounded-full transition-all ${
                    viewMode === 'responsive' ? 'bg-white text-vasati-purple shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Screen Jump Bar for Customer App */}
        {activeRole === 'customer' && (
          <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] font-bold">
            <span className="text-gray-400 uppercase tracking-wider text-[9px] mr-1 shrink-0 flex items-center gap-1">
              <Layers className="w-3 h-3 text-vasati-purple" />
              Reference Screens:
            </span>
            {[
              { id: 'splash', label: '1. Splash' },
              { id: 'home', label: '2. Home' },
              { id: 'filters', label: '3. Filters' },
              { id: 'listings', label: '4. Listings' },
              { id: 'details', label: '5. Details' },
              { id: 'booking', label: '6. Room Booking' },
              { id: 'payment', label: '7. Payment' },
              { id: 'profile', label: '8. Profile' },
              { id: 'bookings_list', label: 'My Bookings' },
              { id: 'saved_list', label: 'Saved PGs' },
            ].map(screen => {
              const isActive = activeScreen === screen.id;
              return (
                <button
                  key={screen.id}
                  onClick={() => setActiveScreen(screen.id as any)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                    isActive
                      ? 'bg-vasati-purple text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-vasati-purple'
                  }`}
                >
                  {screen.label}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Main View Container */}
      <div className="w-full flex-1 flex items-center justify-center p-0 md:p-6">
        {activeRole === 'owner' ? (
          <div className="w-full">
            <OwnerPortal />
          </div>
        ) : activeRole === 'admin' ? (
          <div className="w-full">
            <AdminDashboard />
          </div>
        ) : viewMode === 'mobile' ? (
          /* Realistic Smartphone Frame Matching Reference Image */
          <div className="relative my-4 w-full max-w-[395px] h-[835px] max-h-[92vh] bg-black rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(92,22,197,0.35)] border-4 border-gray-800/80 flex flex-col overflow-hidden">
            {/* Screen Inner Container */}
            <div className="relative w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col shadow-inner">
              {/* Authentic 9:41 Status Bar */}
              <div className={`w-full px-6 pt-3 pb-1 flex items-center justify-between text-xs font-bold select-none z-40 transition-colors duration-200 ${
                activeScreen === 'profile' ? 'bg-vasati-purple text-white' : 'bg-white text-vasati-dark'
              }`}>
                <span>9:41</span>
                {/* Dynamic Island / Speaker cutout */}
                <div className="w-20 h-4 bg-black rounded-full" />
                <div className={`flex items-center gap-1.5 ${
                  activeScreen === 'profile' ? 'text-white' : 'text-vasati-dark'
                }`}>
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4" />
                </div>
              </div>

              {/* Screen Body */}
              <div className="flex-1 w-full overflow-hidden relative">
                {renderCustomerScreen()}
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="w-full py-1.5 bg-white flex justify-center z-40">
                <div className="w-32 h-1 bg-gray-300 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          /* Full Responsive Web View */
          <div className="w-full max-w-4xl min-h-[750px] bg-white rounded-3xl shadow-xl overflow-hidden border border-purple-100 flex flex-col my-4">
            {renderCustomerScreen()}
          </div>
        )}
      </div>

      {/* Global OTP Auth Modal */}
      {showAuthModal && (
        <AuthModal
          initialRole={activeRole === 'owner' ? 'owner' : 'customer'}
          onClose={() => setShowAuthModal(false)}
          onSuccess={user => {
            setShowAuthModal(false);
            if (user.role === 'owner') {
              setActiveRole('owner');
            } else {
              setActiveRole('customer');
              setActiveScreen('home');
            }
          }}
        />
      )}
    </div>
  );
}

