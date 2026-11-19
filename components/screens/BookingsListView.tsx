import React, { useState, useEffect } from 'react';
import { InvoiceModal } from '../InvoiceModal';
import {
  ChevronLeft,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  Download,
  AlertCircle,
  FileText
} from 'lucide-react';

interface BookingsListViewProps {
  onBack: () => void;
  onSelectProperty: (propertyId: string) => void;
  isDesktop?: boolean;
}

export const BookingsListView: React.FC<BookingsListViewProps> = ({
  onBack,
  onSelectProperty,
  isDesktop = false,
}) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        const res = await fetch('/api/bookings?customerId=usr_cust_1');
        const data = await res.json();
        if (data.success) {
          setBookings(data.bookings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'Checked In':
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pending':
      case 'Owner Accepted':
      case 'Payment Pending':
      case 'Move-in Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="w-full h-full bg-vasati-lavender flex flex-col justify-between font-sans relative">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between bg-white border-b border-vasati-purple-border/40">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-vasati-purple-soft/50 text-vasati-dark"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-extrabold text-vasati-dark">My Bookings</h2>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-7 h-7 border-3 border-vasati-purple border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Calendar className="w-12 h-12 text-vasati-secondary/40 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-vasati-dark">No active bookings yet</h3>
            <p className="text-xs text-vasati-secondary mt-1">Explore top PGs and book your ideal stay today.</p>
          </div>
        ) : (
          <div className={isDesktop ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col space-y-4 w-full"}>
            {bookings.map(b => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-4 shadow-card hover:shadow-card-hover border border-vasati-purple-border/50 space-y-3 transition-all w-full"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-vasati-purple">
                  {b.booking_code}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(b.status)}`}>
                  {b.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={b.property_cover || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80'}
                  alt={b.property_name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-extrabold text-vasati-dark truncate">{b.property_name}</h4>
                  <p className="text-xs text-vasati-secondary flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-vasati-purple" />
                    {b.property_locality}, {b.property_city}
                  </p>
                  <p className="text-xs font-bold text-vasati-dark/80 mt-1">
                    {b.room_type} • {b.duration_months} Months
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-vasati-purple-border/30 flex items-center justify-between text-xs flex-wrap gap-1">
                <div>
                  <span className="text-vasati-secondary font-medium">Total Paid: </span>
                  <span className="font-extrabold text-vasati-purple">
                    ₹{b.total_amount?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-vasati-secondary">Move-in: {b.move_in_date}</span>
                </div>
              </div>

              {b.invoice_number && (
                <div className="pt-2 border-t border-dashed border-vasati-purple-border/40 flex items-center justify-between text-[11px] text-vasati-secondary flex-wrap gap-2">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-vasati-purple" />
                    <span>Invoice: {b.invoice_number}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    {b.status === 'Confirmed' && (
                      <button
                        onClick={async () => {
                          if (confirm(`Request cancellation and full refund for ${b.booking_code}?`)) {
                            await fetch('/api/refunds', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ booking_id: b.id, reason: 'Tenant requested cancellation before check-in' }),
                            });
                            alert('Refund request submitted! Status updated to Refund Pending.');
                            window.location.reload();
                          }
                        }}
                        className="text-red-500 font-bold hover:underline"
                      >
                        Cancel & Refund
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedInvoice({
                        invoiceNumber: b.invoice_number,
                        bookingCode: b.booking_code,
                        propertyName: b.property_name,
                        roomType: b.room_type,
                        customerName: b.customer_name || 'Lakshminarayana G',
                        customerEmail: b.customer_email || 'lakshmi@gmail.com',
                        customerPhone: b.customer_phone || '+91 98450 12345',
                        ownerName: b.owner_name,
                        businessName: 'Sri Sai Stays & Hospitality',
                        monthlyRent: b.monthly_rent || (b.total_amount / b.duration_months),
                        durationMonths: b.duration_months,
                        securityDeposit: b.security_deposit || 8000,
                        totalAmount: b.total_amount,
                        commissionAmount: b.commission_amount || Math.round((b.total_amount / b.duration_months) * 0.08),
                        transactionReference: b.transaction_reference,
                      })}
                      className="font-bold text-vasati-purple hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          </div>
        )}
      </div>

      {selectedInvoice && (
        <InvoiceModal
          invoiceData={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

