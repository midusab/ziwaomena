import { motion } from 'motion/react';
import { Phone } from 'lucide-react';

export default function WhatsAppButton() {
  const openWhatsApp = () => {
    // Standard WhatsApp URL for a Kenyan number (mocking one here)
    const phoneNumber = '254700000000'; 
    const message = 'Hello OmenaExpress! I would like to inquire about...';
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={openWhatsApp}
      className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-[#25D366] text-white rounded-[22px] flex items-center justify-center shadow-xl hover:shadow-[0_10px_25px_rgba(37,211,102,0.4)] transition-all"
      title="Chat on WhatsApp"
    >
      <Phone className="w-6 h-6 fill-white" />
    </motion.button>
  );
}
