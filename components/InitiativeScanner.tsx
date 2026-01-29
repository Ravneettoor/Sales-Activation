import React, { useState } from 'react';
import { Send, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { analyzeTextFeedback } from '../services/gemini';
import { FeedbackEntry, Topic, Sentiment, Urgency } from '../types';

interface InitiativeScannerProps {
  onFeedbackAnalyzed: (entry: FeedbackEntry) => void;
}

const InitiativeScanner: React.FC<InitiativeScannerProps> = ({ onFeedbackAnalyzed }) => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Partial<FeedbackEntry> | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setLastAnalysis(null);
    
    try {
      const result = await analyzeTextFeedback(inputText);
      
      const newEntry: FeedbackEntry = {
        id: crypto.randomUUID(),
        text: inputText,
        source: 'Text',
        timestamp: Date.now(),
        topic: result.topic as Topic,
        sentiment: result.sentiment as Sentiment,
        category: result.category,
        urgency: result.urgency as Urgency,
      };

      onFeedbackAnalyzed(newEntry);
      setLastAnalysis(newEntry);
      setInputText('');
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 bg-indigo-600 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Initiative Scanner
        </h2>
        <p className="text-indigo-100 text-sm mt-1">Paste emails, call notes, or slack messages to detect adoption friction.</p>
      </div>

      <div className="p-6">
        <div className="relative">
            <textarea
            className="w-full h-32 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-700 placeholder-slate-400"
            placeholder="e.g., 'The customer liked the new pricing model but is worried about the migration timeline...'"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isAnalyzing}
            />
            {isAnalyzing && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold bg-white px-4 py-2 rounded-full shadow-lg">
                        <Loader2 className="animate-spin w-4 h-4" />
                        Analyzing...
                    </div>
                </div>
            )}
        </div>
        
        <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-slate-400 italic">Powered by Gemini 1.5 Flash</p>
            <button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isAnalyzing}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors"
            >
                <Send className="w-4 h-4" />
                Scan & Submit
            </button>
        </div>

        {lastAnalysis && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Feedback Captured
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-500 block text-xs uppercase">Topic</span>
                        <span className="font-medium text-slate-800">{lastAnalysis.topic}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block text-xs uppercase">Category</span>
                        <span className="font-medium text-slate-800">{lastAnalysis.category}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block text-xs uppercase">Sentiment</span>
                        <span className={`font-medium ${lastAnalysis.sentiment === 'Negative' ? 'text-red-600' : 'text-slate-800'}`}>{lastAnalysis.sentiment}</span>
                    </div>
                     <div>
                        <span className="text-slate-500 block text-xs uppercase">Urgency</span>
                        <span className="font-medium text-slate-800">{lastAnalysis.urgency}</span>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default InitiativeScanner;
