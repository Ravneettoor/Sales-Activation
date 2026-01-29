import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, Sparkles, User, Bot, ArrowRight, StopCircle } from 'lucide-react';
import { DealSupportRequest } from '../types';
import { parseIntakeFromTranscript } from '../services/gemini';

interface JaneAgentProps {
  onComplete: (data: Partial<DealSupportRequest>, transcript: string) => void;
  onCancel: () => void;
}

// --- Audio Helper Functions ---
function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return {
    data: btoa(String.fromCharCode(...new Uint8Array(int16.buffer))),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const SYSTEM_INSTRUCTION = `
You are Jane, a specialized Wireless Pricing & Deal Support Expert at TELUS.
Your goal is to interview a Sales Executive to gather all the necessary information for a "Wireless Acquisition Pricing Request" to the Offer House.

You must gather the following "Strategic Intel" naturally. Do not ask them as a checklist, but have a conversation:
1. Strategy to win: Why should the customer choose TELUS?
2. Pain points: What issues do they have with their current provider?
3. Financials: Are there Termination Liability Charges (TLCs)?
4. Client Value: What matters most to them? (Price, Service, Coverage?)
5. Hardware: Is this BYOD, Refresh, or Upgrade?
6. Data Usage & Roaming: What is their usage profile?
7. Competitive Intel: Who are we up against and what is the offer to win?

Also gather basics if not provided:
- Deal Size (Number of lines)
- Term length (months)

Be efficient. If the user gives a long answer covering multiple points, acknowledge it and move to the missing pieces.
Start by asking: "Hi, I'm Jane from Deal Support. Tell me about the opportunity you're working on today."
`;

const JaneAgent: React.FC<JaneAgentProps> = ({ onComplete, onCancel }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState<{ source: 'user' | 'model'; text: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  
  // Refs for accumulation
  const fullTranscriptRef = useRef<string>("");
  const currentInputRef = useRef("");
  const currentOutputRef = useRef("");

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  const disconnect = () => {
    sessionRef.current = null;
    inputCtxRef.current?.close();
    outputCtxRef.current?.close();
    setIsConnected(false);
  };

  const connect = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;

      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, 
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!sessionRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(session => session.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                currentOutputRef.current += text;
                setIsSpeaking(true);
              } else if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                currentInputRef.current += text;
              }

              if (message.serverContent?.turnComplete) {
                const userT = currentInputRef.current.trim();
                const modelT = currentOutputRef.current.trim();

                if (userT) {
                   setTranscripts(prev => [...prev, { source: 'user', text: userT }]);
                   fullTranscriptRef.current += `User: ${userT}\n`;
                }
                if (modelT) {
                   setTranscripts(prev => [...prev, { source: 'model', text: modelT }]);
                   fullTranscriptRef.current += `Jane: ${modelT}\n`;
                }

                currentInputRef.current = '';
                currentOutputRef.current = '';
                setIsSpeaking(false);
              }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const binary = atob(base64Audio);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              
              const int16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(int16.length);
              for (let i=0; i<int16.length; i++) float32[i] = int16[i] / 32768.0;

              const buffer = outputCtx.createBuffer(1, float32.length, 24000);
              buffer.getChannelData(0).set(float32);

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNode);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
            }
          }
        }
      });
      
      sessionPromise.then(s => sessionRef.current = s);

    } catch (e) {
      console.error(e);
      setIsConnected(false);
    }
  };

  const handleFinish = async () => {
    setIsProcessing(true);
    disconnect();
    
    // Parse the transcript
    const parsedData = await parseIntakeFromTranscript(fullTranscriptRef.current);
    onComplete(parsedData, fullTranscriptRef.current);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 max-w-4xl mx-auto">
      {/* Jane Header */}
      <div className="bg-[#4B286D] p-8 text-white flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
           <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <Bot className="w-8 h-8 text-white" />
           </div>
           <div>
              <h2 className="text-2xl font-bold">Offer House Intake</h2>
              <p className="text-purple-200">Jane • Pricing & Deal Specialist</p>
           </div>
        </div>
        
        {/* Visualizer */}
        <div className="flex items-center gap-2">
           {isConnected && (
             <div className="flex gap-1 items-end h-8">
               <div className={`w-1 bg-green-400 rounded-full transition-all duration-100 ${isSpeaking ? 'h-8' : 'h-2 animate-pulse'}`}></div>
               <div className={`w-1 bg-green-400 rounded-full transition-all duration-100 delay-75 ${isSpeaking ? 'h-6' : 'h-3 animate-pulse'}`}></div>
               <div className={`w-1 bg-green-400 rounded-full transition-all duration-100 delay-150 ${isSpeaking ? 'h-5' : 'h-2 animate-pulse'}`}></div>
             </div>
           )}
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 bg-[#F9FAFB] p-8 overflow-y-auto space-y-6">
         {transcripts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                <Sparkles className="w-12 h-12 mb-4 text-[#4B286D]" />
                <p>Jane is ready to strategize...</p>
            </div>
         )}
         {transcripts.map((t, i) => (
            <div key={i} className={`flex gap-4 ${t.source === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                   t.source === 'user' ? 'bg-slate-200' : 'bg-[#4B286D] text-white'
               }`}>
                  {t.source === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5" />}
               </div>
               <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                   t.source === 'user' 
                   ? 'bg-white text-slate-700 rounded-tr-none' 
                   : 'bg-[#4B286D]/5 text-[#4B286D] rounded-tl-none font-medium'
               }`}>
                   {t.text}
               </div>
            </div>
         ))}
         {/* Bottom Spacer */}
         <div className="h-4"></div>
      </div>

      {/* Footer Controls */}
      <div className="bg-white p-6 border-t border-slate-100 flex justify-between items-center">
         <button 
           onClick={onCancel}
           className="text-slate-400 hover:text-slate-600 font-semibold px-4"
         >
           Cancel
         </button>

         {isProcessing ? (
            <div className="flex items-center gap-3 text-[#4B286D] font-bold animate-pulse">
                <Sparkles className="w-5 h-5" />
                Processing Intel...
            </div>
         ) : (
            <button
                onClick={handleFinish}
                className="bg-[#2B8000] hover:bg-[#236600] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-green-900/10 flex items-center gap-2 transition-transform active:scale-95"
            >
                Generate Request <ArrowRight className="w-5 h-5" />
            </button>
         )}
      </div>
    </div>
  );
};

export default JaneAgent;
