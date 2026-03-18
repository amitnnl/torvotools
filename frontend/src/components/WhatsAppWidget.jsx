import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const WhatsAppWidget = () => {
    const { settings } = useSettings();
    const whatsappNumber = settings?.whatsapp_number || settings?.mobile_number;

    if (!whatsappNumber) return null;

    // Clean the number (remove spaces, symbols, etc.)
    const cleanNumber = whatsappNumber.replace(/\D/g, '');

    return (
        <a
            href={`https://wa.me/${cleanNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-[9999] bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_40px_rgba(37,211,102,0.4)] hover:scale-110 transition-all duration-300 flex items-center justify-center group overflow-hidden border-2 border-white/20"
            aria-label="Chat with us on WhatsApp"
        >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <MessageCircle className="h-7 w-7 relative z-10" />
            <span className="max-w-0 opacity-0 overflow-hidden group-hover:max-w-[150px] group-hover:opacity-100 group-hover:ml-3 transition-all duration-500 font-extrabold text-sm whitespace-nowrap relative z-10 uppercase tracking-tight">
                Chat With Us
            </span>
            {/* Decorative pulse effect */}
            <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366] opacity-20 pointer-events-none"></span>
        </a>
    );
};

export default WhatsAppWidget;
