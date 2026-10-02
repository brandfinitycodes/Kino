import React from 'react';
import { Shield, AlertCircle, Scale, ScrollText, Globe, Mail } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 py-20 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto bg-white p-10 sm:p-16 rounded-[2rem] shadow-xl border border-outline-variant/10">
        
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner mb-4">
            <Scale size={32} />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-center text-slate-900 mb-4 tracking-tight">Terms & Conditions</h1>
        <p className="text-center text-slate-500 font-medium mb-12">Last Updated: July 2026</p>

        <div className="space-y-12">
          
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <ScrollText className="text-amber-500" /> 1. Platform Role & "Milestone Coins" Disclaimer
            </h2>
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-4">
              <p className="text-sm font-bold text-amber-800 leading-relaxed mb-4">
                <strong>IMPORTANT NOTICE:</strong> This platform operates as an <strong>Intermediary Platform and Payment Facilitator</strong>. We are <strong>NOT</strong> a bank, financial institution, trust, or licensed financial entity under the Reserve Bank of India (RBI) or any other regulatory body.
              </p>
              <ul className="list-disc pl-5 text-sm text-amber-800 space-y-2">
                <li>The "Milestone Coins" feature is an internal tracking mechanism where coins are allocated pending milestone completion.</li>
                <li>Coins allocated on the platform do not accrue any interest for the users.</li>
                <li>We utilize third-party payment gateways (e.g., Razorpay) to process transactions. We are not liable for any delays caused by banking networks, gateway downtimes, or clearing cycles.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Shield className="text-amber-500" /> 2. Dispute Resolution & Arbitration
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              In the event that a Brand is unsatisfied with a Creator's deliverables, or a Creator claims non-payment for completed work, the following dispute resolution process applies:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li>Deliverables must be reviewed by the Brand within the specified timeframe (e.g., 7 days). Failure to review may result in auto-approval.</li>
              <li>If a dispute is officially filed via the platform, the coins will remain locked in the "Milestone Coins" state until the dispute is resolved.</li>
              <li><strong>The Platform acts as the sole arbitrator</strong> in any dispute filed between a Brand and a Creator.</li>
              <li>By using this platform, both parties agree that <strong>the decision of the Platform Administration in any dispute is final, binding, and not subject to appeal.</strong></li>
              <li>The Platform reserves the right to release funds to the Creator, issue a full refund to the Brand, or split the funds at its sole discretion based on the evidence provided (e.g., chat logs, submitted deliverables, campaign brief).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <AlertCircle className="text-amber-500" /> 3. Taxes and Platform Fees
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Our services are subject to platform fees and applicable taxes as per Indian law.
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li>The platform deducts a non-refundable <strong>Platform Fee</strong> upon the successful completion of a deal and release of funds.</li>
              <li><strong>Creators are solely responsible</strong> for declaring and paying their own income tax, GST, or any other applicable taxes on their earnings.</li>
              <li>The platform may, where required by law (e.g., Section 194-O of the Income Tax Act), deduct TDS (Tax Deducted at Source) before clearing payouts to the Creator.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Shield className="text-amber-500" /> 4. Limitation of Liability & Indemnification
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              The Platform provides software to connect Brands and Creators and facilitates the secure transfer of payments.
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li>We do not guarantee the quality, legality, or exactness of the deliverables provided by Creators.</li>
              <li>You agree to <strong>indemnify and hold harmless</strong> the Platform, its owners, and employees from any claims, lawsuits, damages, or liabilities arising from breached contracts, copyright infringements, illegal acts, or disputes between users.</li>
              <li>The Platform is not liable for any indirect, incidental, or consequential damages arising from the use of our services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Globe className="text-amber-500" /> 5. Governing Law and Jurisdiction
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Nagpur, Maharashtra.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Mail className="text-amber-500" /> 6. Contact Information
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              For any questions, concerns, or legal notices related to these Terms & Conditions, please contact us at:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li><strong>Company Name:</strong> Brandfinity</li>
              <li><strong>Email:</strong> hello@brandfinity.in</li>
              <li><strong>Address:</strong> 1st floor Brandfinity, Vijayanand Society, P-15, near NIT Garden, Narendra Nagar square, Somalwada, Nagpur, Maharashtra 440015</li>
            </ul>
          </section>

        </div>
        
        <div className="mt-16 pt-8 border-t border-outline-variant/20 text-center">
          <p className="text-sm font-bold text-slate-400">By continuing to use our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
