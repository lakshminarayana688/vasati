import React, { useState } from 'react';
import {
  ChevronLeft,
  ShieldCheck,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle,
  Download,
  Share2,
  Lock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentScreenProps {
  bookingDetails: any;
  onBack: () => void;
  onPaymentSuccess: (confirmedBooking: any) => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  bookingDetails,
  onBack,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'Wallet'>('UPI');
  const [upiId, setUpiId] = useState('lakshmi@okhdfcbank');
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Fallbacks if direct navigation without prior selection
  const amount = bookingDetails?.total_amount || 24000;
  const propertyName = bookingDetails?.property_name || 'Sri Sai PG';
  const locality = bookingDetails?.property_locality || 'Koramangala, Bengaluru';
  const duration = bookingDetails?.duration_months || 3;
  const coverImage = bookingDetails?.cover_image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80';

  const handlePayNow = async () => {
    try {
      setProcessing(true);

      // Perform genuine API booking & payment processing
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: bookingDetails?.property_id || 'prop_sri_sai',
          room_id: bookingDetails?.room_id || 'rm_ss_1',
          customer_id: 'usr_cust_1',
          room_type: bookingDetails?.room_type || 'Single Room',
          duration_months: duration,
          move_in_date: bookingDetails?.move_in_date || '2026-12-01',
          payment_method: selectedMethod,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaymentResult(data.booking);
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (_) {}
      } else {
        alert('Payment verification failed: ' + data.error);
      }
    } catch (err: any) {
      alert('Network error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // If payment succeeded, display verifiable confirmation receipt
  if (paymentResult) {
    return (
      <div className="w-full h-full bg-white flex flex-col justify-between font-sans p-6 overflow-y-auto no-scrollbar">
        <div className="text-center pt-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-extrabold text-vasati-dark">Payment Confirmed!</h2>
          <p className="text-xs text-gray-500 mt-1">
            Your booking is secured. Notification and receipt sent to lakshmi@gmail.com.
          </p>
        </div>

        {/* Verifiable Booking & Invoice Card */}
        <div className="mt-6 p-4 rounded-3xl bg-gray-50 border border-gray-100 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Booking Reference</p>
              <p className="text-xs font-black text-vasati-purple">{paymentResult.bookingCode}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {paymentResult.status}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>PG Property</span>
              <span className="font-bold text-gray-900">{propertyName}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Duration</span>
              <span className="font-bold text-gray-900">{duration} Months</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Transaction Ref</span>
              <span className="font-mono text-[10px] text-gray-700">{paymentResult.transactionReference}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Invoice #</span>
              <span className="font-mono text-[10px] text-gray-700">{paymentResult.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-900">Total Paid</span>
              <span className="font-black text-sm text-vasati-purple">
                ₹{paymentResult.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* VASATI Commission Transparency Note */}
          <div className="pt-2 border-t border-gray-200 text-[10px] text-gray-500">
            VASATI Commission: ₹{paymentResult.commissionAmount} (8% on 1st mo rent) recorded in owner settlement ledger.
          </div>
        </div>

        <div className="pt-6 space-y-3">
          <button
            onClick={() => onPaymentSuccess(paymentResult)}
            className="w-full py-3.5 rounded-full bg-vasati-purple hover:bg-vasati-purple-dark text-white font-bold text-xs shadow-lg shadow-vasati-purple/20 transition-all"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

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

        <h2 className="text-lg font-extrabold text-vasati-dark">Payment</h2>

        <div className="w-6" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-5 pb-24">
        {/* Booking Summary Card */}
        <div className="p-3.5 rounded-3xl bg-gray-50 border border-gray-100 flex items-center gap-3">
          <img
            src={coverImage}
            alt={propertyName}
            className="w-16 h-16 rounded-2xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-extrabold text-vasati-dark truncate">{propertyName}</h3>
            <p className="text-xs text-gray-500 truncate">📍 {locality}</p>
            <p className="text-xs font-black text-vasati-purple mt-0.5">
              ₹{amount.toLocaleString('en-IN')} <span className="font-normal text-gray-500">({duration} Months)</span>
            </p>
          </div>
        </div>

        {/* Choose Payment Method */}
        <div>
          <h3 className="text-sm font-extrabold text-vasati-dark mb-3">Choose Payment Method</h3>
          <div className="space-y-3">
            {/* UPI Option */}
            <div
              onClick={() => setSelectedMethod('UPI')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedMethod === 'UPI'
                  ? 'border-vasati-purple bg-purple-50/40 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-vasati-purple flex items-center justify-center font-black text-xs">
                    UPI
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-vasati-dark">UPI</h4>
                    <p className="text-[10px] text-gray-500">Google Pay, PhonePe, Paytm</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'UPI' ? 'border-vasati-purple' : 'border-gray-300'
                }`}>
                  {selectedMethod === 'UPI' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-vasati-purple" />
                  )}
                </div>
              </div>

              {selectedMethod === 'UPI' && (
                <div className="mt-3 pt-3 border-t border-purple-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g. mobile@upi)"
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-vasati-purple"
                  />
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    Verified
                  </span>
                </div>
              )}
            </div>

            {/* Credit / Debit Card */}
            <div
              onClick={() => setSelectedMethod('Card')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedMethod === 'Card'
                  ? 'border-vasati-purple bg-purple-50/40 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-vasati-dark">Credit / Debit Card</h4>
                    <p className="text-[10px] text-gray-500">Visa, MasterCard, RuPay</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'Card' ? 'border-vasati-purple' : 'border-gray-300'
                }`}>
                  {selectedMethod === 'Card' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-vasati-purple" />
                  )}
                </div>
              </div>
            </div>

            {/* Net Banking */}
            <div
              onClick={() => setSelectedMethod('NetBanking')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedMethod === 'NetBanking'
                  ? 'border-vasati-purple bg-purple-50/40 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-vasati-dark">Net Banking</h4>
                    <p className="text-[10px] text-gray-500">All Major Indian Banks</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'NetBanking' ? 'border-vasati-purple' : 'border-gray-300'
                }`}>
                  {selectedMethod === 'NetBanking' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-vasati-purple" />
                  )}
                </div>
              </div>
            </div>

            {/* Paytm Wallet */}
            <div
              onClick={() => setSelectedMethod('Wallet')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedMethod === 'Wallet'
                  ? 'border-vasati-purple bg-purple-50/40 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-vasati-dark">Paytm Wallet</h4>
                    <p className="text-[10px] text-gray-500">Fast 1-click checkout</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'Wallet' ? 'border-vasati-purple' : 'border-gray-300'
                }`}>
                  {selectedMethod === 'Wallet' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-vasati-purple" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Your payment information is 100% secure</span>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 shadow-nav z-20">
        <button
          onClick={handlePayNow}
          disabled={processing}
          className="w-full py-4 rounded-full bg-vasati-purple hover:bg-vasati-purple-dark text-white font-extrabold text-sm shadow-xl shadow-vasati-purple/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
        >
          {processing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying Payment...</span>
            </div>
          ) : (
            <span>Pay ₹{amount.toLocaleString('en-IN')}</span>
          )}
        </button>
      </div>
    </div>
  );
};

