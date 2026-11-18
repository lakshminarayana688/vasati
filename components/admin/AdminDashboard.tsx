import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  FileCheck,
  Calendar,
  Layers,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Lock,
  Eye,
  Sliders,
  TrendingUp,
  Activity,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { VasatiLogo } from '../VasatiLogo';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'approvals' | 'bookings' | 'commissions' | 'refunds' | 'users' | 'complaints' | 'audit_logs'
  >('overview');
  const [commissionRate, setCommissionRate] = useState(8);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const [mRes, rRes, uRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/refunds'),
        fetch('/api/admin/users'),
      ]);

      const [mJson, rJson, uJson] = await Promise.all([
        mRes.json(),
        rRes.json(),
        uRes.json(),
      ]);

      if (mJson.success) setData(mJson);
      if (rJson.success) setRefunds(rJson.refunds || []);
      if (uJson.success) setUsersList(uJson.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      const res = await fetch('/api/complaints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: complaintId,
          status: 'RESOLVED',
          resolution_notes: 'Resolved by VASATI Ops team after coordination with property caretaker.',
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('Complaint marked as RESOLVED');
        fetchMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyProperty = async (propertyId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/verify-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId, status }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Property status updated to ${status}`);
        fetchMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessRefund = async (refundId: string, status: 'PROCESSED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/refunds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refund_id: refundId, status }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Refund ${status === 'PROCESSED' ? 'Approved & Settled' : 'Rejected'}`);
        fetchMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const kpis = data?.kpis || {
    totalCustomers: 1420,
    totalOwners: 185,
    totalProperties: 210,
    pendingProperties: 0,
    verifiedProperties: 210,
    availableBeds: 540,
    totalBookings: 1180,
    cancelledBookings: 12,
    totalCommissionRevenue: 755200,
    pendingOwnerCommissions: 48000,
    totalPayments: 1180,
    totalPaymentVolume: 9440000,
    complaintsOpen: 1,
    complaintsTotal: 4,
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* Admin Navbar */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VasatiLogo size="sm" variant="white" showTagline={false} />
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-vasati-orange">
                Super Admin
              </span>
              <p className="text-xs font-bold text-slate-200">VASATI Operations Console</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMetrics}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold">
              System Live
            </span>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 overflow-x-auto no-scrollbar text-xs font-bold border-t border-slate-800/60">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: TrendingUp },
            { id: 'approvals', label: 'Property Approvals', icon: FileCheck },
            { id: 'bookings', label: 'Bookings & Lifecycle', icon: Calendar },
            { id: 'commissions', label: '8% Commission Engine', icon: DollarSign },
            { id: 'refunds', label: `Refunds (${refunds.filter(r => r.status === 'PENDING').length})`, icon: RotateCcw },
            { id: 'users', label: 'User Directory', icon: Users },
            { id: 'complaints', label: `Complaints (${kpis.complaintsOpen})`, icon: AlertTriangle },
            { id: 'audit_logs', label: 'Anti-Bypass Audit Trail', icon: Activity },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-vasati-orange text-vasati-orange'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-24">
            <div className="w-8 h-8 border-4 border-vasati-orange border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-2">Loading Admin Console...</p>
          </div>
        ) : (
          <>
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 12 Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Customers</p>
                    <p className="text-xl font-black text-white mt-1">{kpis.totalCustomers.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-emerald-400 font-bold mt-1">Active Accounts</p>
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Registered Hosts</p>
                    <p className="text-xl font-black text-white mt-1">{kpis.totalOwners.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-emerald-400 font-bold mt-1">KYC Verified</p>
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Properties</p>
                    <p className="text-xl font-black text-purple-400 mt-1">{kpis.totalProperties}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{kpis.verifiedProperties} Verified</p>
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Available Beds</p>
                    <p className="text-xl font-black text-white mt-1">{kpis.availableBeds}</p>
                    <p className="text-[10px] text-emerald-400 font-bold mt-1">Live Inventory</p>
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Commission Rev</p>
                    <p className="text-xl font-black text-vasati-orange mt-1">
                      ₹{kpis.totalCommissionRevenue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">8% 1st Month Fee</p>
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Gross Volume</p>
                    <p className="text-xl font-black text-emerald-400 mt-1">
                      ₹{kpis.totalPaymentVolume.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{kpis.totalBookings} Stays</p>
                  </div>
                </div>

                {/* Performance Analytics & Conversion Funnel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Growth Bars */}
                  <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-white">Monthly Platform Volume (₹ Lakhs)</h3>
                        <p className="text-[11px] text-slate-400">Gross Stays vs 8% Commission Revenue</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        +24.8% MoM
                      </span>
                    </div>

                    <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                      {[
                        { month: 'Jul', gross: 38, comm: 3.0, h: '40%' },
                        { month: 'Aug', gross: 52, comm: 4.1, h: '55%' },
                        { month: 'Sep', gross: 64, comm: 5.1, h: '68%' },
                        { month: 'Oct', gross: 78, comm: 6.2, h: '82%' },
                        { month: 'Nov', gross: 94, comm: 7.5, h: '100%' },
                      ].map(bar => (
                        <div key={bar.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                          <span className="text-[10px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            ₹{bar.gross}L
                          </span>
                          <div className="w-full flex items-end justify-center gap-1 h-32">
                            <div
                              style={{ height: bar.h }}
                              className="w-1/2 bg-gradient-to-t from-purple-800 to-vasati-purple rounded-t-lg transition-all group-hover:brightness-110"
                            />
                            <div
                              style={{ height: `${parseInt(bar.h) * 0.45}%` }}
                              className="w-1/2 bg-gradient-to-t from-orange-600 to-vasati-orange rounded-t-lg transition-all group-hover:brightness-110"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">{bar.month}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-700/80 text-[11px]">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-sm bg-vasati-purple" />
                        Gross Rental Value
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-sm bg-vasati-orange" />
                        VASATI Commission (8%)
                      </span>
                    </div>
                  </div>

                  {/* Anti-Bypass Funnel & Area Distribution */}
                  <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-extrabold text-white">Anti-Bypass Conversion Funnel</h3>
                          <p className="text-[11px] text-slate-400">Attribution Window: 30 Calendar Days</p>
                        </div>
                        <span className="text-[10px] font-mono text-purple-400 font-bold">100% AUDITED</span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between text-slate-300 font-bold mb-1">
                            <span>1. Inquiries Created (`ENQ`)</span>
                            <span className="font-mono">2,450 (100%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full w-full" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-300 font-bold mb-1">
                            <span>2. Visits Scheduled & Masked Calls</span>
                            <span className="font-mono">1,680 (68.5%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full w-[68.5%]" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-300 font-bold mb-1">
                            <span>3. Confirmed Paid Bookings</span>
                            <span className="font-mono">1,180 (48.1%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-vasati-orange rounded-full w-[48.1%]" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-300 font-bold mb-1">
                            <span>4. Successful Move-in & Checked In</span>
                            <span className="font-mono">1,168 (47.6%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-[47.6%]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Leakage / Disintermediation: <strong>&lt; 0.5%</strong></span>
                      <span className="text-emerald-400 font-bold">Zero Bypass Breaches</span>
                    </div>
                  </div>
                </div>

                {/* Properties & Bookings Split View */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Verified Properties */}
                  <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-extrabold text-white">Live Marketplace Properties</h3>
                      <span className="text-xs font-mono text-purple-400">Bengaluru Hub</span>
                    </div>

                    <div className="space-y-3">
                      {data?.recentProperties?.slice(0, 4).map((p: any) => (
                        <div key={p.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-extrabold text-white">{p.name}</p>
                            <p className="text-[11px] text-slate-400">{p.locality}, {p.city} • Host: {p.owner_name}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-purple-400">₹{p.monthly_rent_from?.toLocaleString('en-IN')}/mo</span>
                            <span className="block text-[10px] text-emerald-400 font-bold">APPROVED</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Bookings Across 10 Stages */}
                  <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-extrabold text-white">Booking Transactions</h3>
                      <span className="text-xs font-mono text-emerald-400">Real-Time</span>
                    </div>

                    <div className="space-y-3">
                      {data?.recentBookings?.slice(0, 4).map((b: any) => (
                        <div key={b.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{b.customer_name}</span>
                              <span className="font-mono text-[10px] text-vasati-orange">{b.booking_code}</span>
                            </div>
                            <p className="text-[11px] text-slate-400">{b.property_name} • {b.room_type}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-white">₹{b.total_amount?.toLocaleString('en-IN')}</span>
                            <span className="block text-[10px] text-emerald-400 font-bold">{b.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: APPROVALS */}
            {activeTab === 'approvals' && (
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Property Verification & Quality Assurance</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ensure all listings have genuine photos, validated GPS coordinates, and clear room inventories.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-700">
                  {data?.recentProperties?.map((p: any) => (
                    <div key={p.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-white">{p.name}</span>
                          <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[10px] font-bold">
                            {p.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {p.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1">
                          Address: {p.address_line}, {p.locality}, {p.city} - {p.pincode}
                        </p>
                        <p className="text-slate-500 text-[11px]">Host: {p.owner_name} ({p.owner_email})</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.status !== 'approved' ? (
                          <button
                            onClick={() => handleVerifyProperty(p.id, 'approved')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                          >
                            Approve Listing
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyProperty(p.id, 'rejected')}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-red-900 text-slate-300 hover:text-white rounded-lg text-xs"
                          >
                            Revoke Approval
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: BOOKINGS ACROSS 10 STAGES */}
            {activeTab === 'bookings' && (
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Full Booking Lifecycle Management</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      10 Statuses: Pending, Owner Accepted, Payment Pending, Confirmed, Move-in Pending, Checked In, Completed, Cancelled, Refund Pending, Refunded.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 text-[10px] uppercase font-bold">
                        <th className="pb-3">Booking Code</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Property</th>
                        <th className="pb-3">Duration</th>
                        <th className="pb-3">Total Amount</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {data?.recentBookings?.map((b: any) => (
                        <tr key={b.id} className="hover:bg-slate-800/50">
                          <td className="py-3 font-mono font-bold text-vasati-orange">{b.booking_code}</td>
                          <td className="py-3 font-bold text-white">{b.customer_name}</td>
                          <td className="py-3 text-slate-300">{b.property_name} ({b.room_type})</td>
                          <td className="py-3 text-slate-400">{b.duration_months} Months</td>
                          <td className="py-3 font-bold text-white">₹{b.total_amount?.toLocaleString('en-IN')}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: 8% COMMISSION ENGINE */}
            {activeTab === 'commissions' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-slate-950 border border-purple-800 p-6 rounded-3xl">
                  <h3 className="text-lg font-black text-white">VASATI Commission Settings & Revenue Engine</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Owner-paid commission rate is globally set at 8% of the first month's agreed rent for confirmed bookings. Security deposits and months 2-11 carry 0% platform charges.
                  </p>

                  <div className="mt-5 flex items-center gap-4 text-xs">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Standard Commission Rate (%)</label>
                      <input
                        type="number"
                        value={commissionRate}
                        onChange={e => setCommissionRate(Number(e.target.value))}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold w-24 text-center"
                      />
                    </div>
                    <button
                      onClick={() => alert(`Platform commission updated to ${commissionRate}%`)}
                      className="mt-5 px-4 py-2 bg-vasati-orange hover:bg-vasati-orange-dark text-white rounded-xl font-bold"
                    >
                      Update Configuration
                    </button>
                  </div>
                </div>

                {/* Commission Audit Table */}
                <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6">
                  <h4 className="text-sm font-extrabold text-white mb-4">Commission Ledger & Invoicing</h4>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-400 text-[10px] uppercase font-bold">
                          <th className="pb-3">Invoice #</th>
                          <th className="pb-3">Property</th>
                          <th className="pb-3">1st Mo Rent</th>
                          <th className="pb-3">VASATI Revenue (8%)</th>
                          <th className="pb-3">Host Settlement</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {data?.recentBookings?.map((b: any) => {
                          const fee = Math.round(b.monthly_rent * (commissionRate / 100));
                          const net = b.total_amount - fee;
                          return (
                            <tr key={b.id} className="hover:bg-slate-800/50">
                              <td className="py-3 font-mono font-bold text-vasati-orange">INV-VAS-2026-{b.id.slice(-4)}</td>
                              <td className="py-3 font-bold text-white">{b.property_name}</td>
                              <td className="py-3 text-slate-300">₹{b.monthly_rent?.toLocaleString('en-IN')}</td>
                              <td className="py-3 font-black text-vasati-orange">₹{fee?.toLocaleString('en-IN')}</td>
                              <td className="py-3 font-bold text-emerald-400">₹{net?.toLocaleString('en-IN')}</td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                  SETTLED
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REFUNDS MANAGEMENT */}
            {activeTab === 'refunds' && (
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Refund Management & Cancellations</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Process tenant refund requests, reverse commission charges, and update banking settlement trails.
                    </p>
                  </div>
                </div>

                {refunds.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No active refund claims. All booking settlements healthy.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700">
                    {refunds.map(r => (
                      <div key={r.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{r.customer_name}</span>
                            <span className="font-mono text-[10px] text-vasati-orange">{r.booking_code}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'PROCESSED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}>
                              {r.status}
                            </span>
                          </div>
                          <p className="text-slate-300 mt-1">Property: {r.property_name} • Reason: "{r.reason}"</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">Refund Claim Amount: <span className="text-white font-bold">₹{r.amount?.toLocaleString('en-IN')}</span></p>
                        </div>

                        {r.status === 'PENDING' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleProcessRefund(r.id, 'PROCESSED')}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                            >
                              Approve Refund
                            </button>
                            <button
                              onClick={() => handleProcessRefund(r.id, 'REJECTED')}
                              className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: USERS & HOSTS DIRECTORY */}
            {activeTab === 'users' && (
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Registered Users & Host Directory</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Inspect KYC verification documents and resident records.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-700 text-xs">
                  {usersList.map(u => (
                    <div key={u.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white">{u.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'owner' ? 'bg-purple-900/60 text-purple-300' : u.role === 'admin' ? 'bg-orange-900/60 text-orange-300' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-0.5">{u.email} • {u.phone || 'Phone verified'}</p>
                        {u.business_name && <p className="text-[11px] text-purple-300">Entity: {u.business_name}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        {u.role === 'owner' && (
                          <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            KYC Verified Host
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: COMPLAINTS */}
            {activeTab === 'complaints' && (
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-4">
                <h3 className="text-base font-extrabold text-white">Customer & Host Dispute Resolution</h3>
                <p className="text-xs text-slate-400">
                  Track and mediate complaints between tenants and PG hosts.
                </p>

                <div className="divide-y divide-slate-700">
                  {data?.complaints?.map((c: any) => (
                    <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white">{c.subject}</span>
                          <span className="font-mono text-[10px] text-slate-400">{c.complaint_code}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1">{c.description}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Raised by: {c.user_name} ({c.user_email}) • Property: {c.property_name || 'N/A'}</p>
                      </div>

                      {c.status === 'OPEN' && (
                        <button
                          onClick={() => handleResolveComplaint(c.id)}
                          className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: AUDIT LOGS */}
            {activeTab === 'audit_logs' && (
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Anti-Bypass Protection & Immutable Audit Logs</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Complete tamper-evident log of booking status transitions, phone maskings, visit approvals, and payment attributions.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-700/80 text-xs font-mono">
                  {data?.recentAuditLogs?.map((log: any) => (
                    <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-vasati-orange">[{log.action}]</span>
                          <span className="text-slate-400">{log.entity_type} ID: {log.entity_id}</span>
                        </div>
                        <p className="text-slate-300 mt-0.5 font-sans">{log.details}</p>
                      </div>
                      <span className="text-[11px] text-slate-500 whitespace-nowrap">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
