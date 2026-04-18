import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { ChefHat, Sparkles, Loader2, Send } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function CookingAssistant() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="glass p-8 md:p-12 rounded-[40px]">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-kfc-red rounded-full flex items-center justify-center text-kfc-white shadow-lg overflow-hidden">
             <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-3xl font-display text-kfc-black">Ask the Lakeside Chef</h3>
            <p className="text-kfc-black/50 font-light text-sm italic">Don't know how to cook it? I'm here to help!</p>
          </div>
        </div>

        <form onSubmit={askChef} className="relative mb-10">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. How do I make the perfect Omena Wet Fry?"
            className="w-full pl-6 pr-16 py-6 bg-white border border-black/5 rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-kfc-red/20 shadow-inner placeholder:text-kfc-black/30 font-medium"
          />
          <button 
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-kfc-red text-kfc-white rounded-2xl flex items-center justify-center hover:bg-kfc-black transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>

        <AnimatePresence>
          {response && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-8 glass rounded-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Fish className="w-20 h-20 text-kfc-red" />
              </div>
              <div className="flex items-center gap-2 mb-4 text-kfc-red font-bold text-xs uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Chef's Recommendation
              </div>
              <div className="prose prose-stone prose-sm max-w-none prose-headings:font-display prose-headings:text-kfc-red prose-p:text-kfc-black/70 prose-p:font-light prose-p:leading-relaxed">
                <Markdown>{response}</Markdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!response && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 opacity-60">
            {[
              "Secret to crunchy Omena",
              "How to remove bitterness",
              "Best side dishes",
              "Cleaning tips",
              "Wet vs Dry Fry"
            ].map(tip => (
              <button 
                key={tip}
                onClick={() => setPrompt(`Chef, tell me one ${tip}`)}
                className="px-4 py-2 border border-black/5 rounded-xl text-[10px] text-kfc-black/60 uppercase font-bold hover:bg-kfc-red hover:text-kfc-white transition-colors"
              >
                {tip}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { Fish } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
