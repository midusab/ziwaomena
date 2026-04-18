import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { ChefHat, Sparkles, Loader2, Send } from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing VITE_GEMINI_API_KEY in your environment variables.');
}

const ai = new GoogleGenAI({ apiKey });

export default function CookingAssistant() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askChef = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanedPrompt = prompt.trim();
    if (!cleanedPrompt) return;

    setLoading(true);
    setResponse('');

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: cleanedPrompt,
        config: {
          systemInstruction:
            "You are 'Ziwa Chef', an expert in Kenyan cuisine, especially fish and omena. Provide short, encouraging, authentic Kenyan recipes and tips. Use words like 'Karibu' and 'Ladha', and mention accompaniments like Ugali and Managu. Keep responses concise and formatted in markdown.",
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
    <div className="w-full max-w-2xl mx-auto rounded-2xl border p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <ChefHat className="h-8 w-8" />
        <div>
          <h2 className="text-2xl font-bold">Ziwa Chef</h2>
          <p className="text-sm text-gray-500">Kenyan recipe assistant</p>
        </div>
      </div>

      <form onSubmit={askChef} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask about fish, omena, ugali, managu..."
          className="w-full min-h-[120px] rounded-xl border p-4 outline-none"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Ask Chef
            </>
          )}
        </button>
      </form>

      <div className="mt-6 rounded-xl border p-4 min-h-[120px]">
        {loading ? (
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Ziwa Chef is preparing something tasty...</span>
          </div>
        ) : response ? (
          <Markdown>{response}</Markdown>
        ) : (
          <p className="text-gray-500">
            Karibu. Ask for a recipe, cooking tip, or meal idea.
          </p>
        )}
      </div>
    </div>
  );
}
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
