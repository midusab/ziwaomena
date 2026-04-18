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
        model: 'gemini-2.5-flash',
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
