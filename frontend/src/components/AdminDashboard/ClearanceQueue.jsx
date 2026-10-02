import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { CreditCard, ArrowRight, CheckCircle, Clock } from 'lucide-react';

function ClearanceQueue() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/clearance-queue');
      setDeals(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch clearance queue');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm("Are you sure you have manually transferred the funds to the creator's bank account?")) {
      return;
    }
    try {
      setProcessingId(id);
      await axios.post(`/admin/clearance-queue/${id}/pay`);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as paid');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-on-surface-variant font-bold animate-pulse">Loading Queue...</div>;
  if (error) return <div className="p-8 text-error font-bold">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-surface-container/20 rounded-3xl p-8 border border-outline-variant/20">
        <h3 className="text-xl font-black text-on-surface mb-2 flex items-center gap-2">
          <CreditCard className="text-secondary" /> Admin Clearance Queue
        </h3>
        <p className="text-sm text-on-surface-variant mb-8">
          These deals have been approved by the brand. Manually transfer the Net Payout to the Creator's bank account, then click "Mark as Paid".
        </p>

        {deals.length === 0 ? (
          <div className="text-center py-12 bg-surface-container/10 rounded-2xl border border-outline-variant/10">
            <CheckCircle className="mx-auto text-emerald-400 mb-4" size={48} />
            <h4 className="text-lg font-black text-on-surface">Queue is Empty</h4>
            <p className="text-sm text-on-surface-variant">All approved deals have been paid out.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map(deal => {
              const platformFee = deal.budget * 0.10; // Default 10%
              const netPayout = deal.budget - platformFee;

              return (
                <div key={deal._id} className="bg-surface p-6 rounded-2xl border border-outline-variant/20 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-on-surface mb-1">
                      {deal.originType === 'package' ? 'Package Order' : deal.applicationId?.campaignId?.title}
                    </h4>
                    <div className="text-sm text-on-surface-variant mb-4">
                      Brand: <span className="font-bold text-primary">{deal.brandId?.userId?.name || 'Unknown'}</span> <ArrowRight size={12} className="inline mx-1" /> 
                      Creator: <span className="font-bold text-secondary">{deal.creatorId?.userId?.name || 'Unknown'}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-surface-container/30 p-3 rounded-xl border border-outline-variant/10">
                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Budget</div>
                        <div className="text-sm font-black text-on-surface">{deal.budget.toLocaleString()} 🪙</div>
                      </div>
                      <div className="bg-error/10 p-3 rounded-xl border border-error/20">
                        <div className="text-[10px] font-bold text-error uppercase tracking-widest mb-1">Platform Fee (10%)</div>
                        <div className="text-sm font-black text-error">- {platformFee.toLocaleString()} 🪙</div>
                      </div>
                      <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                        <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Net Payout to Creator</div>
                        <div className="text-lg font-black text-emerald-400">{netPayout.toLocaleString()} 🪙</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">
                    <button 
                      onClick={() => handleMarkPaid(deal._id)}
                      disabled={processingId === deal._id}
                      className="w-full lg:w-auto px-6 py-4 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {processingId === deal._id ? 'Processing...' : 'Mark as Paid'}
                    </button>
                    <a href={deal.contentUrl} target="_blank" rel="noreferrer" className="text-center text-xs font-bold text-secondary hover:underline">
                      Review Assets
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClearanceQueue;
