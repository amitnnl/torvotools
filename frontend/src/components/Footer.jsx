import React from 'react';
import { Link } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ShieldCheck, ArrowUpRight, MessageCircle } from 'lucide-react';
import { IMAGE_BASE_URL } from "../services/api";

const Footer = () => {
  const { settings, loading } = useSettings();

  if (loading) return null;

  return (
    <footer className="bg-slate-950 text-slate-200 pt-24 pb-12 border-t border-slate-900">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-24 mb-16">

          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex flex-col leading-none group">
              <span className="text-2xl font-black tracking-tight text-white transition-colors">
                {settings?.website_title?.split(' ')[0] || "Viet"} <span className="text-primary">{settings?.website_title?.split(' ').slice(1).join(' ') || "Shop"}</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">{settings?.description || "Online Marketplace"}</span>
            </Link>
            <p className="text-slate-400 text-base font-medium leading-relaxed max-w-sm">
              {settings?.about_content || settings?.description || "Your destination for curated premium quality products, delivered with care and expertise."}
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Facebook />, link: settings?.social_facebook },
                { icon: <Twitter />, link: settings?.social_twitter },
                { icon: <Instagram />, link: settings?.social_instagram },
                { icon: <Linkedin />, link: settings?.social_linkedin }
              ].map((social, i) => (
                social.link && (
                  <a key={i} href={social.link} target="_blank" rel="noopener noreferrer" className="bg-slate-900/50 p-3 hover:bg-primary hover:text-white transition-all duration-500 border border-slate-800 rounded-xl">
                    {React.cloneElement(social.icon, { className: "h-5 w-5" })}
                  </a>
                )
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Discover</h3>
            <ul className="space-y-4">
              {['Home', 'Products', 'About', 'Contact', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <li key={link}>
                  <Link to={`/${link.toLowerCase() === 'home' ? '' : link.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-bold text-slate-400 hover:text-primary transition-colors flex items-center justify-between group">
                    {link} <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-y-1 translate-x-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Support Center</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-4 group cursor-pointer bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 hover:border-primary transition-all">
                <div className="bg-slate-950 p-3 border border-slate-800 rounded-xl shadow-sm text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Main Node</p>
                  <p className="text-sm font-bold text-slate-300 leading-snug">{settings?.contact_address || '123 Avenue, Premium Hub, India'}</p>
                </div>
              </div>
              <div className="flex gap-4 group cursor-pointer bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 hover:border-primary transition-all">
                <div className="bg-slate-950 p-3 border border-slate-800 rounded-xl shadow-sm text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Direct Link</p>
                  <p className="text-sm font-bold text-slate-300 leading-snug">{settings?.email_id || 'hello@store.com'}</p>
                </div>
              </div>
              <div className="flex gap-4 group cursor-pointer bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 hover:border-primary transition-all">
                <div className="bg-slate-950 p-3 border border-slate-800 rounded-xl shadow-sm text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phone Support</p>
                  <p className="text-sm font-bold text-slate-300 leading-snug">{settings?.mobile_number || '+91 0000000000'}</p>
                </div>
              </div>
              <div className="flex gap-4 group cursor-pointer bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 hover:border-[#25D366] transition-all">
                <div className="bg-slate-950 p-3 border border-slate-800 rounded-xl shadow-sm text-[#25D366]">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">WhatsApp Support</p>
                  <p className="text-sm font-bold text-slate-300 leading-snug">{settings?.whatsapp_number || settings?.mobile_number || '+91 0000000000'}</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        <div className="pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4 text-slate-400">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption Enabled</p>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {settings?.copyright_text || `© ${new Date().getFullYear()} Store. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
