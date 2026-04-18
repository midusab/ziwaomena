import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronDown, Send, MessageSquare, ShieldCheck, Leaf, Recycle, Trash2 } from 'lucide-react';

// --- Reviews ---
const REVIEWS = [
  {
    id: 1,
    name: "Otieno J.",
    rating: 5,
    text: "The crunchy deep-fried Omena is exactly like what I used to have at Dunga Beach. Authentic and fresh!",
    date: "2 days ago"
  },
  {
    id: 2,
    name: "Mercy W.",
    rating: 4,
    text: "Loved the wet fry! Delivery was fast and the packaging is very eco-friendly. Will order again.",
    date: "1 week ago"
  },
  {
    id: 3,
    name: "Kevin O.",
    rating: 5,
    text: "The Masala Omena is a game changer. First time trying it and I'm hooked. Perfect spice level.",
    date: "3 days ago"
  }
];

export function ReviewsSection() {
  return (
    <section id="reviews" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h3 className="text-4xl font-display text-kfc-black mb-4">Lakeside Love</h3>
        <p className="text-kfc-black/50 font-light max-w-lg mx-auto italic">Hear from our community of Omena enthusiasts.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {REVIEWS.map((review, idx) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-8 rounded-[40px] border border-white/40 shadow-xl relative"
          >
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-black/10'}`} />
              ))}
            </div>
            <p className="text-sm text-kfc-black/70 leading-relaxed mb-6 italic">"{review.text}"</p>
            <div className="flex items-center justify-between border-t border-black/5 pt-4">
              <span className="font-display text-sm text-kfc-red">{review.name}</span>
              <span className="text-[10px] uppercase font-bold text-kfc-black/30 tracking-widest">{review.date}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// --- FAQ ---
const FAQS = [
  {
    q: "How to remove the bitterness from Omena?",
    a: "The secret is thorough cleaning with warm salted water and a splash of lemon. Our lakeside chef recommends soaking for 10 minutes before frying."
  },
  {
    q: "Is your packaging really zero waste?",
    a: "Yes! We use biodegradable containers made from sugar cane pulp and recycled paper bags. No single-use plastics involved."
  },
  {
    q: "What is the delivery radius?",
    a: "We currently serve the greater Nairobi area, sourcing daily from Kisumu to ensure maximum freshness."
  },
  {
    q: "Do you have options for those new to Omena?",
    a: "Try our 'Classic Deep Fried' or 'Garlic Butter' variants. They are less intense and have a familiar crunchy texture."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-kfc-red/5">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-display text-kfc-black mb-4">Frequently Asked</h3>
          <p className="text-kfc-black/50 font-light italic">Everything you need to know about your lakeside feast.</p>
        </div>
        
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="glass-card rounded-[24px] overflow-hidden border border-white/40 shadow-sm">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 text-left flex items-center justify-between group"
              >
                <span className="font-bold text-sm text-kfc-black group-hover:text-kfc-red transition-colors">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-kfc-red transition-transform duration-500 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-sm text-kfc-black/60 font-light leading-relaxed border-t border-black/5 bg-white/30">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Inquiry ---
export function InquirySection() {
  return (
    <section id="inquiry" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="glass-card rounded-[60px] p-12 md:p-20 overflow-hidden relative shadow-[0_30px_60px_rgba(0,0,0,0.1)]">
        <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12">
            <MessageSquare className="w-64 h-64 text-kfc-red" />
        </div>
        
        <div className="grid lg:grid-cols-2 gap-20 relative z-10">
          <div>
            <h3 className="text-5xl font-display text-kfc-red mb-6 leading-tight uppercase tracking-tight">Contact for<br />Lake Inquiry</h3>
            <p className="text-kfc-black/60 font-light text-lg max-w-md leading-relaxed mb-10">
              Planning a bulk order for an event? Or have a specific question about our sustainable sourcing? Our team is ready to assist.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-kfc-red/10 rounded-2xl flex items-center justify-center text-kfc-red">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-kfc-black/40">Guaranteed Fresh</p>
                  <p className="text-sm font-bold text-kfc-black">24h Direct From Kisumu</p>
                </div>
              </div>
            </div>
          </div>
          
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-kfc-black/40 ml-4">Name</label>
                 <input className="w-full px-8 h-16 glass rounded-[2rem] border-0 focus:ring-2 focus:ring-kfc-red/20 text-sm" placeholder="Full Name" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-kfc-black/40 ml-4">Email</label>
                 <input className="w-full px-8 h-16 glass rounded-[2rem] border-0 focus:ring-2 focus:ring-kfc-red/20 text-sm" placeholder="email@address.com" />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-kfc-black/40 ml-4">Your Inquiry</label>
               <textarea rows={4} className="w-full px-8 py-6 glass rounded-[2rem] border-0 focus:ring-2 focus:ring-kfc-red/20 text-sm resize-none" placeholder="Message..." />
            </div>
            <button className="w-full py-6 bg-kfc-red text-white rounded-3xl font-bold uppercase tracking-widest shadow-xl hover:bg-kfc-black hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
               <Send className="w-5 h-5" />
               Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// --- Zero Waste Page ---
export function ZeroWastePage({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-kfc-cream p-6 md:p-12"
    >
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-12 flex items-center gap-2 text-kfc-red font-bold uppercase tracking-widest text-xs hover:translate-x-1 transition-all"
        >
          <Star className="w-4 h-4 rotate-180" /> {/* Just a visual arrow-like substitute or use icons */}
          Back to Lakeside
        </button>

        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-3 text-green-600 mb-6">
                <Leaf className="w-8 h-8" />
                <span className="text-[10px] uppercase font-black tracking-[0.3em]">Environmental Charter</span>
              </div>
              <h2 className="text-7xl font-display text-kfc-black leading-[0.9] tracking-tighter mb-8 italic">Zero Waste.<br /><span className="text-kfc-red">Pure Water.</span></h2>
              <p className="text-xl text-kfc-black/60 font-light leading-relaxed max-w-xl">
                Our commitment to Lake Victoria isn't just about what we take out, but what we don't put in. We've eliminated single-use plastics from our entire supply chain.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 text-kfc-black">
              <div className="glass-card p-8 rounded-[40px] border border-green-200">
                <Recycle className="w-8 h-8 text-green-600 mb-4" />
                <h4 className="font-bold text-sm mb-2 uppercase tracking-tight">Eco-Packaging</h4>
                <p className="text-xs text-kfc-black/50 font-light leading-relaxed">
                  Every order is delivered in 100% compostable sugar cane pulp containers and recycled kraft paper.
                </p>
              </div>
              <div className="glass-card p-8 rounded-[40px] border border-green-200">
                <Trash2 className="w-8 h-8 text-green-600 mb-4" />
                <h4 className="font-bold text-sm mb-2 uppercase tracking-tight">Supply Chain Clean</h4>
                <p className="text-xs text-kfc-black/50 font-light leading-relaxed">
                  We collect and recycle all plastic waste generated during our fishermen's expeditions.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
             <div className="aspect-[4/5] rounded-[80px] overflow-hidden shadow-2xl skew-y-1 rotate-1 group">
                <img 
                  src="https://picsum.photos/seed/lake-nature-clean/1000/1200" 
                  alt="Clear Water Lake" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-green-900/10 mix-blend-overlay" />
             </div>
             {/* Floating Badge */}
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center p-6 text-center border-4 border-kfc-cream rotate-6">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none mb-1">Plastic Free</p>
                <p className="text-[8px] font-bold text-kfc-black/40 uppercase leading-tight">Certified Sustainable Lakeside Supply</p>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
