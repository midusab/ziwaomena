/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, Minus, X, Fish, MapPin, Phone, ChefHat, Info, ShieldCheck, Truck, Star, LogIn, LogOut, User, Package, CreditCard, Wallet, ArrowRight, ArrowLeft, CheckCircle2, Search as SearchIcon, Leaf } from 'lucide-react';
import { OMENA_ITEMS, CATEGORIES, VENDORS } from './constants';
import { CartItem, OmenaCategory, Vendor } from './types';
import CookingAssistant from './components/CookingAssistant';
import OrderStatus from './components/OrderStatus';
import FishermenPage from './components/FishermenPage';
import ProfileView from './components/ProfileView';
import WhatsAppButton from './components/WhatsAppButton';
import { ReviewsSection, FAQSection, InquirySection, ZeroWastePage } from './components/ExperienceSections';
import { auth, db } from './firebase';
import axios from 'axios';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firebaseUtils';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<OmenaCategory | 'All'>('All');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [cartStep, setCartStep] = useState<'review' | 'checkout'>('review');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);

  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form state
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'stripe'>('mpesa');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [showFishermen, setShowFishermen] = useState(false);
  const [showZeroWaste, setShowZeroWaste] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      
      if (currentUser) {
        // Clear errors on success
        setAuthError(null);
        // Sync user profile
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              role: 'user',
              createdAt: serverTimestamp()
            });
          } else {
            // Load address and phone if they exist
            const data = userSnap.data();
            if (data.address) setAddress(data.address);
            if (data.phone) setPhone(data.phone);
          }
        } catch (error) {
          console.error("Profile sync error:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (isSigningIn) return;
    
    setAuthError(null);
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      
      let message = "Failed to sign in. Please try again.";
      if (error.code === 'auth/popup-blocked') {
        message = "Popup blocked! Please allow popups for this site in your browser settings.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        message = "Sign-in request cancelled. Please try again.";
      } else if (error.code === 'auth/internal-error') {
        message = "Internal auth error. Please try again or check your internet connection.";
      }
      
      setAuthError(message);
      // Auto-clear error after 5s
      setTimeout(() => setAuthError(null), 5000);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const filteredItems = useMemo(() => {
    let items = OMENA_ITEMS;
    
    if (selectedVendorId) {
      items = items.filter(item => item.vendorId === selectedVendorId);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'All') {
      items = items.filter(item => item.category === selectedCategory);
    }

    return items.filter(item => item.price >= minPrice && item.price <= maxPrice);
  }, [selectedCategory, selectedVendorId, searchQuery, minPrice, maxPrice]);

  const filteredVendors = useMemo(() => {
    if (!searchQuery) return VENDORS;
    const q = searchQuery.toLowerCase();
    return VENDORS.filter(v => 
      v.name.toLowerCase().includes(q) || 
      v.description.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const selectedVendor = useMemo(() => 
    VENDORS.find(v => v.id === selectedVendorId), 
  [selectedVendorId]);

  const addToCart = (item: (typeof OMENA_ITEMS)[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const handleReorder = (items: CartItem[]) => {
    setCart(prev => {
      const newCart = [...prev];
      items.forEach(item => {
        const index = newCart.findIndex(i => i.id === item.id);
        if (index > -1) {
          newCart[index] = { ...newCart[index], quantity: newCart[index].quantity + item.quantity };
        } else {
          newCart.push({ ...item });
        }
      });
      return newCart;
    });
    setIsOrdersOpen(false);
    setIsCartOpen(true);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const discountAmount = useMemo(() => {
    if (appliedPromo === 'LAKE20') {
      return Math.floor(cartTotal * 0.2);
    }
    return 0;
  }, [appliedPromo, cartTotal]);

  const deliveryFee = useMemo(() => {
    const uniqueVendorIds = new Set(cart.map(item => item.vendorId));
    return Array.from(uniqueVendorIds).reduce((sum, id) => {
      const vendor = VENDORS.find(v => v.id === id);
      return sum + (vendor?.deliveryFee || 0);
    }, 0);
  }, [cart]);

  const estimatedDeliveryTime = useMemo(() => {
    if (cart.length === 0) return '0 min';
    
    const uniqueVendorIds = Array.from(new Set(cart.map(item => item.vendorId)));
    const times = uniqueVendorIds.map(id => {
      const vendor = VENDORS.find(v => v.id === id);
      if (!vendor) return { min: 0, max: 0 };
      const match = vendor.deliveryTime.match(/(\d+)-(\d+)/);
      return match ? { min: parseInt(match[1]), max: parseInt(match[2]) } : { min: 0, max: 0 };
    });

    const maxMin = Math.max(...times.map(t => t.min));
    const maxMax = Math.max(...times.map(t => t.max));

    return `${maxMin}-${maxMax} mins`;
  }, [cart]);

  const handleApplyPromo = () => {
    setPromoError(null);
    if (promoInput.toUpperCase() === 'LAKE20') {
      setAppliedPromo('LAKE20');
      setPromoInput('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleLogin();
      return;
    }

    setIsOrdering(true);
    setIsProcessingPayment(true);
    const path = 'orders';
    
    try {
      const orderAmount = cartTotal + deliveryFee - discountAmount;

      // 1. Handle Payment via Backend
      if (paymentMethod === 'mpesa') {
        const mpesaRes = await axios.post('/api/mpesa/stkpush', {
          phone,
          amount: orderAmount,
          userId: user.uid
        });
        console.log("M-Pesa Response:", mpesaRes.data);
      } else {
        const stripeRes = await axios.post('/api/create-payment-intent', {
          amount: orderAmount
        });
        console.log("Stripe Client Secret Recieved:", stripeRes.data.clientSecret);
      }

      // 2. Save Order to Firestore
      const docRef = await addDoc(collection(db, path), {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice: orderAmount,
        status: 'pending',
        paymentMethod,
        customerName: user.displayName || 'Anonymous',
        customerPhone: phone,
        deliveryAddress: address,
        uid: user.uid,
        createdAt: serverTimestamp()
      });

      // 3. Trigger Email via Backend (Resend)
      try {
        const emailRes = await axios.post('/api/send-order-email', {
          email: user.email,
          orderDetails: {
            id: docRef.id.slice(-6),
            total: orderAmount,
            address
          }
        });
        
        if (emailRes.data.status === 'simulated') {
          console.info("Email notification simulated (RESEND_API_KEY not set).");
        } else {
          console.log("Order confirmation email sent successfully.");
        }
      } catch (emailErr) {
        console.warn("Email notification failed. Check server logs for details.");
      }

      setIsOrdering(false);
      setIsProcessingPayment(false);
      setOrderComplete(true);
      setCart([]);
      setAddress('');
      setPhone('');
      
      setTimeout(() => {
        setOrderComplete(false);
        setIsCartOpen(false);
      }, 3000);
    } catch (error) {
      setIsOrdering(false);
      setIsProcessingPayment(false);
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  if (showFishermen) {
    return (
      <FishermenPage onBack={() => setShowFishermen(false)} />
    );
  }

  if (showZeroWaste) {
    return (
      <ZeroWastePage onBack={() => setShowZeroWaste(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-kfc-cream selection:bg-kfc-red/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-kfc-red rounded-full flex items-center justify-center text-kfc-white shadow-lg">
              <Fish className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-display font-bold text-kfc-red tracking-tight">OmenaExpress</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowFishermen(true)}
                className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-kfc-black/40 hover:text-kfc-red transition-colors"
             >
                <ChefHat className="w-4 h-4" />
                Champions
             </button>
             <button 
                onClick={() => setShowZeroWaste(true)}
                className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-kfc-black/40 hover:text-kfc-red transition-colors"
             >
                <Leaf className="w-4 h-4" />
                Zero Waste
             </button>
            {isAuthLoading ? (
              <div className="w-8 h-8 rounded-full bg-kfc-red/20 animate-pulse" />
            ) : user ? (
              <>
                <button 
                  onClick={() => setIsOrdersOpen(true)}
                  className="p-2 hover:bg-white/40 rounded-full transition-colors group relative"
                  title="Track Orders"
                >
                  <Package className="w-6 h-6 text-kfc-red" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-kfc-red rounded-full shadow-sm animate-pulse" />
                </button>
                <div className="flex items-center gap-2 pr-4 border-r border-kfc-red/10 ml-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] uppercase font-bold text-kfc-red opacity-60">Welcome back</p>
                    <p className="text-xs font-medium text-kfc-red">{user.displayName?.split(' ')[0]}</p>
                  </div>
                  <button onClick={() => setIsProfileOpen(true)} title="Profile Hub" className="group relative">
                    <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-kfc-red/20 group-hover:border-kfc-red transition-colors" />
                    <div className="absolute inset-0 bg-kfc-red/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <User className="w-4 h-4 text-kfc-red" />
                    </div>
                  </button>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-kfc-red/10 rounded-full transition-colors group relative"
                  title="Sign Out"
                >
                  <LogOut className="w-6 h-6 text-kfc-red group-hover:scale-110 transition-transform" />
                </button>
              </>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 text-kfc-red text-sm font-bold uppercase tracking-wider hover:bg-white/40 px-4 py-2 rounded-full transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-white/40 rounded-full transition-colors group"
            >
              <ShoppingCart className="w-6 h-6 text-kfc-red" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-kfc-red text-kfc-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-in fade-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Search Header */}
      <section className="pt-24 px-6 max-w-7xl mx-auto md:hidden">
        <div className="relative group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-kfc-black/40 group-focus-within:text-kfc-red transition-colors" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cravings, vendors, dishes..." 
            className="w-full pl-12 pr-4 py-4 glass rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-kfc-red/20 transition-all border border-white/20"
          />
        </div>
      </section>

      {/* Promotion Slider */}
      <section className="pt-10 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
          <div className="min-w-[300px] md:min-w-[500px] aspect-[21/9] bg-gradient-to-br from-kfc-red to-kfc-black rounded-[32px] p-8 flex items-center justify-between snap-center relative overflow-hidden group">
            <div className="relative z-10">
               <span className="px-3 py-1 bg-white text-kfc-red text-[10px] font-bold uppercase rounded-full mb-4 inline-block shadow-sm">Flash Deal</span>
               <h4 className="text-kfc-white text-3xl font-display">20% OFF <br/>First Order</h4>
               <p className="text-kfc-white/60 text-xs mt-2 font-light">Use code: LAKE20 at checkout</p>
            </div>
            <Fish className="w-32 h-32 text-kfc-white opacity-10 absolute -right-4 -bottom-4 rotate-12 group-hover:scale-110 transition-transform" />
          </div>
          <div className="min-w-[300px] md:min-w-[500px] aspect-[21/9] bg-kfc-red/10 rounded-[32px] p-8 flex items-center justify-between snap-center relative overflow-hidden group border border-kfc-red/20">
            <div className="relative z-10">
               <span className="px-3 py-1 bg-kfc-red text-kfc-white text-[10px] font-bold uppercase rounded-full mb-4 inline-block">Free Delivery</span>
               <h4 className="text-kfc-black text-3xl font-display">Zero Fees on <br/>Selected Hubs</h4>
               <p className="text-kfc-black/40 text-xs mt-2 font-light">Valid for 3km radius from Kisumu CBD</p>
            </div>
            <Truck className="w-32 h-32 text-kfc-red opacity-10 absolute -right-4 -bottom-4 -rotate-12 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="pt-32 pb-10 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kfc-red/10 text-kfc-red text-xs font-semibold uppercase tracking-wider mb-6">
              <ChefHat className="w-3 h-3" />
              Lakeside's Finest Omena
            </div>
            <h2 className="text-6xl md:text-8xl font-display text-kfc-black leading-[0.9] mb-8">
              Fresh Omena <br />
              <span className="italic text-kfc-red">Grown in Nature.</span>
            </h2>
            <p className="text-kfc-black/70 text-lg max-w-lg mb-10 leading-relaxed font-light">
              Premium, sustainable Omena from Lake Victoria. We combine tradition with 
              modern lake-to-fork delivery, ensuring every bite is as fresh as the lake breeze.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#vendors" className="px-8 py-4 bg-kfc-red text-kfc-white rounded-2xl font-medium hover:bg-kfc-black transition-all shadow-xl hover:-translate-y-1 text-center flex-1 md:flex-none">
                Start Ordering
              </a>
              <div className="flex items-center gap-3 text-kfc-red font-medium">
                <span className="w-2 h-2 rounded-full bg-kfc-red animate-pulse" />
                Live delivery in Nairobi
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="aspect-square relative overflow-hidden rounded-[48px] glass-card p-4 skew-y-1 rotate-1 group">
               <img 
                src="https://picsum.photos/seed/lake-victoria-dish/800/800" 
                alt="Delicious Omena" 
                className="w-full h-full object-cover rounded-[36px] transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-kfc-black/40 to-transparent rounded-[36px]" />
               <div className="absolute bottom-12 left-12 text-kfc-white">
                  <p className="font-display text-3xl italic">Lakeside Specialty</p>
                  <p className="text-sm opacity-80 uppercase tracking-widest">Fresh harvest, expertly prepared</p>
               </div>
            </div>
            {/* Artistic Floating Element */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-kfc-red rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* Vendors Section */}
      {!selectedVendorId && (
        <section id="vendors" className="py-20 px-6 max-w-7xl mx-auto">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h3 className="text-4xl font-display text-kfc-black mb-4">Top Rated Hubs</h3>
              <p className="text-kfc-black/60 font-light max-w-md">Discover specialized lakeside kitchens near you.</p>
            </div>
            <div className="relative group hidden md:block w-full max-w-sm">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-kfc-black/40 group-focus-within:text-kfc-red transition-colors" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cravings, vendors..." 
                className="w-full pl-12 pr-4 py-3 glass rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-kfc-red/20 transition-all border border-white/20"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVendors.map((vendor, idx) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => {
                  setSelectedVendorId(vendor.id);
                  const menuSection = document.getElementById('menu');
                  menuSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="glass-card rounded-[40px] overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all duration-300"
              >
                <div className="aspect-[16/9] relative overflow-hidden m-2 rounded-[32px]">
                  <img 
                    src={vendor.image} 
                    alt={vendor.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-kfc-black">{vendor.rating}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 glass px-3 py-1 rounded-full text-[10px] font-bold text-kfc-black uppercase tracking-widest">
                    {vendor.category}
                  </div>
                </div>
                <div className="p-8">
                  <h4 className="text-2xl font-display font-bold text-kfc-black mb-2">{vendor.name}</h4>
                  <p className="text-kfc-black/50 text-sm font-light leading-relaxed mb-6 line-clamp-2">
                    {vendor.description}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-bold text-kfc-black/40 uppercase tracking-widest pt-4 border-t border-black/5">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3 h-3 text-kfc-red" />
                      {vendor.deliveryTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-3 h-3 text-kfc-red" />
                      Ksh {vendor.deliveryFee}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Menu Section */}
      <section id="menu" className="py-20 relative min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-16">
            <div className="flex-1">
              {selectedVendorId ? (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <button 
                    onClick={() => setSelectedVendorId(null)}
                    className="flex items-center gap-2 text-kfc-red font-bold text-xs uppercase tracking-widest hover:translate-x-1 transition-transform"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to All Hubs
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden glass border-2 border-white/40 shadow-xl">
                      <img src={selectedVendor?.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-display text-kfc-black leading-tight">{selectedVendor?.name}</h3>
                      <p className="text-kfc-black/60 font-light flex items-center gap-4 mt-2 text-sm uppercase tracking-wider">
                        <span className="flex items-center gap-1.5 font-bold text-kfc-black">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {selectedVendor?.rating}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-black/10" />
                        <span>{selectedVendor?.category} Specialist</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-5xl font-display text-kfc-black mb-4">Lakeside Harvest</h3>
                  <p className="text-kfc-black/60 font-light max-w-md leading-relaxed">
                    Custom-curated menu featuring premium catches and specialized preparations refined over generations.
                  </p>
                </>
              )}
            </div>
            
            <div className="flex flex-col gap-6 lg:items-end w-full lg:w-auto">
               {/* Search, Category and Price Filters Area */}
               <div className="flex flex-wrap items-center gap-6">
                  {/* Category Filter */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kfc-black/40 px-2 lg:text-right">Specialty Filter</p>
                    <div className="flex flex-wrap gap-2 glass p-1.5 rounded-2xl border border-white/20">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat as any)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                            selectedCategory === cat 
                              ? 'bg-kfc-red text-kfc-white shadow-lg' 
                              : 'text-kfc-black/60 hover:bg-white/40 hover:text-kfc-black'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kfc-black/40 px-2 lg:text-right">Price Ceiling</p>
                    <div className="flex items-center gap-4 glass px-4 py-2 rounded-2xl border border-white/20">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-kfc-black/30">Ksh</span>
                        <input 
                          type="number" 
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          className="w-16 bg-transparent text-sm font-bold text-kfc-red focus:outline-none focus:ring-0 appearance-none m-0"
                          min={0}
                        />
                      </div>
                      <div className="h-4 w-px bg-black/5" />
                      <button 
                        onClick={() => {
                          setMinPrice(0);
                          setMaxPrice(2000);
                          setSelectedCategory('All');
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-kfc-red hover:text-kfc-black transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card rounded-[40px] overflow-hidden group"
                >
                  <div className="aspect-[4/3] overflow-hidden relative m-2 rounded-[32px]">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-xs font-bold text-kfc-black">
                      Ksh {item.price}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex gap-2 mb-3">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] uppercase tracking-widest font-bold text-kfc-red">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h4 className="text-2xl font-display font-bold text-kfc-black mb-3">
                      {item.name}
                    </h4>
                    <p className="text-kfc-black/50 text-sm font-light leading-relaxed mb-8">
                      {item.description}
                    </p>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-full py-4 bg-kfc-red/10 text-kfc-red font-semibold rounded-2xl hover:bg-kfc-red hover:text-kfc-white transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                      Add to Order
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Order Status Drawer */}
      <AnimatePresence>
        {isOrdersOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrdersOpen(false)}
              className="fixed inset-0 bg-kfc-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-4 top-4 bottom-4 w-full max-w-md glass rounded-[40px] z-[70] flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-kfc-red" />
                  <h3 className="text-2xl font-display text-kfc-red uppercase tracking-tight">Order Tracking</h3>
                </div>
                <button onClick={() => setIsOrdersOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                  <X className="w-6 h-6 text-kfc-gray" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {user ? (
                  <OrderStatus userId={user.uid} onReorder={handleReorder} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10">
                    <LogIn className="w-16 h-16 text-kfc-red/20 mb-6" />
                    <p className="font-display text-2xl text-kfc-black/30 mb-2">Sign in to track orders</p>
                    <button onClick={handleLogin} className="text-kfc-red font-bold hover:underline">Click here to Login</button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-kfc-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-4 top-4 bottom-4 w-full max-w-md glass rounded-[40px] z-[70] flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {cartStep === 'checkout' && !orderComplete && (
                    <button 
                      onClick={() => setCartStep('review')}
                      className="p-2 -ml-2 hover:bg-white/40 rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-kfc-red" />
                    </button>
                  )}
                  <div className="bg-kfc-red/10 p-2 rounded-xl">
                    <ShoppingCart className="w-5 h-5 text-kfc-red" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display text-kfc-red leading-none">
                      {orderComplete ? 'Success' : cartStep === 'review' ? 'Your Basket' : 'Checkout'}
                    </h3>
                    {!orderComplete && (
                      <p className="text-[10px] uppercase font-bold text-kfc-black/30 tracking-widest mt-1">
                        {cartCount} {cartCount === 1 ? 'Item' : 'Items'} • Lake Victoria Fresh
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setTimeout(() => setCartStep('review'), 3000);
                  }} 
                  className="p-2 hover:bg-white/40 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/10 rounded-[48px] border-2 border-dashed border-white/20">
                    <div className="relative mb-8">
                      <Fish className="w-20 h-20 text-kfc-red/10 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-kfc-red opacity-40" />
                      </div>
                    </div>
                    <p className="font-display text-3xl text-kfc-red mb-3">Basket is empty</p>
                    <p className="text-kfc-black/40 font-light text-sm max-w-[200px] leading-relaxed">
                      Your journey to Lake Victoria's finest dishes starts with a click.
                    </p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-8 px-8 py-3 bg-kfc-red/10 text-kfc-red font-bold rounded-2xl hover:bg-kfc-red hover:text-kfc-cream transition-all"
                    >
                      Start Exploring
                    </button>
                  </div>
                ) : cartStep === 'review' && !orderComplete ? (
                  // Step 1: Review Items
                  <div className="space-y-10">
                    {/* Delivery Time Estimate Banner */}
                    <div className="bg-kfc-red/5 border border-kfc-red/10 p-4 rounded-3xl flex items-center gap-4">
                      <div className="w-10 h-10 bg-kfc-red/10 rounded-2xl flex items-center justify-center text-kfc-black shadow-sm">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-kfc-black uppercase tracking-tight">
                           {Array.from(new Set(cart.map(i => i.vendorId))).length > 1 ? 'Multi-Vendor Delivery' : 'Standard Delivery'}
                         </p>
                         <p className="text-[11px] text-kfc-black/60">Estimated arrival: <span className="font-bold text-kfc-black">{estimatedDeliveryTime}</span></p>
                      </div>
                    </div>

                    {Object.entries(
                      cart.reduce((groups, item) => {
                        const vendorId = item.vendorId;
                        if (!groups[vendorId]) groups[vendorId] = [];
                        groups[vendorId].push(item);
                        return groups;
                      }, {} as Record<string, CartItem[]>)
                    ).map(([vendorId, items]) => {
                      const vendor = VENDORS.find(v => v.id === vendorId);
                      return (
                        <div key={vendorId} className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                             <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-lg overflow-hidden flex-shrink-0">
                                 <img src={vendor?.image} alt="" className="w-full h-full object-cover" />
                               </div>
                               <span className="text-[10px] font-bold uppercase tracking-widest text-kfc-black/60">{vendor?.name}</span>
                             </div>
                             <span className="text-[9px] font-bold text-kfc-red bg-kfc-red/10 px-2 py-0.5 rounded-full uppercase">Vendor Match</span>
                          </div>
                          <div className="space-y-3">
                            {items.map(item => (
                              <motion.div 
                                layout
                                key={item.id} 
                                className="flex gap-4 group bg-white/40 p-3 rounded-[2rem] border border-white/20 hover:border-kfc-red/30 transition-all shadow-sm hover:shadow-md relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-kfc-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 glass relative z-10">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                </div>
                                <div className="flex-1 min-w-0 py-1 relative z-10">
                                  <div className="flex justify-between items-start">
                                    <h5 className="font-display text-base text-kfc-red leading-tight truncate pr-4">{item.name}</h5>
                                    <p className="text-kfc-black font-bold text-xs">Ksh {item.price * item.quantity}</p>
                                  </div>
                                  <p className="text-[10px] text-kfc-black/30 font-light mt-1 truncate uppercase tracking-widest">{OMENA_ITEMS.find(oi => oi.id === item.id)?.category}</p>
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center bg-white border border-black/5 rounded-full px-2 py-1 shadow-sm">
                                      <button 
                                        onClick={() => removeFromCart(item.id)} 
                                        className="p-1 hover:text-kfc-red transition-colors disabled:opacity-30"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-8 text-center text-xs font-bold font-mono text-kfc-red">{item.quantity}</span>
                                      <button 
                                        onClick={() => addToCart(item)} 
                                        className="p-1 hover:text-kfc-red transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <button 
                                      onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} 
                                      className="text-kfc-black/10 hover:text-kfc-red p-2 hover:bg-black/5 rounded-full transition-all"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : cartStep === 'checkout' && !orderComplete ? (
                  // Step 2: Checkout Form
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <h4 className="text-xl font-display text-kfc-red leading-none">Delivery Details</h4>
                        <p className="text-xs text-kfc-black/50 font-light">Where should we bring your lake feast?</p>
                     </div>
                     
                     <div className="grid grid-cols-1 gap-4">
                        <div className="relative group">
                          <div className={`absolute left-4 top-4 w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm ${address ? 'bg-kfc-red text-kfc-white' : 'bg-white text-kfc-black/20 border border-black/5'}`}>
                            <MapPin className="w-5 h-5" />
                          </div>
                          <textarea 
                            required 
                            placeholder="Delivery Address (e.g. Milimani Rd, House 4B)" 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            rows={3}
                            className="w-full pl-16 pr-4 py-4 bg-white border border-black/5 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-kfc-red/20 shadow-sm placeholder:text-kfc-black/30 resize-none font-medium"
                          />
                        </div>

                        <div className="relative group">
                          <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm ${phone ? 'bg-kfc-red text-kfc-white' : 'bg-white text-kfc-black/20 border border-black/5'}`}>
                            <Phone className="w-5 h-5" />
                          </div>
                          <input 
                            required 
                            type="tel" 
                            placeholder="M-Pesa Number (254...)" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-16 pr-4 h-16 bg-white border border-black/5 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-kfc-red/20 shadow-sm placeholder:text-kfc-black/30 font-medium font-mono"
                          />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <h4 className="text-[10px] uppercase font-bold tracking-widest text-kfc-black/40">Secure Payment</h4>
                          <ShieldCheck className="w-3 h-3 text-kfc-red" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('mpesa')}
                            className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all relative overflow-hidden group ${
                              paymentMethod === 'mpesa' 
                                ? 'bg-kfc-red/10 border-kfc-red/40 text-kfc-red shadow-md' 
                                : 'bg-white border-black/5 text-kfc-black/40 opacity-60'
                            }`}
                          >
                            {paymentMethod === 'mpesa' && <motion.div layoutId="payment-indicator" className="absolute top-3 right-3 w-2 h-2 rounded-full bg-kfc-red shadow-[0_0_10px_rgba(228,0,43,0.5)]" />}
                            <Wallet className={`w-6 h-6 ${paymentMethod === 'mpesa' ? 'text-kfc-red' : 'text-kfc-black/20'}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">M-Pesa STK</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('stripe')}
                            className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all relative overflow-hidden group ${
                              paymentMethod === 'stripe' 
                                ? 'bg-kfc-red/10 border-kfc-red/40 text-kfc-red shadow-md' 
                                : 'bg-white border-black/5 text-kfc-black/40 opacity-60'
                            }`}
                          >
                            {paymentMethod === 'stripe' && <motion.div layoutId="payment-indicator" className="absolute top-3 right-3 w-2 h-2 rounded-full bg-kfc-red shadow-[0_0_10px_rgba(228,0,43,0.5)]" />}
                            <CreditCard className={`w-6 h-6 ${paymentMethod === 'stripe' ? 'text-kfc-red' : 'text-kfc-black/20'}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Card / Stripe</span>
                          </button>
                        </div>
                     </div>
                  </div>
                ) : orderComplete && (
                  <div className="h-full flex items-center justify-center">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-kfc-red text-kfc-white p-10 rounded-[4rem] text-center space-y-6 shadow-2xl relative overflow-hidden mx-4 w-full"
                    >
                      <div className="absolute top-0 right-0 p-12 opacity-10">
                        <Package className="w-32 h-32" />
                      </div>
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-white animate-in zoom-in duration-500" />
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-display text-3xl mb-3">Order Confirmed!</h4>
                        <p className="text-sm opacity-80 font-light leading-relaxed">
                          Your lakeside feast is secured. Our chefs are firing up the pans for your order.
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setOrderComplete(false);
                          setIsCartOpen(false);
                          setIsOrdersOpen(true);
                          setCartStep('review');
                        }}
                        className="w-full py-5 bg-white text-kfc-red font-bold rounded-2xl hover:bg-kfc-cream transition-all flex items-center justify-center gap-3 group/track relative z-10 shadow-lg"
                      >
                        Track Order Live
                        <ArrowRight className="w-5 h-5 group-hover/track:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  </div>
                )}
              </div>

              {cart.length > 0 && !orderComplete && (
                <div className="p-8 glass shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t border-black/5 rounded-t-[40px]">
                  <div className="space-y-4 mb-8">
                    {/* Totals Section */}
                    {cartStep === 'review' && (
                       <div className="bg-kfc-red text-kfc-white rounded-[2.5rem] p-6 space-y-4 mb-6 relative overflow-hidden shadow-2xl">
                          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                             <ChefHat className="w-20 h-20" />
                          </div>
                          <div className="flex justify-between text-sm opacity-60 font-light">
                            <span>Subtotal</span>
                            <span className="font-mono">Ksh {cartTotal}</span>
                          </div>
                          <div className="flex justify-between text-sm opacity-60 font-light">
                            <span className="flex items-center gap-2">
                              Delivery
                              {new Set(cart.map(i => i.vendorId)).size > 1 && (
                                <span className="bg-white/10 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Multi-hub</span>
                              )}
                            </span>
                            <span className="font-mono">Ksh {deliveryFee}</span>
                          </div>
                          {appliedPromo && (
                             <div className="flex justify-between text-sm text-white font-bold">
                               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> {appliedPromo} Applied</span>
                               <span className="font-mono">- Ksh {discountAmount}</span>
                             </div>
                          )}
                          <div className="h-px bg-white/10 my-2" />
                          <div className="flex justify-between items-baseline">
                             <p className="text-xs font-bold uppercase tracking-widest opacity-40">Grand Total</p>
                             <p className="text-4xl font-display">Ksh {Math.max(0, cartTotal + deliveryFee - discountAmount)}</p>
                          </div>
                       </div>
                    )}

                    {!orderComplete && cartStep === 'review' && (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input 
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            placeholder="Promo Code"
                            className="w-full h-12 glass rounded-2xl px-4 text-xs focus:outline-none focus:ring-2 focus:ring-kfc-red/10 transition-all border border-black/5 placeholder:text-kfc-black/20"
                          />
                          {promoError && (
                            <p className="absolute -bottom-5 left-2 text-[9px] text-red-500 font-bold">{promoError}</p>
                          )}
                        </div>
                        <button 
                          onClick={handleApplyPromo}
                          className="px-6 h-12 bg-kfc-black/5 text-kfc-black text-xs font-bold rounded-2xl hover:bg-kfc-black hover:text-kfc-white transition-all border border-black/5"
                        >
                          Apply
                        </button>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                       {cartStep === 'review' ? (
                          <div className="flex flex-col">
                             <p className="text-[10px] text-kfc-black/40 font-bold uppercase tracking-widest mb-1">Items to review</p>
                             <p className="text-xl font-display text-kfc-red leading-none">{cartCount} Selected</p>
                          </div>
                       ) : (
                          <div className="flex flex-col">
                             <p className="text-[10px] text-kfc-black/40 font-bold uppercase tracking-widest mb-1">Final Amount</p>
                             <p className="text-xl font-display text-kfc-red leading-none">Ksh {Math.max(0, cartTotal + deliveryFee - discountAmount)}</p>
                          </div>
                       )}
                       
                       {cartStep === 'review' ? (
                          <button 
                            onClick={() => setCartStep('checkout')}
                            className="bg-kfc-red text-kfc-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 shadow-2xl hover:bg-kfc-black transition-all hover:-translate-y-1 active:translate-y-0 uppercase tracking-widest"
                          >
                            Go to Checkout
                            <ArrowRight className="w-5 h-5" />
                          </button>
                       ) : (
                          <button 
                            onClick={handlePlaceOrder}
                            disabled={isOrdering || isSigningIn || !address || !phone}
                            className="bg-kfc-red text-kfc-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 shadow-2xl hover:bg-kfc-black transition-all disabled:opacity-50 hover:-translate-y-1 active:translate-y-0 uppercase tracking-widest"
                          >
                            {isOrdering ? (
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="flex items-center gap-2">
                                <ChefHat className="w-5 h-5" />
                                <span>Placing Order...</span>
                              </motion.div>
                            ) : (
                              <>Confirm & Pay Now</>
                            )}
                          </button>
                       )}
                    </div>
                  </div>

                  {cartStep === 'checkout' && (
                    <div className="flex items-center gap-2 text-[9px] text-kfc-black/30 font-bold uppercase tracking-widest px-2">
                       <ShieldCheck className="w-3 h-3 text-kfc-red" />
                       Secure {paymentMethod.toUpperCase()} Checkout
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Experience Sections */}
      <ReviewsSection />
      <FAQSection />
      <InquirySection />

      {/* Footer */}
      <footer className="bg-kfc-black py-20 px-6 text-kfc-white relative overflow-hidden">
        <div className="absolute inset-0 stripes-red opacity-5" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 relative z-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6 text-kfc-red">
              <Fish className="w-8 h-8" />
              <h2 className="text-4xl font-display">OmenaExpress</h2>
            </div>
            <p className="text-kfc-white/60 max-w-sm font-light leading-relaxed">
              Kenya's first premium eco-conscious Omena delivery service. 
              We blend lake heritage with modern sustainability to bring you fish that feels good.
            </p>
          </div>
          <div>
            <h5 className="font-display text-xl mb-6 text-kfc-red">Ethos</h5>
            <ul className="space-y-4 text-kfc-white/60 text-sm font-light">
              <li><a href="#" className="hover:text-kfc-red transition-colors">Lake Conservation</a></li>
              <li>
                <button 
                  onClick={() => {
                    setShowFishermen(true);
                    window.scrollTo(0, 0);
                  }} 
                  className="hover:text-kfc-red transition-colors"
                >
                  Our Fishermen
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setShowZeroWaste(true);
                    window.scrollTo(0, 0);
                  }} 
                  className="hover:text-kfc-red transition-colors text-left"
                >
                  Zero-Waste Plastic
                </button>
              </li>
              <li><a href="#" className="hover:text-kfc-red transition-colors">Sourcing Map</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-display text-xl mb-6 text-kfc-red">Lake Hub</h5>
            <div className="space-y-4 text-kfc-white/60 text-sm font-light">
              <p>Lake Region, Kisumu</p>
              <p>+254 700 000 000</p>
              <p>hello@omenaexpress.com</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <p className="text-xs text-kfc-white/40 uppercase tracking-widest">© 2024 OmenaExpress Delivery. LAKE TO FORK.</p>
          <div className="flex gap-8 text-xs text-kfc-white/40 uppercase tracking-widest">
            <a href="#" className="hover:text-kfc-white transition-colors">Safety Records</a>
            <a href="#" className="hover:text-kfc-white transition-colors">Carbon Report</a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isProfileOpen && user && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-kfc-black/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-kfc-cream shadow-2xl flex flex-col h-full"
            >
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-black/5 hover:bg-kfc-red hover:text-kfc-white transition-all z-20 group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </button>
              
              <ProfileView user={user} onClose={() => setIsProfileOpen(false)} />

              <div className="p-8 border-t border-black/5 bg-white/50">
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full py-4 text-kfc-red font-bold flex items-center justify-center gap-2 hover:bg-kfc-red/5 rounded-2xl transition-all uppercase tracking-widest text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of Hub
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Elements */}
      <CookingAssistant />
      <WhatsAppButton />
    </div>
  );
}

