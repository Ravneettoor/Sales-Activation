import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Mic, Square, Radio, Activity, MessageSquare } from 'lucide-react';

// --- Audio Helper Functions (PCM Encoding/Decoding) ---
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp values to [-1, 1] range to prevent wrapping artifacts
    const s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const SYSTEM_INSTRUCTION = `
You are an empathetic, curious User Researcher interviewing a sales representative.
Your goal is to uncover the root cause of their frustration or success regarding specific Solutions, Initiatives, or Programs.
Rules:
1. Be Brief: Ask only one question at a time.
2. Dig Deeper: If they say "It's hard to sell," ask "Is it hard because of the price, the features, or the competition?"
3. Stay Neutral: Do not agree or disagree; just gather data.
4. Context Aware: If they are talking about a "Program," ask about the learning material. If they are talking about a "Solution," ask about customer reaction.
Start by asking: "How did your last customer meeting go? Be honest."
`;

const DriveHomeDebrief: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Model is speaking
  const [transcripts, setTranscripts] = useState<{ source: 'user' | 'model'; text: string }[]>([]);
  
  // Refs for audio handling
  const nextStartTimeRef = useRef<number>(0);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null); // To hold the resolved session for sending data
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Transcription refs to handle streaming updates without re-renders loop
  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const disconnect = () => {
    if (sessionRef.current) {
      // There is no explicit .close() on the session object in the new SDK structure easily accessible 
      // aside from closing the contexts/streams, but we can reset state.
      // In a real app, we'd trigger a close on the connection logic if exposed.
      sessionRef.current = null;
    }
    
    // Stop all playing sources
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();

    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
  };

  const startSession = async () => {
    if (isConnected) return;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Audio Contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const inputNode = inputCtx.createGain();
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination); // Connect output to speakers

      // Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Connect to Live API
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
            console.log('Session opened');
            setIsConnected(true);

            // Setup Input Stream Processing
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              // Send audio data
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Transcriptions
             if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                currentOutputTransRef.current += text;
                setIsSpeaking(true);
              } else if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                currentInputTransRef.current += text;
              }

              if (message.serverContent?.turnComplete) {
                const userText = currentInputTransRef.current;
                const modelText = currentOutputTransRef.current;

                if (userText.trim()) {
                   setTranscripts(prev => [...prev, { source: 'user', text: userText }]);
                }
                if (modelText.trim()) {
                   setTranscripts(prev => [...prev, { source: 'model', text: modelText }]);
                }

                currentInputTransRef.current = '';
                currentOutputTransRef.current = '';
                setIsSpeaking(false);
              }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              // Ensure we don't schedule in the past
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                outputCtx.currentTime
              );

              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputCtx,
                24000,
                1
              );

              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                     // buffer empty
                }
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onclose: () => {
            console.log('Session closed');
            disconnect();
          },
          onerror: (err) => {
            console.error('Session error', err);
            disconnect();
          }
        }
      });

      // Save session reference for sending messages manually if needed (not used for audio only)
      sessionPromise.then(sess => {
          sessionRef.current = sess;
      });

    } catch (e) {
      console.error("Failed to connect", e);
      setIsConnected(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
      {/* Header */}
      <div className="bg-slate-800 p-6 flex justify-between items-center border-b border-slate-700">
        <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
            <Radio className="text-rose-500" />
            The Drive-Home Debrief
            </h2>
            <p className="text-slate-400 text-sm mt-1">
            Gemini Live Audio • Hands-free capture
            </p>
        </div>
        {isConnected && (
            <div className="flex items-center gap-2 text-rose-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Recording
            </div>
        )}
      </div>

      {/* Visualization Area */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-900 to-slate-800">
        {isConnected ? (
          <div className="relative z-10">
             {/* Simple Pulse Visualizer */}
            <div className={`w-32 h-32 rounded-full bg-rose-500/20 flex items-center justify-center transition-all duration-200 ${isSpeaking ? 'scale-110' : 'scale-100'}`}>
                <div className={`w-24 h-24 rounded-full bg-rose-500/40 flex items-center justify-center animate-pulse`}>
                    <Mic className="w-10 h-10 text-white" />
                </div>
            </div>
            <p className="mt-8 text-center text-slate-300 font-medium">
                {isSpeaking ? "Field Intel is asking..." : "Listening to you..."}
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
             <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto flex items-center justify-center mb-4">
                <Mic className="w-10 h-10 text-slate-400" />
             </div>
             <h3 className="text-lg font-semibold">Ready to Debrief?</h3>
             <p className="text-slate-400 max-w-xs mx-auto">
               Connect to start a voice-first interview about your recent customer interactions.
             </p>
          </div>
        )}

        {/* Live Transcript Snippet (Floating) */}
        <div className="absolute bottom-4 left-4 right-4 h-32 overflow-y-auto mask-image-gradient">
             {transcripts.slice(-2).map((t, i) => (
                 <div key={i} className={`flex ${t.source === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
                     <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${t.source === 'user' ? 'bg-blue-600/80 text-white' : 'bg-slate-700/80 text-slate-200'}`}>
                         {t.text}
                     </div>
                 </div>
             ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 p-6 flex justify-center border-t border-slate-700">
        {!isConnected ? (
          <button
            onClick={startSession}
            className="flex items-center gap-3 px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-rose-500/20 transition-all transform hover:-translate-y-1"
          >
            <Radio className="w-5 h-5" />
            Start Session
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="flex items-center gap-3 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold text-lg shadow-lg transition-all"
          >
            <Square className="w-5 h-5 fill-current" />
            End Debrief
          </button>
        )}
      </div>
    </div>
  );
};

export default DriveHomeDebrief;
