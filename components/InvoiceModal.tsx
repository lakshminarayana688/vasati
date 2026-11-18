import React from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { VasatiLogo } from './VasatiLogo';

interface InvoiceModalProps {
  invoiceData: {
    invoiceNumber: string;
    bookingCode: string;
    propertyName: string;
    roomType: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    ownerName?: string;
    businessName?: string;
    monthlyRent: number;
    durationMonths: number;
    securityDeposit: number;
    totalAmount: number;
    commissionAmount: number;
    transactionReference?: string;
    date?: string;
  };
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoiceData, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = invoiceData.date || new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl text-vasati-dark font-sans relative my-8 animate-fade-in print:p-0 print:shadow-none print:m-0">
        {/* Action Controls (hidden when printing) */}
        <div className="flex items-center justify-between pb-4 border-b border-vasati-purple-border/30 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-vasati-purple-soft text-vasati-purple hover:bg-vasati-purple hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={() => alert('Tax Invoice PDF downloaded successfully')}
              className="px-3.5 py-1.5 rounded-xl bg-vasati-purple-soft text-vasati-purple hover:bg-vasati-purple hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-vasati-purple-soft text-vasati-secondary hover:text-vasati-dark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Invoice Header */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <VasatiLogo size="sm" showTagline={true} />
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] tracking-wider uppercase">
              Paid Tax Invoice
            </span>
            <p className="font-mono font-bold text-sm text-vasati-dark mt-1">
              {invoiceData.invoiceNumber}
            </p>
            <p className="text-gray-500 text-[11px]">Date: {invoiceDate}</p>
          </div>
        </div>

        {/* Entity Details Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 border-b border-gray-100 text-xs">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Billed To (Tenant)</p>
            <h4 className="font-extrabold text-sm text-vasati-dark mt-0.5">{invoiceData.customerName}</h4>
            <p className="text-gray-600 mt-0.5">{invoiceData.customerEmail || 'lakshmi@gmail.com'}</p>
            <p className="text-gray-600">{invoiceData.customerPhone || '+91 98450 12345'}</p>
          </div>

          <div className="sm:text-right">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Marketplace Host</p>
            <h4 className="font-extrabold text-sm text-vasati-dark mt-0.5">
              {invoiceData.businessName || 'Sri Sai Stays & Hospitality'}
            </h4>
            <p className="text-gray-600 mt-0.5">Property: {invoiceData.propertyName}</p>
            <p className="text-gray-500 font-mono text-[11px]">Booking ID: {invoiceData.bookingCode}</p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="py-5">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-center">Duration</th>
                <th className="pb-2 text-right">Rate / Month</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3">
                  <p className="font-bold text-gray-900">{invoiceData.propertyName} – {invoiceData.roomType}</p>
                  <p className="text-[10px] text-gray-500">Accommodation rent inclusive of Wi-Fi & daily maintenance</p>
                </td>
                <td className="py-3 text-center font-bold text-gray-700">
                  {invoiceData.durationMonths} {invoiceData.durationMonths === 1 ? 'Month' : 'Months'}
                </td>
                <td className="py-3 text-right text-gray-700">
                  ₹{invoiceData.monthlyRent.toLocaleString('en-IN')}
                </td>
                <td className="py-3 text-right font-bold text-gray-900">
                  ₹{(invoiceData.monthlyRent * invoiceData.durationMonths).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td className="py-3">
                  <p className="font-bold text-gray-900">Refundable Security Deposit</p>
                  <p className="text-[10px] text-emerald-600 font-bold">100% Refundable upon checkout (0% Commission)</p>
                </td>
                <td className="py-3 text-center text-gray-400">–</td>
                <td className="py-3 text-right text-gray-700">–</td>
                <td className="py-3 text-right font-bold text-gray-900">
                  ₹{invoiceData.securityDeposit.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals & Commission Ledger Summary */}
        <div className="pt-4 border-t border-vasati-purple-border/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
          <div className="p-3 bg-vasati-purple-soft/60 rounded-2xl border border-vasati-purple-border/60 max-w-sm">
            <p className="font-bold text-vasati-purple text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              VASATI Commission System Breakdown
            </p>
            <p className="text-[10px] text-vasati-secondary mt-1">
              First Month Rent: ₹{invoiceData.monthlyRent.toLocaleString('en-IN')} • Platform Fee (8%): <strong className="text-vasati-orange">₹{invoiceData.commissionAmount}</strong> • Host Net Remittance: <strong>₹{(invoiceData.totalAmount - invoiceData.commissionAmount).toLocaleString('en-IN')}</strong>.
            </p>
          </div>

          <div className="w-full sm:w-auto text-right space-y-1">
            <div className="flex justify-between sm:justify-end gap-6 text-gray-500">
              <span>Subtotal:</span>
              <span className="font-bold text-gray-900">₹{invoiceData.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-6 text-gray-500">
              <span>Taxes / Fees:</span>
              <span className="font-bold text-emerald-600">INCLUDED</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-6 text-base font-black text-vasati-dark pt-1 border-t border-gray-200">
              <span>Total Paid:</span>
              <span className="text-vasati-purple">₹{invoiceData.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Transaction Reference & Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400 gap-2">
          <span>Transaction Ref: {invoiceData.transactionReference || 'TXN_UPI_981726451029'}</span>
          <span>VASATI Technologies India Pvt. Ltd. • Bengaluru, Karnataka</span>
        </div>
      </div>
    </div>
  );
};

