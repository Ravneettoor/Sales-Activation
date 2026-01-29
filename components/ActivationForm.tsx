import React, { useState, useEffect } from 'react';
import { Compass, Layers, MessageSquare, ChevronDown, CheckCircle, Calendar, GraduationCap, FileText, Megaphone, Loader2 } from 'lucide-react';
import { ActivationRequest, TRIGGERS, AUDIENCES, PILLARS } from '../types';

interface ActivationFormProps {
  initialData: ActivationRequest;
  onSubmit: (data: ActivationRequest) => void;
}

const ActivationForm: React.FC<ActivationFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<ActivationRequest>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form if initialData changes (e.g. from Agent)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMultiSelect = (field: 'strategyTrigger' | 'targetAudience', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists ? current.filter(item => item !== value) : [...current, value]
      };
    });
  };

  const togglePillar = (pillarId: string) => {
    setFormData(prev => {
      const current = prev.pillars;
      const exists = current.includes(pillarId);
      return {
        ...prev,
        pillars: exists ? current.filter(p => p !== pillarId) : [...current, pillarId]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
        onSubmit(formData);
        setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] border border-[#4B286D]/5 p-8 md:p-16 max-w-4xl mx-auto relative">
      <form onSubmit={handleSubmit} className="space-y-20">
        
        {/* PHASE 1: DISCOVERY */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[#4B286D] font-extrabold text-2xl md:text-3xl flex items-center gap-4">
              <Compass className="w-9 h-9" /> Project Discovery
            </h2>
            <div className="hidden md:block h-px flex-grow mx-8 bg-slate-100"></div>
            <span className="bg-[#F3F0F7] text-[#4B286D] text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
              Step 1 of 3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="md:col-span-2">
              <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-3">
                Project Name
              </label>
              <input
                type="text"
                name="projectName"
                required
                value={formData.projectName}
                onChange={handleChange}
                placeholder="e.g., 2024 PureFibre Expansion Sprint"
                className="w-full p-5 text-lg bg-[#F8F9FA] border-2 border-[#F1F3F5] rounded-[1.25rem] focus:outline-none focus:border-[#4B286D] focus:bg-white transition-all text-[#2D2D2D] font-medium placeholder-slate-400"
              />
            </div>

            {/* Triggers Multi-select simulation */}
            <div className="relative group">
               <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-3">
                Compelling Event
              </label>
              <div className="w-full p-5 text-lg bg-[#F8F9FA] border-2 border-[#F1F3F5] rounded-[1.25rem] flex justify-between items-center cursor-pointer group-hover:border-[#4B286D] transition-colors relative z-20">
                  <span className={formData.strategyTrigger.length ? "text-[#2D2D2D]" : "text-slate-400"}>
                      {formData.strategyTrigger.length > 0 ? `${formData.strategyTrigger.length} selected` : "Select event trigger..."}
                  </span>
                  <ChevronDown className="text-slate-400" />
              </div>
              {/* Dropdown Content */}
              <div className="absolute top-full left-0 right-0 bg-white border-2 border-[#4B286D] border-t-0 rounded-b-[1.25rem] shadow-xl p-2 hidden group-hover:block z-30 -mt-2 pt-4">
                  {TRIGGERS.map(t => (
                      <div 
                        key={t} 
                        onClick={() => toggleMultiSelect('strategyTrigger', t)}
                        className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 hover:bg-[#F3F0F7] transition-colors ${formData.strategyTrigger.includes(t) ? 'bg-[#F3F0F7]' : ''}`}
                      >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.strategyTrigger.includes(t) ? 'bg-[#4B286D] border-[#4B286D]' : 'border-slate-300'}`}>
                              {formData.strategyTrigger.includes(t) && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{t}</span>
                      </div>
                  ))}
              </div>
            </div>

             {/* Audience Multi-select simulation */}
             <div className="relative group">
               <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-3">
                Target Audience
              </label>
              <div className="w-full p-5 text-lg bg-[#F8F9FA] border-2 border-[#F1F3F5] rounded-[1.25rem] flex justify-between items-center cursor-pointer group-hover:border-[#4B286D] transition-colors relative z-20">
                  <span className={formData.targetAudience.length ? "text-[#2D2D2D]" : "text-slate-400"}>
                      {formData.targetAudience.length > 0 ? `${formData.targetAudience.length} selected` : "Select audience..."}
                  </span>
                  <ChevronDown className="text-slate-400" />
              </div>
              <div className="absolute top-full left-0 right-0 bg-white border-2 border-[#4B286D] border-t-0 rounded-b-[1.25rem] shadow-xl p-2 hidden group-hover:block z-30 -mt-2 pt-4">
                  {AUDIENCES.map(a => (
                      <div 
                        key={a} 
                        onClick={() => toggleMultiSelect('targetAudience', a)}
                        className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 hover:bg-[#F3F0F7] transition-colors ${formData.targetAudience.includes(a) ? 'bg-[#F3F0F7]' : ''}`}
                      >
                           <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.targetAudience.includes(a) ? 'bg-[#4B286D] border-[#4B286D]' : 'border-slate-300'}`}>
                              {formData.targetAudience.includes(a) && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{a}</span>
                      </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-10 md:col-span-2 bg-[#F8F9FA] p-8 rounded-[2rem] border-2 border-dashed border-slate-200">
             <div className="flex flex-col md:flex-row md:items-center gap-6">
                 <div className="flex-grow">
                     <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-2">Targeted Launch Date</label>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Please select the intended date for the activation to go live.</p>
                     <input 
                       type="date"
                       name="launchDate"
                       required
                       value={formData.launchDate}
                       onChange={handleChange}
                       className="w-full md:max-w-sm p-4 bg-white border-2 border-[#F1F3F5] rounded-[1.25rem] focus:outline-none focus:border-[#4B286D] text-[#2D2D2D]"
                     />
                 </div>
                 <div className="hidden md:flex w-24 h-24 bg-white rounded-3xl items-center justify-center text-[#4B286D] shadow-sm border border-slate-100">
                     <Calendar className="w-10 h-10" />
                 </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
              <div>
                 <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-3">Current State (Baseline KPI)</label>
                 <textarea 
                    name="kpiCurrent"
                    rows={3}
                    value={formData.kpiCurrent}
                    onChange={handleChange}
                    placeholder="Where is the funnel or skill level today?"
                    className="w-full p-5 text-base bg-[#F8F9FA] border-2 border-[#F1F3F5] rounded-[1.25rem] focus:outline-none focus:border-[#4B286D] focus:bg-white resize-none"
                 />
              </div>
              <div>
                 <label className="block text-[#54595F] text-xs font-extrabold uppercase tracking-[0.15em] mb-3">Future State (Success Metric)</label>
                 <textarea 
                    name="kpiGoal"
                    rows={3}
                    value={formData.kpiGoal}
                    onChange={handleChange}
                    placeholder="What is the target metric or goal?"
                    className="w-full p-5 text-base bg-[#F8F9FA] border-2 border-[#F1F3F5] rounded-[1.25rem] focus:outline-none focus:border-[#4B286D] focus:bg-white resize-none"
                 />
              </div>
          </div>
        </section>

        {/* PHASE 2: PILLARS */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[#4B286D] font-extrabold text-2xl md:text-3xl flex items-center gap-4">
              <Layers className="w-9 h-9" /> Activation Pillars
            </h2>
            <div className="hidden md:block h-px flex-grow mx-8 bg-slate-100"></div>
            <span className="bg-[#F3F0F7] text-[#4B286D] text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
              Step 2 of 3
            </span>
          </div>
          
          <p className="text-base text-gray-500 mb-10 font-medium">Select the strategic pillars required to build your activation menu.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PILLARS.map(pillar => {
                  const isActive = formData.pillars.includes(pillar.id);
                  const Icon = pillar.icon === 'GraduationCap' ? GraduationCap : pillar.icon === 'FileText' ? FileText : Megaphone;
                  
                  return (
                      <div 
                        key={pillar.id}
                        onClick={() => togglePillar(pillar.id)}
                        className={`border-2 p-8 rounded-[1.5rem] cursor-pointer transition-all duration-300 flex flex-col items-center gap-4 text-center group hover:-translate-y-1 hover:shadow-lg ${
                            isActive 
                            ? 'bg-[#F3F0F7] border-[#4B286D]' 
                            : 'bg-white border-[#F1F3F5] hover:border-[#4B286D]'
                        }`}
                      >
                          <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-colors ${
                              isActive ? 'bg-[#4B286D] text-white shadow-lg' : 'bg-[#F8F9FA] text-slate-400 group-hover:bg-[#4B286D] group-hover:text-white'
                          }`}>
                              <Icon className="w-7 h-7" />
                          </div>
                          <span className="font-extrabold text-xl tracking-tight text-slate-900">{pillar.label}</span>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{pillar.sub}</p>
                      </div>
                  )
              })}
          </div>
        </section>

        {/* PHASE 3: FINAL NUANCES */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[#4B286D] font-extrabold text-2xl md:text-3xl flex items-center gap-4">
              <MessageSquare className="w-9 h-9" /> Final Nuances
            </h2>
            <div className="hidden md:block h-px flex-grow mx-8 bg-slate-100"></div>
            <span className="bg-[#F3F0F7] text-[#4B286D] text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
              Step 3 of 3
            </span>
          </div>

          <textarea 
            name="specialRequirements"
            rows={4}
            value={formData.specialRequirements}
            onChange={handleChange}
            placeholder="Identify any unique activation needs, specialized project nuances, or key deadlines here..."
            className="w-full p-5 text-base bg-[#F8F9FA] border-2 border-[#F1F3F5] rounded-[1.25rem] focus:outline-none focus:border-[#4B286D] focus:bg-white resize-none"
          />

           {/* Transcript display if available (From Jane) */}
           {formData.transcript && (
              <div className="mt-8 p-6 bg-[#F3F0F7] rounded-2xl border border-[#4B286D]/10">
                  <h4 className="text-[#4B286D] font-bold text-sm uppercase tracking-wider mb-2">Jane's Interview Notes</h4>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">{formData.transcript}</p>
              </div>
           )}

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
                      <span>Submit Request</span>
                      <CheckCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    </>
                )}
            </button>
        </div>

      </form>
    </div>
  );
};

export default ActivationForm;
