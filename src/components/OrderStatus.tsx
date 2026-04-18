import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Truck, CheckCircle2, Clock, MapPin, Search, ChevronRight, Navigation } from 'lucide-react';
import { Order } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { Map, Marker } from 'pigeon-maps';

interface OrderStatusProps {
  userId: string;
}

const NAIROBI_CENTER: [number, number] = [-1.2921, 36.8219];

const statusConfig = {
  'pending': {
    icon: <Clock className="w-5 h-5" />,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    label: 'Order Placed',
    desc: 'We have received your order and it will be processed shortly.'
  },
  'processing': {
    icon: <Search className="w-5 h-5" />,
    color: 'text-kfc-red',
    bg: 'bg-kfc-red/10',
    label: 'Preparing',
    desc: 'Our lakeside chefs are preparing your fresh Omena.'
  },
  'out-for-delivery': {
    icon: <Truck className="w-5 h-5" />,
    color: 'text-kfc-red',
    bg: 'bg-kfc-red/10',
    label: 'On the Way',
    desc: 'Your order is with our rider and heading to your location.'
  },
  'delivered': {
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'text-kfc-red',
    bg: 'bg-kfc-red/10',
    label: 'Delivered',
    desc: 'Enjoy your fresh lakeside specialty!'
  }
};

function RiderMap({ location }: { location?: { lat: number, lng: number } }) {
  const center: [number, number] = location ? [location.lat, location.lng] : NAIROBI_CENTER;
  
  return (
    <div className="h-48 w-full rounded-2xl overflow-hidden glass border border-white/20 mt-4 relative">
      <Map height={200} defaultCenter={center} center={center} defaultZoom={14}>
        <Marker 
          width={40} 
          anchor={center} 
          color="#a3e635"
        />
      </Map>
      <div className="absolute top-2 right-2 glass px-2 py-1 rounded-full text-[10px] font-bold text-kfc-black flex items-center gap-1">
        <div className="w-1.5 h-1.5 bg-kfc-red rounded-full animate-pulse" />
        Live Tracking
      </div>
    </div>
  );
}

