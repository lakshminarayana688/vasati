import React, { useState } from 'react';
import { VasatiLogo } from '../VasatiLogo';
import {
  Settings,
  ChevronRight,
  Calendar,
  User,
  Heart,
  Clock,
  AlertCircle,
  HelpCircle,
  Info,
  LogOut,
  X,
  Send,
  CheckCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface ProfileScreenProps {
  onNavigateTab: (tab: 'home' | 'search' | 'saved' | 'bookings' | 'profile') => void;
  onOpenBookings: () => void;
  onOpenSaved: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateTab,
  onOpenBookings,
  onOpenSaved,
  onLogout,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Profile Edit state
  const [name, setName] = useState('Lakshminarayana G');
  const [email, setEmail] = useState('lakshmi@gmail.com');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [company, setCompany] = useState('Infosys Technologies, Electronic City');

  // Complaint state
  const [complaintCategory, setComplaintCategory] = useState('Maintenance');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  const handleRaiseComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'usr_cust_1',
          property_id: 'prop_sri_sai',
          category: complaintCategory,
          subject: complaintSubject,
          description: complaintDesc,
          priority: 'Medium',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComplaintSuccess(true);
        setTimeout(() => {
          setComplaintSuccess(false);
          setActiveModal(null);
          setComplaintSubject('');
          setComplaintDesc('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col justify-between font-sans relative pb-20">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {/* Top Purple Header Banner matching Screen 8 */}
        <div className="bg-gradient-to-br from-vasati-purple to-purple-800 pt-7 pb-8 px-6 text-white rounded-b-[2.5rem] shadow-xl relative">
          {/* Settings Gear Top Right */}
          <button
            onClick={() => setActiveModal('profile')}
            className="absolute top-5 right-6 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>

          {/* User Info with Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                alt="Lakshminarayana G"
                className="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-vasati-purple" />
            </div>

            <div>
              <h2 className="text-lg font-black tracking-tight leading-tight">Lakshminarayana G</h2>
              <p className="text-xs text-purple-200 mt-0.5">lakshmi@gmail.com</p>
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white mt-1.5">
                Verified Resident
              </span>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="px-5 mt-5 space-y-4">
          {/* Highlight Card: My Bookings matching Reference Image */}
          <div
            onClick={onOpenBookings}
            className="p-4 rounded-3xl bg-vasati-purple-soft/60 border border-purple-100/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-vasati-purple text-white flex items-center justify-center shadow-md shadow-vasati-purple/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-vasati-dark">My Bookings</h3>
                <p className="text-xs text-gray-500">View & Manage</p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-vasati-purple group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Menu Items List */}
          <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm divide-y divide-gray-100">
            {/* My Profile */}
            <div
              onClick={() => setActiveModal('profile')}
              className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 text-vasati-dark">
                <User className="w-4 h-4 text-vasati-purple" />
                <span className="text-xs font-bold">My Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Saved PGs */}
            <div
              onClick={onOpenSaved}
              className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 text-vasati-dark">
                <Heart className="w-4 h-4 text-vasati-purple" />
                <span className="text-xs font-bold">Saved PGs</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Rent Reminders */}
            <div
              onClick={() => setActiveModal('rent')}
              className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 text-vasati-dark">
                <Clock className="w-4 h-4 text-vasati-purple" />
                <span className="text-xs font-bold">Rent Reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  Paid
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Raise a Complaint */}
            <div
              onClick={() => setActiveModal('complaint')}
              className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 text-vasati-dark">
                <AlertCircle className="w-4 h-4 text-vasati-purple" />
                <span className="text-xs font-bold">Raise a Complaint</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Help & Support */}
            <div
              onClick={() => setActiveModal('help')}
              className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 text-vasati-dark">
                <HelpCircle className="w-4 h-4 text-vasati-purple" />
                <span className="text-xs font-bold">Help & Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* About VASATI */}
            <div
              onClick={() => setActiveModal('about')}
              className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 text-vasati-dark">
                <Info className="w-4 h-4 text-vasati-purple" />
                <span className="text-xs font-bold">About VASATI</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Logout */}
            <div
              onClick={onLogout}
              className="p-3.5 flex items-center justify-between hover:bg-red-50 transition-colors cursor-pointer text-red-600"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-bold">Logout</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-vasati-dark">Customer Profile</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Work / College</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
            </div>
            <button
              onClick={() => {
                alert('Profile updated successfully!');
                setActiveModal(null);
              }}
              className="w-full mt-4 py-3 rounded-full bg-vasati-purple text-white text-xs font-bold"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Rent Reminders Modal */}
      {activeModal === 'rent' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-vasati-dark">Rent Reminders</h3>
            <p className="text-xs text-gray-500 mt-0.5">Automated schedule for active stays</p>

            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-900">Sri Sai PG - Single Room</p>
                <p className="text-[11px] text-emerald-700">Due: 1st Dec 2026</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-xs font-black">
                ₹8,000
              </span>
            </div>

            <p className="text-[11px] text-gray-500 mt-4 text-center">
              VASATI sends auto-reminders via WhatsApp & email 3 days before due date.
            </p>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-4 py-2.5 rounded-full bg-vasati-purple text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Complaint Modal */}
      {activeModal === 'complaint' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
            {complaintSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-base font-extrabold text-vasati-dark">Complaint Registered!</h3>
                <p className="text-xs text-gray-500 mt-1">Ticket dispatched to owner and VASATI support.</p>
              </div>
            ) : (
              <form onSubmit={handleRaiseComplaint}>
                <h3 className="text-base font-extrabold text-vasati-dark">Raise a Complaint</h3>
                <p className="text-xs text-gray-500 mt-0.5">Fast resolution with admin oversight</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Issue Category</label>
                    <select
                      value={complaintCategory}
                      onChange={e => setComplaintCategory(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs"
                    >
                      <option>Maintenance</option>
                      <option>Wi-Fi & Internet</option>
                      <option>Food & Cleanliness</option>
                      <option>Security & Gate</option>
                      <option>Billing & Deposit</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={complaintSubject}
                      onChange={e => setComplaintSubject(e.target.value)}
                      placeholder="e.g. Wi-Fi router on 2nd floor"
                      className="w-full px-3 py-2 border rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={complaintDesc}
                      onChange={e => setComplaintDesc(e.target.value)}
                      placeholder="Describe the issue in detail..."
                      className="w-full px-3 py-2 border rounded-xl text-xs"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 py-3 rounded-full bg-vasati-purple text-white text-xs font-bold shadow-md"
                >
                  Submit Complaint
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Help Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-vasati-dark">Help & Support</h3>
            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-purple-50 rounded-2xl">
                <p className="font-bold text-vasati-purple">24x7 VASATI Helpline</p>
                <p className="text-gray-700 mt-0.5">+91 80 4000 9000 / support@vasati.in</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl">
                <p className="font-bold text-gray-800">Refund Policy</p>
                <p className="text-gray-600 mt-0.5">100% refund of deposit if cancelled before check-in date.</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl">
                <p className="font-bold text-gray-800">Anti-Bypass Guarantee</p>
                <p className="text-gray-600 mt-0.5">All stays booked through VASATI carry booking protection and free relocation assistance.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-4 py-2.5 rounded-full bg-vasati-purple text-white text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* About VASATI Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-fade-in relative text-center">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="my-2 flex justify-center">
              <VasatiLogo size="md" showTagline={true} />
            </div>
            <div className="mt-4 text-xs text-gray-600 text-left space-y-2 leading-relaxed">
              <p>
                VASATI is India's leading managed PG & co-living rental marketplace, connecting discerning tenants with verified PG hosts across Bengaluru and major metro cities.
              </p>
              <p>
                We enforce fair 8% owner-paid commissions, transparent deposits, anti-bypass customer protection, and 100% verified property listings.
              </p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-5 py-2.5 rounded-full bg-vasati-purple text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

