import React, { useState, useEffect } from 'react';
import { Briefcase, FileText, Target, CheckCircle, Calendar, Users, Calculator, ShieldCheck, Loader2 } from 'lucide-react';
import { DealSupportRequest, BUSINESS_SEGMENTS, PROVINCES, REQUEST_TYPES, FULFILLMENT_TYPES } from '../types';

interface DealSupportFormProps {
  initialData: DealSupportRequest;
  onSubmit: (data: DealSupportRequest) => void;
}

const DealSupportForm: React.FC<DealSupportFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<DealSupportRequest>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
        onSubmit(formData);
        setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] border border-[#4B286D]/5 p-8 md:p-16 max-w-5xl mx-auto relative">
      <form onSubmit={handleSubmit} className="space-y-20">
        
        {/* PHASE 1: DEAL BASICS */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[#4B286D] font-extrabold text-2xl md:text-3xl flex items-center gap-4">
              <Briefcase className="w-9 h-9" /> Deal Basics
            </h2>
            <div className="hidden md:block h-px flex-grow mx-8 bg-slate-100"></div>
            <span className="bg-[#F3F0F7] text-[#4B286D] text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
              Step 1 of 3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-3">Sales Manager</label>
              <input type="text" name="salesManager" required value={formData.salesManager} onChange={handleChange} className="form-input" placeholder="e.g. Sarah Connor" />
            </div>

            <div>
              <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-3">Province</label>
              <select name="province" value={formData.province} onChange={handleChange} className="form-select">
                <option value="">Select Province</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-3">Request Type</label>
              <select name="requestType" value={formData.requestType} onChange={handleChange} className="form-select">
                {REQUEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

             <div>
              <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-3">Fulfillment Type</label>
              <select name="fulfillmentType" value={formData.fulfillmentType} onChange={handleChange} className="form-select">
                {FULFILLMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          
          <div className="mt-8">
             <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-3">Business Segment</label>
             <div className="grid grid-cols-2 gap-4">
                 {BUSINESS_SEGMENTS.map(seg => (
                     <div 
                        key={seg.id} 
                        onClick={() => setFormData(p => ({...p, businessSegment: seg.id}))}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.businessSegment === seg.id ? 'border-[#4B286D] bg-[#F3F0F7]' : 'border-[#F1F3F5] hover:border-[#4B286D]'}`}
                     >
                        <div className="font-bold text-lg text-[#2D2D2D]">{seg.label}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{seg.sub}</div>
                     </div>
                 ))}
             </div>
          </div>
        </section>

        {/* PHASE 2: CONTRACT SPECS */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[#4B286D] font-extrabold text-2xl md:text-3xl flex items-center gap-4">
              <Calculator className="w-9 h-9" /> Contract Specs
            </h2>
            <div className="hidden md:block h-px flex-grow mx-8 bg-slate-100"></div>
            <span className="bg-[#F3F0F7] text-[#4B286D] text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
              Step 2 of 3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="p-6 bg-[#F8F9FA] rounded-[1.5rem] border border-[#F1F3F5]">
                <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-3">Contract Type</label>
                <select name="contractType" value={formData.contractType} onChange={handleChange} className="form-select bg-white">
                    <option value="CCA">New CCA</option>
                    <option value="Wireless Amendment">Wireless Amendment</option>
                </select>
             </div>
             <div className="p-6 bg-[#F8F9FA] rounded-[1.5rem] border border-[#F1F3F5]">
                <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-3">Term (Months)</label>
                <input type="number" name="termMonths" value={formData.termMonths} onChange={handleChange} className="form-input bg-white" />
             </div>
             <div className="p-6 bg-[#F8F9FA] rounded-[1.5rem] border border-[#F1F3F5]">
                <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-3">Min Commitment</label>
                <input type="number" name="minCommitment" value={formData.minCommitment} onChange={handleChange} className="form-input bg-white" placeholder="# Lines" />
             </div>
          </div>
        </section>

        {/* PHASE 3: STRATEGY & INTEL */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[#4B286D] font-extrabold text-2xl md:text-3xl flex items-center gap-4">
              <Target className="w-9 h-9" /> Strategy & Intel
            </h2>
            <div className="hidden md:block h-px flex-grow mx-8 bg-slate-100"></div>
            <span className="bg-[#F3F0F7] text-[#4B286D] text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
              Step 3 of 3
            </span>
          </div>
          
          <div className="space-y-8">
             <div className="bg-[#F3F0F7] p-8 rounded-[1.5rem] border border-[#4B286D]/20">
                <h3 className="text-[#4B286D] font-bold text-lg mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Critical for Offer House</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="input-label">Strategy to Win / Compelling Reason</label>
                        <textarea name="strategyWin" rows={3} value={formData.strategyWin} onChange={handleChange} className="form-textarea bg-white" placeholder="Why should they choose TELUS?" />
                    </div>
                    <div>
                        <label className="input-label">Offer Required to Win</label>
                        <textarea name="offerToWin" rows={3} value={formData.offerToWin} onChange={handleChange} className="form-textarea bg-white" placeholder="Specific pricing or structure needed." />
                    </div>
                    <div>
                        <label className="input-label">Current TLCs</label>
                        <input type="text" name="currentTLCs" value={formData.currentTLCs} onChange={handleChange} className="form-input bg-white" placeholder="Termination Liability Charges" />
                    </div>
                     <div>
                        <label className="input-label">Competitive Intel</label>
                        <input type="text" name="competitiveIntel" value={formData.competitiveIntel} onChange={handleChange} className="form-input bg-white" placeholder="Who are we competing against?" />
                    </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="input-label">Customer Pain Points</label>
                    <textarea name="customerPainPoints" rows={2} value={formData.customerPainPoints} onChange={handleChange} className="form-textarea" />
                </div>
                <div>
                    <label className="input-label">Client Value Driver</label>
                    <textarea name="clientValue" rows={2} value={formData.clientValue} onChange={handleChange} className="form-textarea" placeholder="What do they value most?" />
                </div>
                 <div>
                    <label className="input-label">Hardware Plans</label>
                    <textarea name="hardwarePlans" rows={2} value={formData.hardwarePlans} onChange={handleChange} className="form-textarea" placeholder="Refresh, BYOD, Upgrade?" />
                </div>
                <div>
                    <label className="input-label">Data Usage Profile</label>
                    <textarea name="dataUsage" rows={2} value={formData.dataUsage} onChange={handleChange} className="form-textarea" />
                </div>
             </div>

             {/* Transcript display */}
             {formData.transcript && (
                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <h4 className="text-[#4B286D] font-bold text-sm uppercase tracking-wider mb-2">Jane's Interview Notes</h4>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">{formData.transcript}</p>
                </div>
             )}
          </div>
        </section>

        {/* SUBMIT */}
        <div className="pt-16 border-t-2 border-slate-100 flex flex-col items-center">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#2B8000] hover:bg-[#236600] w-full py-8 rounded-[1.5rem] text-white font-black text-3xl shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin" /> Submitting...
                    </>
                ) : (
                    <>
                      <span>Submit Deal Request</span>
                      <CheckCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    </>
                )}
            </button>
        </div>

      </form>
      <style>{`
        .form-input, .form-select, .form-textarea {
            width: 100%;
            padding: 1.25rem;
            background-color: #F8F9FA;
            border: 2px solid #F1F3F5;
            border-radius: 1.25rem;
            color: #2D2D2D;
            font-size: 1rem;
            font-weight: 500;
            transition: all 0.2s;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
            outline: none;
            border-color: #4B286D;
            background-color: white;
        }
        .input-label {
            display: block;
            color: #54595F;
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-bottom: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default DealSupportForm;
