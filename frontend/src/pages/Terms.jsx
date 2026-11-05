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
        <p className="text-center text-slate-500 font-medium mb-12">Last Updated: November 2026</p>

        <div className="space-y-12">
          
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <ScrollText className="text-amber-500" /> 1. Platform Role & Funds-Secured Hold Disclaimer
            </h2>
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-4">
              <p className="text-sm font-bold text-amber-800 leading-relaxed mb-4">
                <strong>IMPORTANT NOTICE:</strong> This platform operates strictly as an <strong>Intermediary Platform and Technology Facilitator</strong> under Section 79 of the Information Technology Act, 2000. We are <strong>NOT</strong> a bank, non-banking financial company (NBFC), licensed escrow agent, or trust entity under the Reserve Bank of India (RBI).
              </p>
              <ul className="list-disc pl-5 text-sm text-amber-800 space-y-2">
                <li>Funds held in "Funds Secured" or "Milestone Coins" represent an internal ledger tracking conditional disbursement holds processed through RBI-authorized Payment Aggregators (e.g., Razorpay).</li>
                <li>Funds held on the platform do not accrue interest or constitute bank deposits.</li>
                <li>We are not liable for external payment network outages, bank clearing cycles, or third-party payment gateway downtime.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Shield className="text-amber-500" /> 2. Deliverables, Flexible Deadlines & Negotiated Revisions
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              To provide flexibility while protecting work integrity, deal milestones are governed by the following rules:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li>
                <strong>Mutual Renegotiation via On-Platform Chat:</strong> Deliverable dates, submission deadlines, and revision requirements can be freely renegotiated and modified by Brands and Creators through mutual agreement within the <strong>on-platform chat</strong> for their convenience. Once mutually confirmed in chat, these updated terms amend and supersede original package or campaign dates.
              </li>
              <li>
                <strong>Evidence Standard:</strong> Only agreements, briefs, file submissions, and timestamps recorded <em>directly on the platform</em> will be recognized in the event of any review or dispute. Off-platform communications (e.g., WhatsApp, external emails, phone calls) carry zero evidentiary weight.
              </li>
              <li>
                <strong>10-Day Review & Reaction Window:</strong> Once a Creator submits deliverables for review (or once a Brand formally requests revisions), the receiving party is granted exactly <strong>10 calendar days</strong> to review and react (approve, request revisions with specific brief feedback, or respond).
              </li>
              <li>
                <strong>Automatic Release on Inactivity:</strong> If a Brand fails to react within the <strong>10-day review window</strong> following deliverable submission, the platform will automatically approve the submission and release the secured funds to the Creator.
              </li>
              <li>
                <strong>Scope of Revisions vs. Paid Add-Ons:</strong> A revision is strictly defined as correcting errors or omissions that deviate from the agreed campaign brief or chat agreement. Any request for new creative direction, extra variations, or assets not covered in the agreed scope requires an additional funded change order.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Scale className="text-amber-500" /> 3. Dispute Resolution & Brief-Enforcement Policy
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              If an unresolved disagreement arises regarding deliverables or milestone completion, either party may file a formal dispute on the platform. The platform handles disputes under an objective brief-enforcement standard:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li>
                <strong>Administrative Determination on Held Funds:</strong> The platform acts as an administrative evaluator. The platform’s decision governs <strong>solely the release, proportional split, or refund of funds currently held on the platform</strong>. In compliance with Section 28 of the Indian Contract Act, 1872, neither party is restricted from pursuing independent arbitration or statutory legal claims in competent courts thereafter.
              </li>
              <li>
                <strong>Enforcement Standard & Ambiguity Rule:</strong> Disputes are judged against the written brief, package terms, and mutual agreements confirmed in on-platform chat. Where requirements are genuinely silent or ambiguous, the ambiguity is resolved in favor of the Creator, as the hiring party authored and approved the project scope.
              </li>
              <li>
                <strong>Mechanical Splits & Creator Floor:</strong> In cases of partial completion or mixed fault, the platform calculates splits based on itemized deliverables delivered. When submitted work substantially meets the agreed brief but is rejected without valid technical grounds, a minimum <strong>50% creator protection floor</strong> applies.
              </li>
              <li>
                <strong>Fraud and Willful Default:</strong> Submissions involving plagiarism, unauthorized content, fake metrics, or unagreed missed deadlines past the 10-day reaction window will result in a 100% refund of unreleased funds to the Brand, alongside platform account sanctions.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <AlertCircle className="text-amber-500" /> 4. Chargebacks, Clawbacks & Indemnification
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Card issuing networks permit cardholders to file chargebacks up to 120 days or more post-transaction. To protect marketplace solvency:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li>
                <strong>Chargeback Clawback:</strong> If a Brand initiates an external bank or card chargeback after funds were released to a Creator, the platform reserves the right to recover such reversed amounts from future creator wallet payouts or request reimbursement, accompanied by the banking dispute documentation.
              </li>
              <li>
                <strong>No Finality Guarantee on External Rail:</strong> The platform guarantees fair distribution of platform-held funds but cannot prevent unilateral chargeback reversals initiated by external card-issuing banks.
              </li>
              <li>
                <strong>Indemnification:</strong> You agree to defend, indemnify, and hold harmless the Platform, its directors, and affiliates against any third-party claims, IP infringements, statutory penalties, or chargebacks arising from your conduct or breach of these terms.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <AlertCircle className="text-amber-500" /> 5. Taxes and Platform Fees
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Our services are subject to platform fees and applicable taxes under Indian tax laws.
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li>The platform deducts a non-refundable <strong>Platform Fee</strong> upon the successful completion of a deal and release of funds.</li>
              <li><strong>Creators are solely responsible</strong> for declaring and remitting their own income tax, GST, or other statutory dues.</li>
              <li>Where applicable under Section 194-O of the Indian Income Tax Act, 1961, the platform will deduct TDS (Tax Deducted at Source) prior to processing creator payouts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Globe className="text-amber-500" /> 6. Governing Law and Jurisdiction
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Subject to platform administrative dispute procedures, any legal proceedings arising out of these Terms shall be submitted to the exclusive jurisdiction of the competent courts in Nagpur, Maharashtra.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Mail className="text-amber-500" /> 7. Contact Information
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              For legal inquiries, dispute escalations, or platform notices, please contact:
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
