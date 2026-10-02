import React from 'react';
import { RefreshCcw, AlertTriangle, Clock, HelpCircle } from 'lucide-react';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 py-20 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto bg-white p-10 sm:p-16 rounded-[2rem] shadow-xl border border-outline-variant/10">
        
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-inner mb-4">
            <RefreshCcw size={32} />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-center text-slate-900 mb-4 tracking-tight">Cancellation & Refund Policy</h1>
        <p className="text-center text-slate-500 font-medium mb-12">Last Updated: July 2026</p>

        <div className="space-y-12">
          
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="text-red-500" /> 1. Platform Fees
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Our platform operates as a marketplace connecting Brands and Creators. Once a transaction is completed and funds are disbursed, the platform fee deducted for facilitating the service is strictly <strong>non-refundable</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <RefreshCcw className="text-red-500" /> 2. Cancellation of Deals
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Cancellations are governed by the following conditions:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li><strong>Before Campaign Acceptance:</strong> If a Brand cancels a campaign before any Creator has accepted it, or before any coins are moved to the "Milestone Coins" state, no charges will apply.</li>
              <li><strong>After Milestone Coins Allocated:</strong> If a deal is canceled by mutual agreement before deliverables are provided, the coins allocated as milestone coins will be refunded to the Brand's original payment method, minus any payment gateway processing fees.</li>
              <li><strong>Creator Default:</strong> If a Creator fails to deliver the agreed-upon content within the stipulated timeline, the Brand is entitled to a full refund of the milestone coins.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Clock className="text-red-500" /> 3. Refund Processing Timeline
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Once a refund is approved by our Dispute Resolution team:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li>Refunds will be processed back to the original source of payment (Credit Card, Debit Card, Net Banking, or UPI).</li>
              <li>Please allow <strong>5 to 7 business days</strong> for the refunded amount to reflect in your bank account, depending on your bank's processing time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <HelpCircle className="text-red-500" /> 4. Dispute Resolution
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              In cases where deliverables are submitted but the Brand is dissatisfied, our platform acts as the final arbitrator. If we determine that the deliverables did not meet the agreed brief, a partial or full refund may be issued to the Brand. If the deliverables are deemed satisfactory, the funds will be released to the Creator, and no refund will be issued.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="text-red-500" /> 5. Contact Information
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              If you have any questions about a refund or wish to raise a dispute, please contact us immediately:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li><strong>Company Name:</strong> Brandfinity</li>
              <li><strong>Email:</strong> hello@brandfinity.in</li>
              <li><strong>Address:</strong> 1st floor Brandfinity, Vijayanand Society, P-15, near NIT Garden, Narendra Nagar square, Somalwada, Nagpur, Maharashtra 440015</li>
            </ul>
          </section>

        </div>
        
        <div className="mt-16 pt-8 border-t border-outline-variant/20 text-center">
          <p className="text-sm font-bold text-slate-400">By transacting on our platform, you acknowledge and agree to this Cancellation & Refund Policy.</p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
