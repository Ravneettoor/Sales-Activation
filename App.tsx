import React, { useState } from 'react';
import { Mic, FileText, CheckCircle } from 'lucide-react';
import DealSupportForm from './components/DealSupportForm';
import JaneAgent from './components/JaneAgent';
import { DealSupportRequest, INITIAL_DEAL_REQUEST } from './types';

type ViewState = 'landing' | 'form' | 'agent' | 'success';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [requestData, setRequestData] = useState<DealSupportRequest>(INITIAL_DEAL_REQUEST);

  // Handle agent completion
  const handleAgentComplete = (data: Partial<DealSupportRequest>, transcript: string) => {
    setRequestData(prev => ({
      ...prev,
      ...data,
      transcript: transcript
    }));
    setView('form');
  };

  const handleSubmit = (finalData: DealSupportRequest) => {
    console.log("Submitting Deal Support Payload:", finalData);
    setRequestData(finalData);
    setView('success');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans">
      
      {/* HEADER */}
      <header className="bg-gradient-to-br from-[#4B286D] to-[#6b3e9a] text-white pt-20 pb-32 px-6 relative overflow-hidden">
         <div className="absolute -bottom-16 left-0 right-0 h-32 bg-[#F9FAFB] rounded-[50%] scale-x-150"></div>

         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
            <div>
               <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight leading-tight">
                  Deal Support <br className="hidden md:block" /> Intake
               </h1>
               <p className="text-xl opacity-80 font-medium max-w-xl">
                  Wireless Acquisition Pricing Request & Offer House Submission.
               </p>
            </div>
            
            <div className="flex justify-center md:justify-start">
               <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2.25rem] flex items-center gap-6 min-w-[340px] shadow-2xl relative overflow-hidden group hover:bg-white/15 transition-all">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-green-400 flex items-center justify-center text-[#4B286D] font-black text-3xl shadow-lg ring-8 ring-white/5">
                     N
                  </div>
                  <div>
                     <p className="text-[11px] uppercase font-black tracking-[0.25em] text-green-300 mb-1">Authenticated Prime</p>
                     <p className="text-xl font-bold tracking-tight">nigel.wilson@telus.com</p>
                  </div>
               </div>
            </div>
         </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
        
        {view === 'landing' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
               {/* Option 1: Manual Form */}
               <button 
                 onClick={() => setView('form')}
                 className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-transparent hover:border-[#4B286D] transition-all group text-left flex flex-col gap-6"
               >
                  <div className="w-20 h-20 bg-[#F3F0F7] rounded-3xl flex items-center justify-center text-[#4B286D] group-hover:bg-[#4B286D] group-hover:text-white transition-colors">
                      <FileText className="w-10 h-10" />
                  </div>
                  <div>
                      <h3 className="text-3xl font-extrabold text-[#2D2D2D] mb-2">Deal Form</h3>
                      <p className="text-slate-500 font-medium text-lg">Manually enter general information, contract specs, and strategic details.</p>
                  </div>
                  <div className="mt-auto flex items-center gap-2 text-[#4B286D] font-bold uppercase tracking-widest text-sm group-hover:translate-x-2 transition-transform">
                      Start Entry &rarr;
                  </div>
               </button>

               {/* Option 2: Jane Agent */}
               <button 
                 onClick={() => setView('agent')}
                 className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-transparent hover:border-[#2B8000] transition-all group text-left flex flex-col gap-6 relative overflow-hidden"
               >
                   <div className="absolute top-0 right-0 p-4 bg-green-100 rounded-bl-3xl text-green-700 font-bold text-xs uppercase tracking-widest">
                       Pricing Expert
                   </div>
                  <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-[#2B8000] group-hover:bg-[#2B8000] group-hover:text-white transition-colors">
                      <Mic className="w-10 h-10" />
                  </div>
                  <div>
                      <h3 className="text-3xl font-extrabold text-[#2D2D2D] mb-2">Interview with Jane</h3>
                      <p className="text-slate-500 font-medium text-lg">Collaborate with our AI Pricing Specialist to gather acquisition intel.</p>
                  </div>
                  <div className="mt-auto flex items-center gap-2 text-[#2B8000] font-bold uppercase tracking-widest text-sm group-hover:translate-x-2 transition-transform">
                      Start Interview &rarr;
                  </div>
               </button>
           </div>
        )}

        {view === 'form' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 flex justify-start">
                  <button onClick={() => setView('landing')} className="text-slate-400 font-bold hover:text-[#4B286D] transition-colors">
                      &larr; Back to Selection
                  </button>
              </div>
              <DealSupportForm 
                 initialData={requestData} 
                 onSubmit={handleSubmit} 
              />
           </div>
        )}

        {view === 'agent' && (
           <div className="h-[800px] animate-in zoom-in duration-300">
               <JaneAgent 
                  onComplete={handleAgentComplete}
                  onCancel={() => setView('landing')}
               />
           </div>
        )}

        {view === 'success' && (
            <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-xl flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                <div className="bg-white rounded-[4rem] p-16 md:p-24 max-w-3xl w-full text-center shadow-2xl animate-in zoom-in duration-500">
                    <div className="w-40 h-40 bg-green-100 text-[#2B8000] rounded-full flex items-center justify-center mx-auto mb-12">
                        <CheckCircle className="w-24 h-24" />
                    </div>
                    <h3 className="text-5xl md:text-6xl font-black text-[#2D2D2D] mb-8 tracking-tighter">Request Submitted</h3>
                    <p className="text-2xl text-slate-500 font-bold mb-14 leading-relaxed px-12">
                        Pricing request has been sent to the Offer House queue.
                    </p>
                    <button 
                       onClick={() => {
                           setRequestData(INITIAL_DEAL_REQUEST);
                           setView('landing');
                       }}
                       className="bg-[#2B8000] hover:bg-[#236600] w-full py-8 rounded-[2.5rem] text-white font-black text-3xl shadow-xl transition-all active:scale-[0.98]"
                    >
                        New Deal Request
                    </button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;
