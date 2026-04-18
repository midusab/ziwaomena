import { motion } from 'motion/react';
import { Anchor, Waves, Heart, ShieldCheck, MapPin, Star, Fish, ArrowLeft } from 'lucide-react';
import { FISHERMEN } from '../constants';

interface FishermenPageProps {
  onBack: () => void;
}

export default function FishermenPage({ onBack }: FishermenPageProps) {
  return (
    <div className="min-h-screen bg-kfc-cream pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-kfc-red font-bold text-xs uppercase tracking-widest hover:-translate-x-1 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="text-right hidden md:block">
            <p className="text-kfc-red font-display text-lg">Sustainable Lakeshore Legacy</p>
            <p className="text-kfc-black/40 text-[10px] uppercase font-bold tracking-[0.2em]">Winam Gulf • Mbita • Asat</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-[48px] overflow-hidden bg-kfc-red text-kfc-white p-12 md:p-24 mb-20 shadow-2xl">
          <div className="absolute inset-0 stripes-red opacity-10" />
          <div className="absolute top-0 right-0 p-12 opacity-10">
             <Waves className="w-64 h-64 rotate-12" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/20">
                <Anchor className="w-3 h-3" />
                The Heart of the Lake
              </div>
              <h1 className="text-5xl md:text-7xl font-display mb-8 leading-tight">Meet the Keepers <br/> of the Gulf.</h1>
              <p className="text-lg md:text-xl font-light opacity-80 leading-relaxed mb-10">
                Every Omena item delivered by OmenaExpress tells a story of patience, 
                heritage, and deep respect for the lake. Meet the men and women who 
                ensure your meal is ethically sourced and ecologically sound.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                   <p className="text-3xl font-display">120+</p>
                   <p className="text-[10px] uppercase font-bold opacity-60 tracking-wider">Family Boats</p>
                </div>
                <div>
                   <p className="text-3xl font-display">Zero</p>
                   <p className="text-[10px] uppercase font-bold opacity-60 tracking-wider">Plastic Waste</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Fishermen Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {FISHERMEN.map((fisher, idx) => (
            <motion.div
              key={fisher.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card rounded-[40px] overflow-hidden group border-2 border-transparent hover:border-kfc-red/20"
            >
              <div className="aspect-[3/4] overflow-hidden relative">
                <img 
                  src={fisher.image} 
                  alt={fisher.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-kfc-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 text-white/60 mb-1">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{fisher.village}</span>
                  </div>
                  <h3 className="text-2xl font-display text-white">{fisher.name}</h3>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                   <div className="bg-kfc-red/5 px-3 py-1 rounded-full flex items-center gap-2">
                     <ShieldCheck className="w-3 h-3 text-kfc-red" />
                     <span className="text-[10px] font-bold text-kfc-red uppercase tracking-tight">{fisher.experience} Experience</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <Star className="w-3 h-3 text-kfc-red fill-kfc-red" />
                     <span className="text-xs font-bold text-kfc-black">{fisher.impactScore}% impact</span>
                   </div>
                </div>
                <p className="text-sm text-kfc-black/60 font-light leading-relaxed mb-6 italic">
                  "{fisher.story}"
                </p>
                <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] font-bold uppercase text-kfc-black/40">Verified Keeper</span>
                   </div>
                   <Heart className="w-5 h-5 text-kfc-red/20 group-hover:text-kfc-red group-hover:fill-kfc-red transition-all cursor-pointer" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Philosophy Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
           <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-display text-kfc-red leading-tight uppercase">Why the Source <br/> Matters to Us.</h2>
              <div className="space-y-6">
                 {[
                   {
                     icon: <Waves className="w-6 h-6" />,
                     title: "Cyclical Harvesting",
                     text: "Our fishermen follow the lunar cycles, allowing the lake's ecosystem to breathe and rest during key breeding seasons."
                   },
                   {
                     icon: <ShieldCheck className="w-6 h-6" />,
                     title: "Ethical Pricing",
                     text: "OmenaExpress eliminates predatory middlemen, ensuring 30% more revenue goes directly into the hands of Mbita and Dunga families."
                   },
                   {
                     icon: <Heart className="w-6 h-6" />,
                     title: "Local Heritage",
                     text: "We don't just sell fish; we preserve the recipes and techniques passed down through generations of lakeside communities."
                   }
                 ].map((item, idx) => (
                   <div key={idx} className="flex gap-4 p-6 rounded-3xl bg-white border border-black/5 shadow-sm">
                      <div className="w-12 h-12 bg-kfc-red/5 rounded-2xl flex items-center justify-center text-kfc-red flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-kfc-black uppercase tracking-tight mb-1">{item.title}</h4>
                        <p className="text-sm text-kfc-black/60 font-light leading-relaxed">{item.text}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="relative">
              <div className="aspect-square rounded-[60px] overflow-hidden shadow-2xl skew-y-1">
                 <img 
                    src="https://images.pexels.com/photos/15397941/pexels-photo-15397941.jpeg" 
                    alt="Lake Victoria Sunrise" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                 />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-kfc-black text-kfc-white p-10 rounded-[40px] shadow-2xl max-w-xs border border-white/10">
                 <Fish className="w-10 h-10 text-kfc-red mb-4" />
                 <p className="text-sm font-light leading-relaxed">
                   "The Lake gives to those who know how to ask. Respect the water, and it feeds your children."
                 </p>
                 <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-kfc-red">Our Promise</p>
                    <p className="text-xs font-medium">100% Lake Victoria Sourced</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
