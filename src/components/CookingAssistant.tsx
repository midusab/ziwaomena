import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { ChefHat, Sparkles, Loader2, Send, X, MessageSquare, Fish } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing VITE_GEMINI_API_KEY in your environment variables.');
}

const ai = new GoogleGenAI({ apiKey });

export default function CookingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  const askChef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse('');
    
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are the 'Ziwa Chef', an expert in Kenyan cuisine, specifically fish and Omena. Provide short, encouraging, and authentic Kenyan recipes and tips. Use words like 'Karibu', 'Ladha', and mention classic accompaniments like Ugali and Managu. Keep responses concise and formatted with markdown.",
        },
      });
      
      setResponse(result.text || 'The chef is a bit busy, try again soon!');
    } catch (error) {
      console.error('Chef error:', error);
      setResponse('Pole! I had trouble thinking of a recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[90vw] max-w-sm glass rounded-[32px] overflow-hidden shadow-2xl border-2 border-white/40"
          >
            {/* Header */}
            <div className="bg-kfc-red p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-kfc-red">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-display text-white">Ziwa Chef</h3>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold">AI Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Content */}
            <div 
              ref={scrollRef}
              className="h-80 overflow-y-auto p-4 space-y-4 no-scrollbar bg-kfc-cream/50"
            >
              {!response && !loading && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-kfc-red/5 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-kfc-red/20" />
                  </div>
                  <p className="text-xs text-kfc-black/50 font-light px-6 italic">
                    "Karibu! Ask me anything about Omena recipes or lakeside cooking tips."
                  </p>
                </div>
              )}

              {response && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white rounded-2xl shadow-sm border border-black/5"
                >
                  <div className="flex items-center gap-2 mb-2 text-kfc-red font-bold text-[9px] uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    Chef's Tip
                  </div>
                  <div className="prose prose-stone prose-xs max-w-none">
                    <Markdown>{response}</Markdown>
                  </div>
                </motion.div>
              )}

              {loading && (
                <div className="flex items-center gap-2 p-4 bg-white/50 rounded-2xl">
                  <Loader2 className="w-4 h-4 text-kfc-red animate-spin" />
                  <span className="text-[10px] uppercase font-bold text-kfc-black/40 tracking-widest">Chef is thinking...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-black/5">
              <form onSubmit={askChef} className="relative">
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask for a recipe..."
                  className="w-full pl-4 pr-12 py-3 bg-kfc-black/5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-kfc-red/20"
                />
                <button 
                  disabled={loading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-kfc-red text-kfc-white rounded-lg flex items-center justify-center hover:bg-kfc-black transition-all shadow-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-kfc-red text-kfc-white rounded-[22px] flex items-center justify-center shadow-xl hover:bg-kfc-black hover:-translate-y-1 transition-all z-10 group relative"
      >
        <div className="absolute inset-0 bg-kfc-red rounded-[22px] animate-ping opacity-20 group-hover:hidden" />
        <MessageSquare className={`w-6 h-6 transition-transform duration-500 ${isOpen ? 'rotate-90 scale-0' : ''}`} />
        <X className={`w-6 h-6 absolute transition-transform duration-500 ${!isOpen ? '-rotate-90 scale-0' : ''}`} />
      </button>
    </div>
  );
}
