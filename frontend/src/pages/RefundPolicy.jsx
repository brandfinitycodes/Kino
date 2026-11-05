import React from 'react';
import { RefreshCcw, AlertTriangle, Clock, HelpCircle, MessageSquare } from 'lucide-react';

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
        <p className="text-center text-slate-500 font-medium mb-12">Last Updated: November 2026</p>

        <div className="space-y-12">
          
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="text-red-500" /> 1. Platform Fees
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Our platform operates as a marketplace connecting Brands and Creators. Once a deal milestone is successfully approved or completed, the platform fee deducted for facilitating the transaction and technology services is strictly <strong>non-refundable</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <RefreshCcw className="text-red-500" /> 2. Cancellation of Deals & Mutual Modifications
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Cancellations and milestone terms are governed by the following rules:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li><strong>Before Campaign Acceptance:</strong> If a Brand cancels a campaign before any Creator has accepted it, or before funds are locked into "Funds Secured", no charges apply.</li>
              <li><strong>Negotiation via On-Platform Chat:</strong> Brands and Creators may freely negotiate deadlines and revision limits through on-platform chat for mutual convenience. If both parties mutually agree in chat to cancel an in-progress deal before completion, secured funds will be refunded to the Brand minus third-party payment gateway fees.</li>
              <li><strong>Creator Inactivity / Default:</strong> If a Creator fails to deliver agreed content within the agreed timeline (including any extension agreed in chat) and remains unresponsive for more than 10 calendar days, the Brand is entitled to a full 100% refund of the secured funds.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Clock className="text-red-500" /> 3. 10-Day Review Window & Auto-Approval
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              To ensure fairness and prevent open-ended payment delays:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li>Brands are given <strong>10 calendar days</strong> to review submitted deliverables and either approve or request revisions grounded in the campaign brief.</li>
              <li>If the Brand takes no action within 10 days of submission, the platform will auto-approve the deliverable and release the funds to the Creator. Once auto-approved and disbursed, refunds cannot be claimed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <HelpCircle className="text-red-500" /> 4. Dispute Resolution & Split Refunds
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              If deliverables are submitted but the Brand is dissatisfied and requests cannot be resolved via chat:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li>The Platform evaluates the dispute against the accepted brief, package specs, and chat agreements.</li>
              <li><strong>Full Refund:</strong> Issued if the Creator failed to provide deliverables, missed agreed deadlines without extension, or delivered non-compliant / plagiarized work.</li>
              <li><strong>Partial / Split Refund:</strong> Calculated mechanically based on itemized deliverables completed. A 50% floor applies to the Creator if work substantially meets the brief.</li>
              <li><strong>No Refund:</strong> If deliverables fulfill the agreed brief specifications and the Brand is requesting out-of-scope alterations without a paid change order, funds are released to the Creator.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Clock className="text-red-500" /> 5. Refund Processing Timelines
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Once a refund is approved by our Dispute Resolution team:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li>Refunds are initiated back to the original payment source (Credit/Debit Card, Net Banking, or UPI) via our authorized payment partner.</li>
              <li>Please allow <strong>5 to 7 business days</strong> for the refunded amount to reflect in your bank account, depending on your bank's clearance cycles.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="text-red-500" /> 6. Contact Information
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              If you have any questions about a refund or wish to raise a dispute, please contact:
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