export default function OrderStatus({ userId }: OrderStatusProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    if (!userId) return;

    const path = 'orders';
    const q = query(
      collection(db, path),
      where('uid', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toMillis() || Date.now()
      })) as Order[];
      
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const simulateRider = async (orderId: string) => {
    // In a real app, this would be the rider's app updating.
    // Here we just update the Firestore doc to trigger the real-time listener.
    const orderRef = doc(db, 'orders', orderId);
    
    // Simulate a starting point near Nairobi CBD
    const startLat = -1.2921;
    const startLng = 36.8219;
    
    await updateDoc(orderRef, {
      status: 'out-for-delivery',
      riderLocation: { lat: startLat, lng: startLng }
    });

    // Simple movement simulation
    let count = 0;
    const interval = setInterval(async () => {
      count++;
      if (count > 5) {
        clearInterval(interval);
        await updateDoc(orderRef, { status: 'delivered' });
        return;
      }
      
      await updateDoc(orderRef, {
        riderLocation: { 
          lat: startLat + (count * 0.002), 
          lng: startLng + (count * 0.002) 
        }
      });
    }, 3000);
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const pastOrders = orders.filter(o => o.status === 'delivered');
  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Package className="w-8 h-8 text-kfc-red opacity-20" />
        </motion.div>
        <p className="text-kfc-black/40 text-sm font-medium uppercase tracking-widest">Tracking your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12">
        <div className="w-24 h-24 bg-kfc-red/5 rounded-full flex items-center justify-center mb-6">
          <Search className="w-12 h-12 text-kfc-black/10" />
        </div>
        <h4 className="font-display text-2xl text-kfc-red mb-2 uppercase tracking-tight">No orders yet</h4>
        <p className="text-kfc-black/30 text-sm font-light max-w-[200px] mx-auto">
          Deep lake specialties are just a few taps away.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-kfc-black/5 rounded-2xl mb-4 border border-black/5">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
            activeTab === 'active' 
              ? 'bg-white text-kfc-red shadow-sm border border-black/5' 
              : 'text-kfc-black/40 hover:text-kfc-black'
          }`}
        >
          Active {activeOrders.length > 0 && `(${activeOrders.length})`}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
            activeTab === 'history' 
              ? 'bg-white text-kfc-red shadow-sm border border-black/5' 
              : 'text-kfc-black/40 hover:text-kfc-black'
          }`}
        >
          History
        </button>
      </div>

      <div className="space-y-6 flex-1">
        <AnimatePresence mode="popLayout">
          {displayedOrders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <Package className="w-12 h-12 text-kfc-black/5 mx-auto mb-4" />
              <p className="text-kfc-black/30 text-sm italic">Nothing in {activeTab}</p>
            </motion.div>
          ) : (
            displayedOrders.map((order, idx) => {
              const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
              const isOutForDelivery = order.status === 'out-for-delivery';
              const isDelivered = order.status === 'delivered';
              
              return (
                <motion.div
                  layout
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`glass-card rounded-[32px] overflow-hidden group border-2 ${
                    isDelivered ? 'border-transparent' : 'border-kfc-red/20'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.bg} ${config.color} relative overflow-hidden shadow-inner`}>
                          {config.icon}
                          {!isDelivered && (
                            <div className="absolute inset-0 bg-current opacity-10 animate-pulse" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] uppercase font-bold text-kfc-black/40 tracking-widest">#{order.id.slice(-6).toUpperCase()}</p>
                            <span className="w-1 h-1 rounded-full bg-black/10" />
                            <p className="text-[10px] text-kfc-black/30">{new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                          </div>
                          <h5 className="font-display text-2xl text-kfc-red leading-none mt-1">{config.label}</h5>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-kfc-red">Ksh {order.totalPrice}</p>
                        <div className="flex items-center gap-1 justify-end text-[9px] font-bold uppercase tracking-tight text-kfc-black/60">
                          <CheckCircle2 className="w-2 h-2 text-kfc-red" />
                          {order.paymentMethod === 'mpesa' ? 'M-Pesa STK' : 'Card'}
                        </div>
                      </div>
                    </div>

                    {!isDelivered && (
                      <div className="relative mb-8 px-2">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-black/5 -translate-y-1/2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ 
                               width: order.status === 'pending' ? '10%' : 
                                      order.status === 'processing' ? '40%' : 
                                      order.status === 'out-for-delivery' ? '70%' : '100%' 
                            }} 
                            className="h-full bg-kfc-red shadow-[0_0_15px_rgba(228,0,43,0.3)]" 
                          />
                        </div>
                        <div className="relative flex justify-between">
                          {['pending', 'processing', 'out-for-delivery', 'delivered'].map((s) => {
                            const statuses = ['pending', 'processing', 'out-for-delivery', 'delivered'];
                            const isCompleted = statuses.indexOf(order.status) >= statuses.indexOf(s);
                            const isCurrent = order.status === s;
                            return (
                              <div key={s} className="flex flex-col items-center">
                                <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-700 z-10 ${
                                  isCurrent ? 'bg-kfc-red border-kfc-red scale-125 ring-4 ring-kfc-red/20' : 
                                  isCompleted ? 'bg-kfc-red border-kfc-red' : 'bg-white border-black/10'
                                }`} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {isOutForDelivery && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-8"
                      >
                        <RiderMap location={order.riderLocation} />
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-8">
                      <div className="bg-white/30 p-4 rounded-2xl border border-white/20">
                        <p className="text-[9px] uppercase font-bold text-kfc-black/30 mb-2 tracking-widest">Delivery To</p>
                        <div className="flex items-start gap-2 text-kfc-black/60">
                          <MapPin className="w-3 h-3 text-kfc-red shrink-0 mt-0.5" />
                          <p className="text-[10px] font-medium leading-relaxed line-clamp-2">{order.deliveryAddress}</p>
                        </div>
                      </div>
                      <div className="bg-white/30 p-4 rounded-2xl border border-white/20">
                        <p className="text-[9px] uppercase font-bold text-kfc-black/30 mb-2 tracking-widest">
                          {isDelivered ? 'Delivered At' : 'ETA Estimate'}
                        </p>
                        <div className="flex items-center gap-2 text-kfc-black/60">
                          <Clock className="w-3 h-3 text-kfc-red shrink-0" />
                          <p className="text-[10px] font-medium uppercase tracking-tight">
                            {isDelivered 
                              ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : '25-45 mins'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[9px] uppercase font-bold text-kfc-black/30 px-2 tracking-widest leading-none">Your Selection</p>
                      <div className="flex flex-wrap gap-2 px-1">
                         {order.items.map((item, i) => (
                           <div key={i} className="flex items-center gap-2 bg-white/40 px-3 py-2 rounded-xl border border-white/40 shadow-sm">
                              <div className="w-6 h-6 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={OMENA_ITEMS.find(oi => oi.id === item.id)?.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <span className="text-[10px] font-bold text-kfc-black/70">{item.quantity}x <span className="font-light">{item.name}</span></span>
                           </div>
                         ))}
                      </div>
                    </div>

                    {!isDelivered && (
                      <div className={`mt-8 p-5 rounded-[24px] ${config.bg} border border-white/20 relative overflow-hidden`}>
                        <div className="absolute -top-2 -right-2 p-6 opacity-10 scale-150 rotate-12">
                          {config.icon}
                        </div>
                        <p className="text-xs font-light leading-relaxed text-kfc-black/70 relative z-10">
                          <span className="font-bold text-kfc-red block mb-1 uppercase tracking-widest text-[9px]">Live Status Update</span>
                          {config.desc}
                        </p>
                      </div>
                    )}

                    {order.status === 'processing' && (
                      <button 
                        onClick={() => simulateRider(order.id)}
                        className="mt-4 w-full py-4 bg-kfc-red text-kfc-white text-[11px] font-bold uppercase tracking-widest rounded-2xl border border-kfc-red/20 hover:bg-kfc-black transition-all flex items-center justify-center gap-3 shadow-lg"
                      >
                        <Navigation className="w-4 h-4 animate-bounce" />
                        Simulate Rider Dispatch
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { OMENA_ITEMS } from '../constants';
