import React, { useState } from 'react';
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Info,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface BookingScreenProps {
  property: any;
  onBack: () => void;
  onContinueToPayment: (bookingDetails: any) => void;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({
  property,
  onBack,
  onContinueToPayment,
}) => {
  const rooms = property?.rooms && property.rooms.length > 0 ? property.rooms : [
    {
      id: 'rm_1',
      room_type: 'Single Room',
      monthly_rent: 8000,
      security_deposit: 8000,
      description: 'Best for individuals',
      image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'rm_2',
      room_type: 'Sharing Room',
      monthly_rent: 6000,
      security_deposit: 6000,
      description: 'For 2 people',
      image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'rm_3',
      room_type: 'Triple Sharing',
      monthly_rent: 5000,
      security_deposit: 5000,
      description: 'For 3 people',
      image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0].id);
  const [selectedBed, setSelectedBed] = useState<string>('Bed A');
  const [duration, setDuration] = useState<number>(3); // 3 months default as in screenshot
  const [moveInDate, setMoveInDate] = useState<string>('2026-12-01');

  const selectedRoom = rooms.find((r: any) => r.id === selectedRoomId) || rooms[0];
  const monthlyRent = selectedRoom.monthly_rent;
  const securityDeposit = selectedRoom.security_deposit || monthlyRent;
  const totalStayRent = monthlyRent * duration;
  const totalPayable = totalStayRent; // Transparent breakdown

  const handleContinue = () => {
    onContinueToPayment({
      property_id: property.id,
      property_name: property.name,
      property_locality: property.locality,
      property_city: property.city,
      cover_image: property.cover_image || property.images?.[0]?.image_url,
      room_id: selectedRoom.id,
      room_type: selectedRoom.room_type,
      selected_bed: selectedRoom.room_type.includes('Sharing') ? selectedBed : 'Private Bed',
      duration_months: duration,
      move_in_date: moveInDate,
      monthly_rent: monthlyRent,
      security_deposit: securityDeposit,
      total_amount: totalPayable,
    });
  };

  return (
    <div className="w-full h-full bg-white flex flex-col justify-between font-sans relative">
      {/* Top Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 z-10">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-gray-100 text-vasati-dark transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h2 className="text-lg font-extrabold text-vasati-dark">Book Your Stay</h2>

        <div className="w-6" />
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-5 pb-24">
        {/* Select Room Type */}
        <div>
          <h3 className="text-sm font-extrabold text-vasati-dark mb-3">Select Room Type</h3>
          <div className="space-y-3">
            {rooms.map((room: any) => {
              const isSelected = selectedRoomId === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-vasati-purple bg-purple-50/40 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={room.image_url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80'}
                      alt={room.room_type}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-vasati-dark">{room.room_type}</h4>
                      <p className="text-xs font-black text-vasati-purple mt-0.5">
                        ₹{room.monthly_rent.toLocaleString('en-IN')}
                        <span className="text-[10px] font-normal text-gray-500"> / month</span>
                      </p>
                      <p className="text-[11px] text-gray-500">{room.description}</p>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-vasati-purple' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-vasati-purple" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Bed Selector for Sharing Rooms */}
        {selectedRoom.room_type.includes('Sharing') && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold text-vasati-dark">Select Bed</h3>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Availability
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'Bed A', name: 'Bed A', desc: 'Window side', status: 'available' },
                { id: 'Bed B', name: 'Bed B', desc: 'Door side', status: 'available' },
                ...(selectedRoom.room_type.includes('Triple')
                  ? [{ id: 'Bed C', name: 'Bed C', desc: 'Quiet corner', status: 'available' }]
                  : [{ id: 'Bed B2', name: 'Bed B2 (Booked)', desc: 'Occupied', status: 'occupied' }]),
              ].map(b => {
                const isSelected = selectedBed === b.id;
                const isOccupied = b.status === 'occupied';
                return (
                  <button
                    key={b.id}
                    disabled={isOccupied}
                    type="button"
                    onClick={() => setSelectedBed(b.id)}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      isOccupied
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'bg-gradient-to-r from-vasati-purple to-vasati-purple-vibrant text-white border-vasati-purple shadow-sm'
                        : 'bg-white border-vasati-purple-border text-vasati-dark hover:bg-vasati-purple-soft'
                    }`}
                  >
                    <p className="text-xs font-bold">{b.name}</p>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-purple-200' : 'text-vasati-secondary'}`}>
                      {b.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Duration matching Screen 6 */}
        <div>
          <h3 className="text-sm font-extrabold text-vasati-dark mb-2.5">Duration</h3>
          <div className="grid grid-cols-3 gap-2">
            {[1, 3, 6].map(m => {
              const isSelected = duration === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDuration(m)}
                  className={`py-2 rounded-2xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-vasati-purple to-vasati-purple-vibrant text-white shadow-md shadow-vasati-purple/20'
                      : 'bg-white text-vasati-secondary border border-vasati-purple-border hover:bg-vasati-purple-soft'
                  }`}
                >
                  {m} {m === 1 ? 'Month' : 'Months'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Move-in Date */}
        <div>
          <h3 className="text-sm font-extrabold text-vasati-dark mb-2">Move-in Date</h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-vasati-purple">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={moveInDate}
              onChange={e => setMoveInDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-vasati-dark focus:outline-none focus:ring-2 focus:ring-vasati-purple/30"
            />
          </div>
        </div>

        {/* Transparent Price Breakdown */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Rent ({duration} {duration === 1 ? 'Month' : 'Months'})</span>
            <span className="font-bold text-gray-900">₹{totalStayRent.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span>Security Deposit</span>
              <span className="text-[10px] text-emerald-600 font-bold">(100% Refundable)</span>
            </div>
            <span className="font-bold text-gray-900">₹{securityDeposit.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Maintenance & Wi-Fi</span>
            <span className="font-bold text-emerald-600">FREE</span>
          </div>

          <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-sm font-black text-vasati-dark">
            <span>Total Payable</span>
            <span className="text-vasati-purple font-black">₹{totalPayable.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 justify-center">
          <ShieldCheck className="w-4 h-4 text-vasati-purple" />
          <span>VASATI Anti-Bypass & Secure Booking Guarantee</span>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 flex items-center justify-between shadow-nav z-20">
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Amount</p>
          <p className="text-xl font-black text-vasati-purple leading-tight">
            ₹{totalPayable.toLocaleString('en-IN')}
          </p>
        </div>

        <button
          onClick={handleContinue}
          className="py-3.5 px-6 rounded-full bg-gradient-to-r from-vasati-purple to-vasati-purple-vibrant hover:from-vasati-royal hover:to-vasati-purple text-white font-extrabold text-xs shadow-lg shadow-vasati-purple/25 flex items-center gap-2 transition-all active:scale-98"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

