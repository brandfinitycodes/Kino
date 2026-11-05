import React from 'react';
import { Lock, Eye, Users, FileText, Mail, MessageSquare } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 py-20 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto bg-white p-10 sm:p-16 rounded-[2rem] shadow-xl border border-outline-variant/10">
        
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner mb-4">
            <Lock size={32} />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-center text-slate-900 mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-center text-slate-500 font-medium mb-12">Last Updated: November 2026</p>

        <div className="space-y-12">
          
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Eye className="text-blue-500" /> 1. Data Collection & KYC
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              To operate securely and comply with applicable laws and RBI Payment Aggregator standards, we collect necessary personal, business, and verification data:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li><strong>Identity Verification (KYC):</strong> Government-issued identifiers (such as Aadhaar or PAN) are collected and securely validated to confirm user identity, combat fraud, and fulfill statutory anti-money laundering (AML) responsibilities.</li>
              <li><strong>Profile & Collaboration Data:</strong> Social media handles, follower statistics, contact emails, and creative portfolios are processed to power marketplace discovery and matching.</li>
              <li><strong>On-Platform Communications & Evidence:</strong> Messages exchanged in on-platform chat, milestone deliverables, file uploads, timestamps, and negotiated deadline or revision amendments are recorded and retained to facilitate dispute resolution and defend against unauthorized chargebacks.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <FileText className="text-blue-500" /> 2. Financial & Payment Information
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Handling your payouts securely is our top priority.
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li><strong>No Card Storage:</strong> We do not collect or store full credit or debit card numbers on our servers. All card and banking transactions are processed via PCI-DSS certified payment aggregators (e.g., Razorpay).</li>
              <li><strong>Payout Coordinates:</strong> Bank account numbers, IFSC codes, and verified UPI IDs provided by Creators are stored encrypted solely for disbursing cleared milestone earnings and fulfilling tax reporting obligations (e.g., TDS under Section 194-O).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Users className="text-blue-500" /> 3. Third-Party Data Sharing & Dispute Defense
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We never sell your personal data. We disclose information strictly in the following circumstances:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li><strong>Deal Counterparties:</strong> Contact names, brand briefs, submitted assets, and chat messages are shared between the Brand and Creator participating in an active deal.</li>
              <li><strong>Payment Processors & Banking Partners:</strong> In the event of payment authorization, refund execution, or cardholder chargeback claims, necessary transaction proofs, delivery timestamps, and chat records are submitted to payment partners and issuing banks to substantiate milestone completion.</li>
              <li><strong>Statutory & Regulatory Authorities:</strong> We disclose identity and transaction data when compelled by court orders, tax authorities, or law enforcement investigations under Indian law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Lock className="text-blue-500" /> 4. Data Retention & Security
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We deploy industry-standard encryption (in transit and at rest) and strict role-based access controls:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li><strong>Evidence Retention Period:</strong> Transaction history, KYC logs, deliverable assets, and deal chat logs are retained for a minimum of <strong>2 years (730 days)</strong> to cover statutory record-keeping periods and the 120+ day chargeback dispute window permitted by card networks.</li>
              <li>Account data is protected using salted hashing, SSL/TLS transmission encryption, and isolated database clusters.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Mail className="text-blue-500" /> 5. Contact Us & Grievance Officer
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, you may contact our designated Grievance Officer for data protection inquiries or concerns:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li><strong>Company Name:</strong> Brandfinity</li>
              <li><strong>Grievance Email:</strong> hello@brandfinity.in</li>
              <li><strong>Response Timeline:</strong> Acknowledged within 48 hours; targeted resolution within 30 days.</li>
              <li><strong>Registered Address:</strong> 1st floor Brandfinity, Vijayanand Society, P-15, near NIT Garden, Narendra Nagar square, Somalwada, Nagpur, Maharashtra 440015</li>
            </ul>
          </section>

        </div>
        
        <div className="mt-16 pt-8 border-t border-outline-variant/20 text-center">
          <p className="text-sm font-bold text-slate-400">By using our services, you consent to the collection and use of your information as described in this Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
