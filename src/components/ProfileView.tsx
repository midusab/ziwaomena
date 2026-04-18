import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { User, MapPin, Phone, Save, X, Camera, ShieldCheck, Mail } from 'lucide-react';

interface ProfileViewProps {
  user: FirebaseUser;
  onClose: () => void;
}

export default function ProfileView({ user, onClose }: ProfileViewProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setDisplayName(data.displayName || user.displayName || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName,
        phone,
        address,
        updatedAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 pb-4">
        <h3 className="text-4xl font-display text-kfc-red mb-2">My Profile</h3>
        <p className="text-kfc-black/50 font-light text-sm uppercase tracking-widest">Lakeside identity Hub</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8 no-scrollbar">
        {/* Profile Avatar */}
        <div className="relative flex flex-col items-center justify-center py-6 group">
          <div className="relative">
            <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                alt={displayName} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-kfc-red text-kfc-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6 text-center">
            <h4 className="text-2xl font-display text-kfc-black">{displayName}</h4>
            <p className="text-kfc-black/40 text-xs font-mono lowercase">{user.email}</p>
          </div>
        </div>

        <form id="profile-form" onSubmit={handleUpdate} className="space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-kfc-black/40 ml-2">Full Name</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-black/5 text-kfc-black/20 group-focus-within:bg-kfc-red group-focus-within:text-kfc-white transition-all shadow-sm">
                <User className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex. Otieno Joseph"
                className="w-full pl-16 pr-4 h-16 bg-white/50 border border-black/5 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-kfc-red/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-kfc-black/40 ml-2">Phone Number</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-black/5 text-kfc-black/20 group-focus-within:bg-kfc-red group-focus-within:text-kfc-white transition-all shadow-sm">
                <Phone className="w-5 h-5" />
              </div>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="254 700 000 000"
                className="w-full pl-16 pr-4 h-16 bg-white/50 border border-black/5 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-kfc-red/20 transition-all font-mono font-medium"
              />
            </div>
          </div>

          {/* Default Address */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-kfc-black/40 ml-2">Default Hub Address</label>
            <div className="relative group">
              <div className="absolute left-4 top-4 w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-black/5 text-kfc-black/20 group-focus-within:bg-kfc-red group-focus-within:text-kfc-white transition-all shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <textarea 
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Milimani Rd, Kisumu Lakeside Apartment B4"
                className="w-full pl-16 pr-4 py-4 bg-white/50 border border-black/5 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-kfc-red/20 transition-all font-medium resize-none"
              />
            </div>
          </div>
        </form>

        <div className="bg-kfc-red/5 border border-kfc-red/10 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -top-2 -right-2 opacity-10">
            <ShieldCheck className="w-16 h-16 text-kfc-red" />
          </div>
          <p className="text-xs text-kfc-black/60 font-light leading-relaxed relative z-10">
            <span className="font-bold text-kfc-red uppercase tracking-widest block mb-1">Account Security</span>
            Your verified email <span className="font-mono text-kfc-red">{user.email}</span> is linked to your Google Account.
          </p>
        </div>
      </div>

      <div className="p-8 pt-4">
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Update Successful!</p>
            </motion.div>
          )}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-kfc-red/10 border border-kfc-red/20 rounded-2xl flex items-center gap-3"
            >
              <X className="w-5 h-5 text-kfc-red" />
              <p className="text-xs font-medium text-kfc-red">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          form="profile-form"
          type="submit"
          disabled={saving || loading}
          className="w-full py-5 bg-kfc-red text-kfc-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-kfc-black transition-all disabled:opacity-50 hover:-translate-y-1 uppercase tracking-widest"
        >
          {saving ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Save className="w-5 h-5" />
            </motion.div>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Lake Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}
