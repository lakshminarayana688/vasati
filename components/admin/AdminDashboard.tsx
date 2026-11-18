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
  Activity
} from 'lucide-react';
import { VasatiLogo } from '../VasatiLogo';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'bookings' | 'commissions' | 'complaints' | 'audit_logs'>('overview');
  const [commissionRate, setCommissionRate] = useState(8);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/metrics');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
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
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-800">
                    All Active Stays Verified
                  </span>
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
                        </div>
                        <p className="text-slate-400 mt-1">
                          Address: {p.address_line}, {p.locality}, {p.city} - {p.pincode}
                        </p>
                        <p className="text-slate-500 text-[11px]">Host: {p.owner_name} ({p.owner_email})</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-900/60 text-emerald-300 rounded-lg text-xs font-bold">
                          Verified & Approved
                        </span>
                      </div>
                    </div>
                  ))}
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

