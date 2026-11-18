import React, { useState, useEffect } from 'react';
import {
  Building2,
  PlusCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  MapPin,
  Clock,
  FileText,
  AlertCircle,
  Eye,
  Check,
  X,
  ChevronRight,
  Filter
} from 'lucide-react';
import { VasatiLogo } from '../VasatiLogo';

export const OwnerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'add_pg' | 'visits' | 'bookings' | 'commissions'>('dashboard');
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add PG form states
  const [pgName, setPgName] = useState('');
  const [pgLocality, setPgLocality] = useState('');
  const [pgAddress, setPgAddress] = useState('');
  const [pgCategory, setPgCategory] = useState('Co-living');
  const [pgRent, setPgRent] = useState(8000);
  const [pgDeposit, setPgDeposit] = useState(8000);
  const [pgDescription, setPgDescription] = useState('');
  const [pgImgUrl, setPgImgUrl] = useState('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80');
  const [pgCreated, setPgCreated] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, bRes, vRes, cRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/bookings?ownerId=usr_own_1'),
        fetch('/api/visits?ownerId=usr_own_1'),
        fetch('/api/commissions?ownerId=usr_own_1'),
      ]);

      const [pData, bData, vData, cData] = await Promise.all([
        pRes.json(),
        bRes.json(),
        vRes.json(),
        cRes.json(),
      ]);

      if (pData.success) setProperties(pData.properties);
      if (bData.success) setBookings(bData.bookings);
      if (vData.success) setVisits(vData.visits);
      if (cData.success) setCommissions(cData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actorId: 'usr_own_1', actorRole: 'owner' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Booking updated to ${status}`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateVisitStatus = async (visitId: string, status: string) => {
    try {
      const res = await fetch('/api/visits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: visitId, status, actorId: 'usr_own_1' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Visit updated to ${status}`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: 'usr_own_1',
          name: pgName,
          locality: pgLocality,
          address_line: pgAddress,
          category: pgCategory,
          monthly_rent_from: Number(pgRent),
          security_deposit: Number(pgDeposit),
          description: pgDescription,
          images: [pgImgUrl],
          rooms: [
            { room_type: 'Single Room', monthly_rent: Number(pgRent), security_deposit: Number(pgDeposit) },
            { room_type: 'Sharing Room', monthly_rent: Math.round(Number(pgRent) * 0.75), security_deposit: Number(pgDeposit) },
          ],
          amenities: ['wifi', 'meals', 'ac', 'security'],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPgCreated(true);
        setTimeout(() => {
          setPgCreated(false);
          setActiveTab('properties');
          loadData();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans pb-16">
      {/* Owner Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VasatiLogo size="sm" showTagline={false} />
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-vasati-purple">
                Host Portal
              </span>
              <p className="text-xs font-bold text-gray-700">Sri Sai Stays & Hospitality</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              KYC Verified Host
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 overflow-x-auto no-scrollbar text-xs font-bold border-t border-gray-100">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'properties', label: 'My Properties', icon: Building2 },
            { id: 'add_pg', label: 'Add New PG', icon: PlusCircle },
            { id: 'visits', label: `Visits (${visits.filter(v => v.status === 'pending').length} Pending)`, icon: Calendar },
            { id: 'bookings', label: 'Bookings & Check-ins', icon: Users },
            { id: 'commissions', label: 'Commission & Settlements', icon: DollarSign },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-vasati-purple text-vasati-purple'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-vasati-purple border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400 mt-2">Loading Host Hub...</p>
          </div>
        ) : (
          <>
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Properties</p>
                    <p className="text-2xl font-black text-vasati-dark mt-1">{properties.length}</p>
                    <p className="text-[11px] text-emerald-600 font-bold mt-1">100% Listed & Verified</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Bookings</p>
                    <p className="text-2xl font-black text-vasati-purple mt-1">{bookings.length}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Confirmed Tenants</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gross Booking Value</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">
                      ₹{(commissions?.summary?.totalGross || 24000).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">Processed safely via VASATI</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Owner Payout</p>
                    <p className="text-2xl font-black text-vasati-dark mt-1">
                      ₹{(commissions?.summary?.totalOwnerPayout || 23360).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-purple-700 font-bold mt-1">
                      After 8% 1st Month Commission (₹{commissions?.summary?.totalCommissions || 640})
                    </p>
                  </div>
                </div>

                {/* Owner Commission Agreement Notice */}
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-vasati-purple shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-vasati-purple uppercase tracking-wider">
                        VASATI Owner Commission Policy: 8% on 1st Month Rent
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5 max-w-3xl">
                        As agreed in your Host Agreement, VASATI charges an industry-leading transparent fee of 8% only on the first month's agreed rent upon confirmed move-in. Subsequent months carry 0% platform commission! Security deposits are strictly untouched.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white text-vasati-purple text-xs font-bold rounded-full border border-purple-200">
                    Active & Bound
                  </span>
                </div>

                {/* Pending Visits & Recent Bookings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pending Visits */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-extrabold text-vasati-dark">Visit Requests</h3>
                      <button
                        onClick={() => setActiveTab('visits')}
                        className="text-xs font-bold text-vasati-purple hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {visits.slice(0, 3).map(v => (
                        <div key={v.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-vasati-dark">{v.customer_name}</span>
                              <span className="text-[10px] font-mono text-gray-500">{v.visit_code}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {v.visit_date} at {v.visit_time} • {v.property_name}
                            </p>
                          </div>

                          {v.status === 'pending' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleUpdateVisitStatus(v.id, 'approved')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateVisitStatus(v.id, 'rejected')}
                                className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-[11px] font-bold rounded-lg"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {v.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Bookings */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-extrabold text-vasati-dark">Recent Bookings</h3>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="text-xs font-bold text-vasati-purple hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {bookings.slice(0, 3).map(b => (
                        <div key={b.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-vasati-dark">{b.customer_name}</span>
                              <span className="text-[10px] font-mono text-vasati-purple">{b.booking_code}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {b.room_type} • Move-in: {b.move_in_date}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-vasati-purple">
                              ₹{b.total_amount?.toLocaleString('en-IN')}
                            </span>
                            <p className="text-[10px] font-bold text-emerald-600">{b.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROPERTIES */}
            {activeTab === 'properties' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-vasati-dark">My Registered PG Properties</h3>
                  <button
                    onClick={() => setActiveTab('add_pg')}
                    className="px-4 py-2 bg-vasati-purple text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Another PG</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {properties.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="relative h-44 w-full">
                          <img
                            src={p.cover_image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80'}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black text-vasati-purple">
                            {p.category}
                          </span>
                        </div>

                        <div className="p-4">
                          <h4 className="text-sm font-extrabold text-vasati-dark">{p.name}</h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-vasati-purple" />
                            {p.locality}, {p.city}
                          </p>

                          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                            <div>
                              <p className="text-[10px] text-gray-400">Monthly Rent</p>
                              <p className="font-black text-vasati-purple">₹{p.monthly_rent_from?.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400">Security Deposit</p>
                              <p className="font-bold text-gray-700">₹{p.security_deposit?.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400">Rating</p>
                              <p className="font-bold text-amber-600">★ {p.rating}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Live on VASATI
                        </span>
                        <span className="font-mono text-[10px] text-gray-400">{p.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ADD NEW PG */}
            {activeTab === 'add_pg' && (
              <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-md">
                <h3 className="text-lg font-extrabold text-vasati-dark">Add New PG Property</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Publish a new property to the VASATI marketplace. Instant anti-bypass masking applied.
                </p>

                {pgCreated ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
                    <h4 className="text-base font-extrabold text-vasati-dark">Property Created!</h4>
                    <p className="text-xs text-gray-500 mt-1">Your new PG is now published and live.</p>
                  </div>
                ) : (
                  <form onSubmit={handleCreatePg} className="mt-6 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">PG Name</label>
                      <input
                        type="text"
                        required
                        value={pgName}
                        onChange={e => setPgName(e.target.value)}
                        placeholder="e.g. Sri Sai Executive Luxury PG"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-vasati-purple/30"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Category</label>
                        <select
                          value={pgCategory}
                          onChange={e => setPgCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs"
                        >
                          <option>Co-living</option>
                          <option>Boys PG</option>
                          <option>Girls PG</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Locality (Bengaluru)</label>
                        <input
                          type="text"
                          required
                          value={pgLocality}
                          onChange={e => setPgLocality(e.target.value)}
                          placeholder="e.g. Koramangala 5th Block"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Full Street Address</label>
                      <input
                        type="text"
                        required
                        value={pgAddress}
                        onChange={e => setPgAddress(e.target.value)}
                        placeholder="e.g. #42, 7th Cross, Near Sony World Signal"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        * Exact flat/building number will remain masked from public visitors until a visit or booking is approved.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Monthly Rent Starting From (₹)</label>
                        <input
                          type="number"
                          required
                          value={pgRent}
                          onChange={e => setPgRent(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Security Deposit (₹)</label>
                        <input
                          type="number"
                          required
                          value={pgDeposit}
                          onChange={e => setPgDeposit(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Photo Image URL</label>
                      <input
                        type="url"
                        value={pgImgUrl}
                        onChange={e => setPgImgUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Property Description</label>
                      <textarea
                        rows={3}
                        value={pgDescription}
                        onChange={e => setPgDescription(e.target.value)}
                        placeholder="Describe room amenities, Wi-Fi speed, food schedule..."
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-vasati-purple hover:bg-vasati-purple-dark text-white font-extrabold text-xs shadow-lg transition-all"
                    >
                      Publish Property to VASATI
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB: VISITS */}
            {activeTab === 'visits' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-base font-extrabold text-vasati-dark">Visit Requests Management</h3>
                <p className="text-xs text-gray-500">
                  Accept or reject prospective tenant visits. Exact address coordinates unlock only upon your approval.
                </p>

                <div className="divide-y divide-gray-100">
                  {visits.map(v => (
                    <div key={v.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-vasati-dark">{v.customer_name}</span>
                          <span className="text-[10px] font-mono text-vasati-purple font-bold">{v.visit_code}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {v.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Date: <span className="font-bold text-gray-800">{v.visit_date}</span> at <span className="font-bold text-gray-800">{v.visit_time}</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">Property: {v.property_name}</p>
                        {v.notes && <p className="text-[11px] text-gray-500 italic mt-0.5">Tenant note: "{v.notes}"</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        {v.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateVisitStatus(v.id, 'approved')}
                              className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                            >
                              Approve Visit
                            </button>
                            <button
                              onClick={() => handleUpdateVisitStatus(v.id, 'rejected')}
                              className="px-4 py-1.5 rounded-full bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300"
                            >
                              Reject
                            </button>
                          </>
                        ) : v.status === 'approved' ? (
                          <button
                            onClick={() => handleUpdateVisitStatus(v.id, 'completed')}
                            className="px-4 py-1.5 rounded-full bg-vasati-purple text-white text-xs font-bold"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Completed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: BOOKINGS & CHECK-INS */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-base font-extrabold text-vasati-dark">Tenant Bookings & Check-ins</h3>
                <p className="text-xs text-gray-500">
                  Manage incoming bookings across all 10 stages: Pending, Confirmed, Move-in Pending, Checked In.
                </p>

                <div className="divide-y divide-gray-100">
                  {bookings.map(b => (
                    <div key={b.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-vasati-dark">{b.customer_name}</span>
                          <span className="text-xs font-mono font-bold text-vasati-purple">{b.booking_code}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-vasati-purple">
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Property: <span className="font-bold">{b.property_name}</span> • Room: {b.room_type}
                        </p>
                        <p className="text-xs text-gray-500">
                          Move-in Target: {b.move_in_date} • Duration: {b.duration_months} Months
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs font-black text-vasati-purple">
                            Total: ₹{b.total_amount?.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-bold">
                            Net Host Payout: ₹{b.owner_net_amount ? b.owner_net_amount.toLocaleString('en-IN') : (b.total_amount - 640).toLocaleString('en-IN')}
                          </p>
                        </div>

                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'Checked In')}
                            className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                          >
                            Confirm Check-in
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: COMMISSIONS & SETTLEMENTS */}
            {activeTab === 'commissions' && (
              <div className="space-y-6">
                {/* 8% Commission Formula Explainer Card */}
                <div className="bg-gradient-to-r from-vasati-purple to-purple-800 text-white rounded-3xl p-6 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                        Transparent Commission Standard
                      </span>
                      <h3 className="text-xl font-black mt-2">VASATI 8% Commission Model</h3>
                      <p className="text-xs text-purple-200 mt-1 max-w-xl">
                        Calculated at exactly 8% of the first month's agreed rent only upon successful booking confirmation. No hidden charges. Security deposits are exempt from commission.
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs">
                      <p className="font-bold text-purple-200">Formula Example:</p>
                      <p className="mt-1">Monthly Rent: <span className="font-bold">₹8,000</span></p>
                      <p>VASATI Fee (8%): <span className="font-bold text-vasati-orange">₹640</span></p>
                      <p className="font-bold text-white mt-1">Host Net Payout: ₹7,360</p>
                    </div>
                  </div>
                </div>

                {/* Statements Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-base font-extrabold text-vasati-dark mb-4">Commission Statements & Ledger</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="pb-3">Invoice #</th>
                          <th className="pb-3">Booking Code</th>
                          <th className="pb-3">1st Mo Rent</th>
                          <th className="pb-3">VASATI Fee (8%)</th>
                          <th className="pb-3">Net Host Payout</th>
                          <th className="pb-3">Settlement</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {commissions?.statements?.map((stmt: any) => (
                          <tr key={stmt.id} className="hover:bg-gray-50">
                            <td className="py-3 font-mono font-bold text-vasati-purple">{stmt.invoice_number}</td>
                            <td className="py-3 font-mono">{stmt.booking_code}</td>
                            <td className="py-3 font-bold text-gray-800">₹{stmt.base_first_month_rent?.toLocaleString('en-IN')}</td>
                            <td className="py-3 font-bold text-vasati-orange">₹{stmt.commission_amount?.toLocaleString('en-IN')}</td>
                            <td className="py-3 font-extrabold text-emerald-600">₹{stmt.owner_net_amount?.toLocaleString('en-IN')}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {stmt.settlement_status || 'PROCESSED'}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => alert(`Downloaded Invoice ${stmt.invoice_number}`)}
                                className="text-vasati-purple font-bold hover:underline"
                              >
                                Statement
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

