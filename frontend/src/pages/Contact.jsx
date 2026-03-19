import React, { useEffect } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Clock, Globe, ChevronRight, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "../contexts/SettingsContext";

const Contact = () => {
  const { settings } = useSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen page-header-padding">
      {/* Dynamic Header - LIGHT THEME */}
      <section className="bg-slate-50 border-b border-slate-100 py-12 md:py-16 text-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-primary opacity-5 -skew-x-12 translate-x-1/2"></div>
        <div className="container-custom relative z-10 text-slate-900">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-12 bg-primary"></div>
              <span className="text-primary text-xs font-bold uppercase tracking-normal">Direct Link</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-semibold tracking-tight leading-none text-slate-900">
              Command <br /> <span className="text-primary text-gradient">Center.</span>
            </h1>
            <p className="text-slate-500 text-base font-medium leading-relaxed max-w-xl uppercase tracking-wide">
              Connect with our technical support team and senior logistics coordinators for immediate assistance.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-12 gap-12">

            {/* Contact Info Sidebar */}
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold font-semibold tracking-tight text-slate-900 border-l-8 border-primary pl-8">Operational <br /><span className="text-primary">Nodes.</span></h2>
                <p className="text-slate-500 font-medium leading-relaxed">Choose the relevant department for your specific inquiry to ensure priority processing.</p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: <Phone />, label: "Technical Support", val: settings?.mobile_number || "+91 (800) TORVO-PRO" },
                  { icon: <Mail />, label: "Direct Inquiries", val: settings?.email_id || "SUPPORT@TORVOTOOLS.COM" },
                  { icon: <MapPin />, label: "Regional Headquarters", val: settings?.contact_address || "123 INDUSTRIAL PARKWAY, SUITE 500, NEW DELHI, INDIA" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="bg-slate-50 border border-slate-100 p-5 h-11 w-16 shrink-0 flex items-center justify-center text-slate-900 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                      {React.cloneElement(item.icon, { className: "h-6 w-6" })}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold tracking-wide text-slate-400">{item.label}</p>
                      <p className="text-base font-medium font-semibold tracking-tight text-slate-900 leading-tight">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-slate-900 text-white relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-full bg-primary/10 -skew-x-12 translate-x-16 group-hover:translate-x-10 transition-transform duration-700"></div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold tracking-wide text-primary">Response Matrix</span>
                  </div>
                  <p className="font-bold font-semibold tracking-tight text-lg text-white">Standard Protocol: <br /> <span className="text-primary">24-Hour Resolution</span></p>
                  <p className="text-slate-400 text-xs font-medium">Emergency technical support available for authorized dealer network 24/7.</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-100 p-6 md:p-10 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                <div className="space-y-10">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold font-semibold tracking-tight text-slate-900">Technical Inquiry</h3>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">Formal Communication Channel</p>
                  </div>

                  <form className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold tracking-wide text-slate-400 pl-1">Authorized Name</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-100 p-4 font-bold focus:outline-none focus:border-primary transition-all uppercase text-sm text-slate-900 shadow-inner" placeholder="COMMANDER NAME..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold tracking-wide text-slate-400 pl-1">Return Email</label>
                        <input type="email" className="w-full bg-slate-50 border border-slate-100 p-4 font-bold focus:outline-none focus:border-primary transition-all text-sm text-slate-900 shadow-inner" placeholder="NAME@COMPANY.COM" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-wide text-slate-400 pl-1">Inquiry Vector</label>
                      <div className="relative">
                        <select className="w-full bg-slate-50 border border-slate-100 p-4 font-bold focus:outline-none focus:border-primary transition-all uppercase text-sm appearance-none text-slate-900 shadow-inner">
                          <option>Technical Support</option>
                          <option>Logistics & Delivery</option>
                          <option>Bulk Procurement</option>
                          <option>Partner Onboarding</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-wide text-slate-400 pl-1">Communication Body</label>
                      <textarea className="w-full bg-slate-50 border border-slate-100 p-6 font-bold focus:outline-none focus:border-primary transition-all min-h-[200px] uppercase text-sm text-slate-900 shadow-inner" placeholder="SPECIFY TECHNICAL REQUIREMENTS OR INQUIRY DETAILS..."></textarea>
                    </div>

                    <Button className="w-full h-11 btn-primary-sleek text-lg">
                      Transmit Inquiry
                      <Send className="ml-3 h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-slate-400">
                      <ShieldCheck className="h-4 w-4" />
                      <p className="text-[9px] font-bold tracking-wide leading-none">End-to-End Encrypted Professional Communication</p>
                    </div>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="full-width h-[350px] bg-slate-50 border-y border-slate-100 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 overflow-hidden relative group">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none transition-colors group-hover:bg-transparent"></div>
        <iframe
          src={settings?.google_map_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.123456789012!2d77.12345678901234!3d28.12345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDA3JzI0LjUiTiA3N8KwMDcnMjQuNSJF!5e0!3m2!1sen!2sin!4v1612345678901!5m2!1sen!2sin"}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </section>
    </div>
  );
};

export default Contact;
