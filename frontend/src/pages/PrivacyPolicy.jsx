import React from 'react';
import { Lock, Eye, Users, FileText, Mail } from 'lucide-react';

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
        <p className="text-center text-slate-500 font-medium mb-12">Last Updated: July 2026</p>

        <div className="space-y-12">
          
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Eye className="text-blue-500" /> 1. Data Collection & KYC
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              To operate securely and comply with local regulations, we collect necessary personal and business information.
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li><strong>Identity Data (KYC):</strong> We collect government-issued IDs (such as Aadhaar or PAN cards) to verify the identity of our users. This is legally required to prevent fraud, comply with Anti-Money Laundering (AML) laws, and ensure a safe ecosystem.</li>
              <li><strong>Profile Data:</strong> We collect social media handles, email addresses, and professional portfolios to facilitate matchmaking between Brands and Creators.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <FileText className="text-blue-500" /> 2. Financial Information
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Handling your payouts securely is our top priority.
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li><strong>We DO NOT store credit card numbers.</strong> All payment deposits are processed directly by our secure, third-party payment gateways (e.g., Razorpay, Stripe).</li>
              <li><strong>Payout Information:</strong> We do store your provided bank account details or UPI IDs. This information is strictly used by our Administration team to process manual payout clearances once a deal is successfully completed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Users className="text-blue-500" /> 3. Third-Party Data Sharing
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We do not sell your personal data. However, to facilitate our services, we may share specific information with the following third parties:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li><strong>Payment Gateways:</strong> Necessary transaction data is shared with our payment processors to authorize and capture funds.</li>
              <li><strong>Counterparties:</strong> When you enter into a deal, relevant profile information (such as your name, social links, and communication history on the platform) is shared with the other party (Brand or Creator) to facilitate the collaboration.</li>
              <li><strong>Government & Law Enforcement:</strong> We may disclose KYC and transaction data to government authorities or law enforcement agencies if legally requested for fraud investigations, tax compliance, or legal disputes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Lock className="text-blue-500" /> 4. Data Security
            </h2>
            <p className="text-slate-600 leading-relaxed">
              We implement industry-standard security measures to protect your personal and financial information. While no system is completely impenetrable, we utilize encryption and secure server architectures to ensure your data is safeguarded against unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Mail className="text-blue-500" /> 5. Contact Us & Grievance Officer
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              If you have any questions or concerns regarding this Privacy Policy or your personal data, or if you need to file a grievance, please contact our Grievance Officer using the details below:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
              <li><strong>Company Name:</strong> Brandfinity</li>
              <li><strong>Email:</strong> hello@brandfinity.in</li>
              <li><strong>Address:</strong> 1st floor Brandfinity, Vijayanand Society, P-15, near NIT Garden, Narendra Nagar square, Somalwada, Nagpur, Maharashtra 440015</li>
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
