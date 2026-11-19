import React, { useState } from 'react';
import { ChatModal } from '../ChatModal';
import {
  ChevronLeft,
  Heart,
  Star,
  MapPin,
  Snowflake,
  Wifi,
  Utensils,
  SquareParking,
  ShieldCheck,
  ArrowUpDown,
  Zap,
  Video,
  Share2,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  PhoneCall,
  PhoneOff
} from 'lucide-react';

interface DetailsScreenProps {
  propertyId: string;
  onBack: () => void;
  onBookNow: (property: any) => void;
  savedIds: string[];
  onToggleSave: (propertyId: string) => void;
  isDesktop?: boolean;
}

const FACILITY_ICONS: Record<string, any> = {
  ac: { name: 'AC', icon: Snowflake },
  wifi: { name: 'Wi-Fi', icon: Wifi },
  meals: { name: 'Meals', icon: Utensils },
  parking: { name: 'Parking', icon: SquareParking },
  security: { name: 'Security', icon: ShieldCheck },
  lift: { name: 'Lift', icon: ArrowUpDown },
  power_backup: { name: 'Power Backup', icon: Zap },
  cctv: { name: 'CCTV', icon: Video },
};

export const DetailsScreen: React.FC<DetailsScreenProps> = ({
  propertyId,
  onBack,
  onBookNow,
  savedIds,
  onToggleSave,
  isDesktop = false,
}) => {
  const [property, setProperty] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');

  // Visit modal form states
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('11:00 AM');
  const [visitNotes, setVisitNotes] = useState('');
  const [visitSubmitted, setVisitSubmitted] = useState(false);

  // Chat message state
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  React.useEffect(() => {
    async function loadProperty() {
      try {
        setLoading(true);
        const res = await fetch(`/api/properties/${propertyId}`);
        const data = await res.json();
        if (data.success) {
          setProperty(data.property);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
  }, [propertyId]);

  if (loading || !property) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-vasati-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSaved = savedIds.includes(property.id);
  const images = property.images && property.images.length > 0
    ? property.images
    : [{ image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80' }];

  const handleRequestVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          visit_date: visitDate || new Date().toISOString().split('T')[0],
          visit_time: visitTime,
          notes: visitNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVisitSubmitted(true);
        setTimeout(() => {
          setVisitSubmitted(false);
          setShowVisitModal(false);
        }, 2200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    const newMsg = {
      sender_id: 'usr_cust_1',
      sender_name: 'Lakshminarayana G',
      message: chatMessage,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory(prev => [...prev, newMsg]);
    const outgoing = chatMessage;
    setChatMessage('');

    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          message: outgoing,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const renderPricingCard = (isMobileView: boolean) => (
    <div className={`p-5 md:p-6 rounded-3xl bg-white border border-vasati-purple-border/60 shadow-xl space-y-4 ${
      isMobileView ? 'w-full' : 'sticky top-6'
    }`}>
      {/* Monthly Rent Header */}
      <div className="flex items-baseline justify-between border-b border-purple-100/80 pb-3.5">
        <div>
          <span className="text-2xl md:text-3xl font-black text-vasati-purple tracking-tight">
            ₹{property.monthly_rent_from.toLocaleString('en-IN')}
          </span>
          <span className="text-xs md:text-sm text-vasati-secondary font-medium"> / month</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{property.rating}</span>
        </div>
      </div>

      {/* Pricing Breakdown Rows - Labels left, values right, no overlapping */}
      <div className="space-y-3 py-1 text-xs">
        {/* Deposit Row */}
        <div className="flex items-start justify-between gap-3 py-2 border-b border-purple-50">
          <span className="text-vasati-secondary font-medium shrink-0 pt-0.5">Deposit</span>
          <div className="text-right">
            <span className="font-extrabold text-vasati-dark block text-xs">
              ₹{property.security_deposit?.toLocaleString('en-IN') || '10,000'}
            </span>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
              Refundable
            </span>
          </div>
        </div>

        {/* Notice Period Row */}
        <div className="flex items-center justify-between gap-3 py-2 border-b border-purple-50">
          <span className="text-vasati-secondary font-medium shrink-0">Notice Period</span>
          <span className="font-extrabold text-vasati-dark text-right text-xs">
            {property.notice_period_days || 30} Days
          </span>
        </div>

        {/* Food Included Row */}
        <div className="flex items-center justify-between gap-3 py-2">
          <span className="text-vasati-secondary font-medium shrink-0">Food Included</span>
          <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-full text-right text-xs">
            3 Meals Daily
          </span>
        </div>
      </div>

      {/* Action Buttons: generous size, comfortable tap targets */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={() => onBookNow(property)}
          className="w-full h-12 px-5 rounded-full bg-gradient-to-r from-vasati-purple to-vasati-purple-vibrant hover:from-vasati-royal hover:to-vasati-purple text-white font-extrabold text-sm shadow-lg shadow-vasati-purple/25 transition-all flex items-center justify-center active:scale-98"
        >
          Book Now
        </button>
        <button
          onClick={() => setShowVisitModal(true)}
          className="w-full h-11 px-5 rounded-full bg-white border-2 border-vasati-purple text-vasati-purple hover:bg-vasati-purple-soft font-extrabold text-xs transition-all flex items-center justify-center active:scale-98"
        >
          Request a Visit
        </button>
        <button
          onClick={() => setShowChatModal(true)}
          className="w-full h-10 px-4 rounded-full bg-vasati-lavender/60 border border-vasati-purple-border/60 text-vasati-purple hover:bg-vasati-purple-soft font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <MessageSquare className="w-4 h-4 text-vasati-purple" />
          <span>Chat with Host</span>
        </button>
      </div>

      {/* Guarantee Badge */}
      <div className="p-3 bg-vasati-lavender/40 rounded-2xl border border-vasati-purple-border/50 text-[11px] text-vasati-secondary flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-vasati-purple shrink-0" />
        <span className="font-medium">VASATI Stay Guarantee • Zero Brokerage</span>
      </div>
    </div>
  );

  const renderFacilities = (isMobileView: boolean) => (
    <div className="mt-5">
      <h3 className="text-sm font-extrabold text-vasati-dark mb-3">Facilities</h3>
      {isMobileView ? (
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 w-full">
          {['ac', 'wifi', 'meals', 'parking', 'security', 'lift', 'power_backup', 'cctv'].map(key => {
            const item = FACILITY_ICONS[key];
            if (!item) return null;
            const Icon = item.icon;
            return (
              <div
                key={key}
                className="shrink-0 flex-shrink-0 min-w-[76px] h-[78px] flex flex-col items-center justify-center p-2 rounded-2xl bg-white border border-vasati-purple-border/60 shadow-sm"
              >
                <Icon className="w-5 h-5 text-vasati-purple mb-1.5 shrink-0" />
                <span className="text-[11px] font-bold text-vasati-dark text-center leading-tight whitespace-nowrap">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {['ac', 'wifi', 'meals', 'parking', 'security', 'lift', 'power_backup', 'cctv'].map(key => {
            const item = FACILITY_ICONS[key];
            if (!item) return null;
            const Icon = item.icon;
            return (
              <div
                key={key}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-vasati-purple-border/60 shadow-sm min-h-[76px] transition-all hover:border-vasati-purple/40 hover:bg-vasati-lavender/20"
              >
                <Icon className="w-5 h-5 text-vasati-purple mb-1.5 shrink-0" />
                <span className="text-[11px] font-bold text-vasati-dark text-center leading-tight">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderPropertyHeader = () => (
    <div className="space-y-2.5">
      {/* Title & Category Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-black text-vasati-dark leading-tight break-words">
            {property.name}
          </h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1 text-xs font-bold text-vasati-dark">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
              <span>{property.rating}</span>
            </div>
            <span className="text-xs text-vasati-secondary">({property.review_count} reviews)</span>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-semibold text-emerald-600">Verified PG</span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-vasati-lavender text-vasati-purple border border-vasati-purple-border/60 shrink-0 mt-0.5">
          {property.gender_category || property.category || 'Co-living'}
        </span>
      </div>

      {/* Location & Map Link */}
      <div className="flex items-center justify-between pt-1 pb-3 border-b border-gray-100 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-vasati-secondary min-w-0 flex-1">
          <MapPin className="w-4 h-4 text-vasati-purple shrink-0" />
          <span className="truncate">{property.locality}, {property.city}</span>
        </div>

        <button
          onClick={() => setShowMapModal(true)}
          className="text-xs font-bold text-vasati-purple hover:underline flex items-center gap-1 shrink-0"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>View on Map</span>
        </button>
      </div>
    </div>
  );

  const renderAboutAndRooms = () => (
    <>
      {/* About this PG */}
      <div className="mt-5">
        <h3 className="text-sm font-extrabold text-vasati-dark mb-2">About this PG</h3>
        <p className="text-xs text-vasati-secondary leading-relaxed">
          {property.description}
        </p>
      </div>

      {/* Available Room Types */}
      <div className="mt-5">
        <h3 className="text-sm font-extrabold text-vasati-dark mb-2.5">Available Room Types</h3>
        <div className="space-y-2.5">
          {property.rooms && property.rooms.map((room: any) => (
            <div
              key={room.id}
              className="p-3.5 rounded-2xl border border-purple-100 bg-vasati-lavender/30 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-vasati-dark">{room.room_type}</h4>
                <p className="text-[10px] text-vasati-secondary truncate">{room.description}</p>
                <p className="text-[10px] font-bold text-emerald-600 mt-0.5">
                  {room.available_beds} beds available
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-black text-vasati-purple">
                  ₹{room.monthly_rent.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-vasati-secondary">/mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderHostCard = () => (
    <div className="mt-5 p-4 rounded-2xl bg-vasati-lavender/40 border border-vasati-purple-border/60 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vasati-purple to-vasati-purple-vibrant text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
          VS
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-xs font-bold text-vasati-dark truncate">
              {property.owner?.businessName || property.owner?.name || 'Verified Host'}
            </h4>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-700 shrink-0">
              KYC Verified
            </span>
          </div>
          <p className="text-[10px] text-vasati-secondary truncate mt-0.5">
            {property.owner?.contactMode || 'Virtual Number Protection Active'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            setShowCallModal(true);
            setCallStatus('connecting');
            setTimeout(() => setCallStatus('ringing'), 1000);
            setTimeout(() => setCallStatus('connected'), 2600);
          }}
          className="w-9 h-9 rounded-full bg-white text-emerald-600 shadow-sm border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center"
          title="Masked Audio Call"
        >
          <PhoneCall className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowChatModal(true)}
          className="w-9 h-9 rounded-full bg-white text-vasati-purple shadow-sm border border-vasati-purple-border/40 hover:bg-vasati-purple hover:text-white transition-colors flex items-center justify-center"
          title="Chat with Host"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="mt-5 pb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-extrabold text-vasati-dark">Ratings & Reviews</h3>
        <span className="text-xs font-bold text-vasati-purple">4.7 / 5.0</span>
      </div>
      <div className="p-3.5 rounded-2xl bg-vasati-lavender/25 border border-vasati-purple-border/40">
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-xs font-bold text-vasati-dark ml-1">Lakshminarayana G</span>
        </div>
        <p className="text-xs text-vasati-secondary leading-relaxed">
          Spacious room, fast Wi-Fi, and very supportive staff. The food is hygienic and fresh!
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-white flex flex-col justify-between font-sans relative">
      {/* Scrollable Details Body */}
      <div className={`flex-1 overflow-y-auto no-scrollbar ${isDesktop ? 'pb-12' : 'pb-24'}`}>
        {/* Hero Gallery with Floating Buttons */}
        <div className={`relative w-full ${isDesktop ? 'h-80 lg:h-96 rounded-b-3xl' : 'h-64'} bg-gray-900 overflow-hidden shadow-sm`}>
          <img
            src={images[activeImageIndex]?.image_url}
            alt={property.name}
            className="w-full h-full object-cover transition-all duration-300"
          />

          {/* Floating Back Button */}
          <button
            onClick={onBack}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-vasati-dark hover:bg-white shadow-md z-10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Floating Save & Share */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => onToggleSave(property.id)}
              className="w-9 h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-gray-700 hover:text-red-500 shadow-md transition-all"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          {/* Image Counter Badge matching Screen 5: "1/8" */}
          <div className="absolute bottom-3 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {activeImageIndex + 1}/{images.length}
          </div>

          {/* Thumbnail Dot Strip */}
          <div className="absolute bottom-3 left-4 flex gap-1.5">
            {images.slice(0, 5).map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeImageIndex === idx ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Container */}
        <div className={`w-full ${isDesktop ? 'max-w-6xl mx-auto px-6 pt-6' : 'px-4 pt-4'}`}>
          {isDesktop ? (
            /* Desktop Layout: Main Info on Left (Col 1-8), Sticky Pricing on Right (Col 9-12) */
            <div className="grid grid-cols-12 gap-8 items-start">
              <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-6">
                {renderPropertyHeader()}
                {renderFacilities(false)}
                {renderAboutAndRooms()}
                {renderHostCard()}
                {renderReviews()}
              </div>

              <div className="col-span-12 lg:col-span-5 xl:col-span-4">
                {renderPricingCard(false)}
              </div>
            </div>
          ) : (
            /* Mobile Layout: 100% Single-Column Stack */
            <div className="w-full flex flex-col space-y-5">
              {renderPropertyHeader()}
              {renderFacilities(true)}
              {renderAboutAndRooms()}
              {renderHostCard()}
              {/* Full Width Mobile Pricing & Booking Panel */}
              <div className="w-full pt-1">
                {renderPricingCard(true)}
              </div>
              {renderReviews()}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Actions Bar (Mobile Only) */}
      {!isDesktop && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-purple-100 p-3.5 flex items-center gap-3 shadow-nav z-20">
          <button
            onClick={() => setShowVisitModal(true)}
            className="flex-1 h-11 px-4 rounded-full bg-white border-2 border-vasati-purple text-vasati-purple hover:bg-vasati-purple-soft font-extrabold text-xs transition-all active:scale-98 flex items-center justify-center"
          >
            Request a Visit
          </button>

          <button
            onClick={() => onBookNow(property)}
            className="flex-1 h-11 px-4 rounded-full bg-gradient-to-r from-vasati-purple to-vasati-purple-vibrant hover:from-vasati-royal hover:to-vasati-purple text-white font-extrabold text-xs shadow-lg shadow-vasati-purple/25 transition-all active:scale-98 flex items-center justify-center"
          >
            Book Now
          </button>
        </div>
      )}

      {/* Request Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setShowVisitModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {visitSubmitted ? (
              <div className="text-center py-6">
                <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3 animate-bounce" />
                <h3 className="text-base font-extrabold text-vasati-dark">Visit Requested!</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Unique Visit ID generated. The owner will confirm within 2 hours.
                </p>
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-purple-50 text-vasati-purple text-xs font-bold">
                  VST-VAS-{Math.floor(1000 + Math.random() * 9000)}
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestVisit}>
                <h3 className="text-base font-extrabold text-vasati-dark">Schedule a Visit</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visit {property.name} before booking.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={e => setVisitDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-vasati-purple/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      value={visitTime}
                      onChange={e => setVisitTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-vasati-purple/30"
                    >
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>02:00 PM</option>
                      <option>04:00 PM</option>
                      <option>06:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Special Questions / Requests
                    </label>
                    <textarea
                      value={visitNotes}
                      onChange={e => setVisitNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g. Want to see single room with desk..."
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-vasati-purple/30"
                    />
                  </div>

                  {/* Anti-Bypass Location Notice */}
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-[11px] text-purple-900 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-vasati-purple shrink-0 mt-0.5" />
                    <span>
                      Approximate landmark shown. Exact street address is unlocked instantly once the host confirms your visit.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 rounded-full bg-vasati-purple hover:bg-vasati-purple-dark text-white font-bold text-xs shadow-md transition-all"
                >
                  Confirm Visit Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Approximate Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setShowMapModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-extrabold text-vasati-dark">Approximate Location</h3>
            <p className="text-xs text-gray-500 mt-0.5">{property.approximate_location}</p>

            <div className="mt-3 relative w-full h-48 bg-purple-50 rounded-2xl overflow-hidden border border-purple-100 flex items-center justify-center">
              <div className="absolute inset-0 opacity-50 bg-[radial-gradient(#5C16C5_1px,transparent_1px)] [background-size:16px_16px]" />
              {/* Safe Radius Circle */}
              <div className="w-28 h-28 rounded-full bg-vasati-purple/15 border-2 border-dashed border-vasati-purple flex items-center justify-center animate-pulse">
                <MapPin className="w-8 h-8 text-vasati-purple" />
              </div>
            </div>

            <div className="mt-3 text-[11px] text-gray-500 text-center">
              🛡️ Anti-Bypass Protection: Exact unit address unlocked upon confirmed visit or booking.
            </div>

            <button
              onClick={() => setShowMapModal(false)}
              className="w-full mt-3 py-2.5 rounded-full bg-vasati-purple text-white text-xs font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Fully Functional In-App Masked Chat Modal */}
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        propertyId={property.id}
        propertyName={property.name}
        hostName={property.owner?.name || property.owner?.businessName || 'Host'}
        customerId="usr_cust_1"
        customerName="Lakshminarayana G"
      />

      {/* Masked Consent Calling Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center text-center animate-fade-in relative border border-purple-500/30">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 animate-pulse border-2 border-emerald-500/40">
              <PhoneCall className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-mono text-purple-300 uppercase tracking-widest bg-purple-900/60 px-3 py-0.5 rounded-full mb-1">
              VASATI Secure Telephony Bridge
            </span>

            <h3 className="text-base font-extrabold">{property.name} Host</h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              Masked Virtual: +91 80 4719 3200 (Ext: 8812)
            </p>

            <div className="my-5 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 w-full text-xs space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>Tenant Identity:</span>
                <span className="text-white font-bold">Lakshminarayana G</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Host Phone:</span>
                <span className="text-emerald-400 font-bold">Masked & Protected</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Call Status:</span>
                <span className="font-bold uppercase text-amber-400">{callStatus}</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 mb-5">
              🛡️ Anti-Bypass Notice: Direct numbers are masked. Conversations are attributed to your enquiry ID for booking protection.
            </p>

            <button
              onClick={() => setShowCallModal(false)}
              className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

