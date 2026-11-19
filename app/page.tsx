'use client';

import React, { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/screens/SplashScreen';
import { PermissionsScreen } from '@/components/screens/PermissionsScreen';
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
  Shield,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

export default function VasatiApp() {
  // Navigation & Role states (PG Owner Hub removed from interface; retained internally)
  const [activeRole, setActiveRole] = useState<'customer' | 'admin' | 'owner'>('customer');
  const [viewMode, setViewMode] = useState<'mobile' | 'responsive'>('mobile');
  const [activeScreen, setActiveScreen] = useState<
    'splash' | 'permissions' | 'home' | 'filters' | 'listings' | 'details' | 'booking' | 'payment' | 'profile' | 'bookings_list' | 'saved_list'
  >('splash');
  const [history, setHistory] = useState<string[]>(['splash']);

  const navigateTo = (screen: any) => {
    setHistory(prev => {
      if (prev[prev.length - 1] === screen) return prev;
      return [...prev, screen];
    });
    setActiveScreen(screen);
  };

  const goBack = () => {
    setHistory(prev => {
      if (prev.length <= 1) {
        setActiveScreen('home');
        return ['home'];
      }
      const nextHistory = prev.slice(0, -1);
      const prevScreen = nextHistory[nextHistory.length - 1];
      setActiveScreen(prevScreen as any);
      return nextHistory;
    });
  };

  // Properties & Saved data
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>(['prop_sri_sai']);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('prop_sri_sai');
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentBookingDetails, setCurrentBookingDetails] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Fetch properties
  const loadProperties = async (filters: any = {}, isInitial = false) => {
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
      if (filters.city) params.append('city', filters.city);
      if (filters.query) params.append('q', filters.query);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties);
        if (isInitial || Object.keys(filters).length === 0) {
          setAllProperties(data.properties);
        }
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
    loadProperties({}, true);
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

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    const updated = { ...activeFilters };
    if (cat === 'All') {
      delete updated.category;
    } else {
      updated.category = cat;
    }
    setActiveFilters(updated);
    loadProperties(updated);
    navigateTo('listings');
  };

  const handleApplyFilters = (filters: FilterState) => {
    const combined = { ...activeFilters, ...filters };
    if (filters.gender && filters.gender !== 'Any') {
      if (filters.gender === 'Boys') {
        combined.category = 'Boys';
        setSelectedCategory('Boys');
      } else if (filters.gender === 'Girls') {
        combined.category = 'Girls';
        setSelectedCategory('Girls');
      }
    } else if (filters.gender === 'Any' && (selectedCategory === 'Boys' || selectedCategory === 'Girls')) {
      delete combined.category;
      setSelectedCategory('All');
    }
    setActiveFilters(combined);
    loadProperties(combined);
    navigateTo('listings');
  };

  const handleOpenListings = (customParams?: any) => {
    let nextFilters = { ...activeFilters };
    if (customParams) {
      if (customParams.category !== undefined) {
        if (!customParams.category || customParams.category === 'All') {
          setSelectedCategory('All');
          delete nextFilters.category;
        } else {
          setSelectedCategory(customParams.category);
          nextFilters.category = customParams.category;
        }
      }
      nextFilters = { ...nextFilters, ...customParams };
      if (!customParams.category && customParams.category !== undefined) {
        delete nextFilters.category;
      }
      setActiveFilters(nextFilters);
      loadProperties(nextFilters);
    } else {
      loadProperties(activeFilters);
    }
    navigateTo('listings');
  };

  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
    navigateTo('details');
  };

  const handleBookNow = (prop: any) => {
    setSelectedPropertyId(prop.id);
    navigateTo('booking');
  };

  const handleContinueToPayment = (details: any) => {
    setCurrentBookingDetails(details);
    navigateTo('payment');
  };

  const handlePaymentSuccess = (confirmedBooking: any) => {
    navigateTo('bookings_list');
  };

  const handleNavigateTab = (tab: 'home' | 'search' | 'saved' | 'bookings' | 'profile') => {
    switch (tab) {
      case 'home':
        navigateTo('home');
        break;
      case 'search':
        navigateTo('filters');
        break;
      case 'saved':
        navigateTo('saved_list');
        break;
      case 'bookings':
        navigateTo('bookings_list');
        break;
      case 'profile':
        navigateTo('profile');
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
            onGetStarted={() => setShowAuthModal(true)}
            onLogin={() => setShowAuthModal(true)}
          />
        );
      case 'permissions':
        return (
          <PermissionsScreen
            onContinue={() => navigateTo('home')}
            onSkip={() => navigateTo('home')}
          />
        );
      case 'home':
        return (
          <HomeScreen
            onOpenFilters={() => navigateTo('filters')}
            onOpenListings={handleOpenListings}
            onSelectProperty={handleSelectProperty}
            onNavigateTab={handleNavigateTab}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            properties={allProperties.length > 0 ? allProperties : properties}
            isDesktop={viewMode === 'responsive'}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        );
      case 'filters':
        return (
          <FiltersScreen
            onBack={goBack}
            onApply={handleApplyFilters}
            initialFilters={activeFilters}
          />
        );
      case 'listings':
        return (
          <ListingsScreen
            properties={properties}
            onBack={goBack}
            onOpenFilters={() => navigateTo('filters')}
            onSelectProperty={handleSelectProperty}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            isDesktop={viewMode === 'responsive'}
          />
        );
      case 'details':
        return (
          <DetailsScreen
            propertyId={selectedPropertyId}
            onBack={goBack}
            onBookNow={handleBookNow}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            isDesktop={viewMode === 'responsive'}
          />
        );
      case 'booking':
        return (
          <BookingScreen
            property={selectedProp}
            onBack={goBack}
            onContinueToPayment={handleContinueToPayment}
          />
        );
      case 'payment':
        return (
          <PaymentScreen
            bookingDetails={currentBookingDetails}
            onBack={goBack}
            onPaymentSuccess={handlePaymentSuccess}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onNavigateTab={handleNavigateTab}
            onOpenBookings={() => navigateTo('bookings_list')}
            onOpenSaved={() => navigateTo('saved_list')}
            onLogout={() => {
              setHistory(['splash']);
              setActiveScreen('splash');
              setShowAuthModal(true);
            }}
          />
        );
      case 'bookings_list':
        return (
          <BookingsListView
            onBack={goBack}
            onSelectProperty={handleSelectProperty}
            isDesktop={viewMode === 'responsive'}
          />
        );
      case 'saved_list':
        return (
          <SavedListView
            onBack={goBack}
            savedProperties={savedProps}
            onSelectProperty={handleSelectProperty}
            onToggleSave={handleToggleSave}
            isDesktop={viewMode === 'responsive'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F3FF] flex flex-col items-center justify-start text-vasati-dark">
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

          {/* Desktop Navigation Links (when customer app is active) */}
          {activeRole === 'customer' && (
            <div className="hidden lg:flex items-center gap-1 bg-purple-50/70 p-1 rounded-full border border-purple-100 text-xs font-bold">
              <button
                onClick={() => navigateTo('home')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  activeScreen === 'home'
                    ? 'bg-vasati-purple text-white shadow-sm'
                    : 'text-gray-600 hover:text-vasati-purple'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => navigateTo('filters')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  activeScreen === 'filters' || activeScreen === 'listings'
                    ? 'bg-vasati-purple text-white shadow-sm'
                    : 'text-gray-600 hover:text-vasati-purple'
                }`}
              >
                Search PGs
              </button>
              <button
                onClick={() => navigateTo('saved_list')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  activeScreen === 'saved_list'
                    ? 'bg-vasati-purple text-white shadow-sm'
                    : 'text-gray-600 hover:text-vasati-purple'
                }`}
              >
                Saved ({savedIds.length})
              </button>
              <button
                onClick={() => navigateTo('bookings_list')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  activeScreen === 'bookings_list'
                    ? 'bg-vasati-purple text-white shadow-sm'
                    : 'text-gray-600 hover:text-vasati-purple'
                }`}
              >
                My Bookings
              </button>
              <button
                onClick={() => navigateTo('profile')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  activeScreen === 'profile'
                    ? 'bg-vasati-purple text-white shadow-sm'
                    : 'text-gray-600 hover:text-vasati-purple'
                }`}
              >
                Profile
              </button>
            </div>
          )}

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
                  title="Full Desktop Web View"
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
      </nav>

      {/* Main View Container */}
      <div className="w-full flex-1 flex items-center justify-center p-0 md:p-6">
        {activeRole === 'owner' ? (
          <div className="w-full max-w-7xl">
            <OwnerPortal />
          </div>
        ) : activeRole === 'admin' ? (
          <div className="w-full max-w-7xl">
            <AdminDashboard />
          </div>
        ) : viewMode === 'mobile' ? (
          /* Mobile View: Seamless full-screen on mobile devices (< md), authentic smartphone frame preview on desktop (>= md) */
          <div className="w-full h-full md:my-4 md:max-w-[400px] md:h-[840px] md:max-h-[92vh] md:bg-black md:rounded-[48px] md:p-3 md:shadow-[0_25px_60px_-15px_rgba(92,22,197,0.35)] md:border-4 md:border-gray-800/80 flex flex-col overflow-hidden">
            {/* Screen Inner Container */}
            <div className="relative w-full h-full bg-white md:rounded-[38px] overflow-hidden flex flex-col shadow-inner">
              {/* Authentic 9:41 Status Bar (displayed in desktop preview frame) */}
              <div className={`hidden md:flex w-full px-6 pt-3 pb-1 items-center justify-between text-xs font-bold select-none z-40 transition-colors duration-200 ${
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

              {/* Bottom Home Indicator Bar (displayed in desktop preview frame) */}
              <div className="hidden md:flex w-full py-1.5 bg-white justify-center z-40">
                <div className="w-32 h-1 bg-gray-300 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          /* Full Responsive Desktop Web View */
          <div className="w-full max-w-7xl min-h-[820px] bg-white md:rounded-3xl shadow-xl overflow-hidden border border-purple-100 flex flex-col my-0 md:my-4">
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
            setActiveRole('customer');
            navigateTo('permissions');
          }}
        />
      )}
    </div>
  );
}

