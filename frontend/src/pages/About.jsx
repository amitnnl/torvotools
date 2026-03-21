import React, { useEffect } from 'react';
import { ShieldCheck, Target, Users, Zap, ChevronRight, Award, Globe, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";

const About = () => {
  const { settings } = useSettings();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen page-header-padding">
      {/* Cinematic Hero - LIGHT THEME */}
      <section className="relative h-[40vh] flex items-center overflow-hidden bg-slate-50 border-b border-slate-100">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-multiply grayscale"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent"></div>

        <div className="container-custom relative z-10">
          <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-12 bg-primary"></div>
              <span className="text-primary text-xs font-bold uppercase tracking-normal">The Torvo Legacy</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-semibold tracking-tight text-slate-900 leading-[0.9]">
              {settings?.about_hero_title ? (
                <span className="whitespace-pre-line">{settings.about_hero_title}</span>
              ) : (
                <>Engineering <br /> <span className="text-primary text-gradient">Reliability.</span></>
              )}
            </h1>
            <p className="text-slate-500 text-base font-medium max-w-xl leading-relaxed uppercase tracking-wide">
              {settings?.about_hero_subtitle || 'Defining the standard for industrial procurement through technical precision and direct manufacturing partnerships.'}
            </p>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold font-semibold tracking-tight text-slate-900 border-l-8 border-primary pl-8">
                  {settings?.about_narrative_title ? (
                    <span className="whitespace-pre-line">{settings.about_narrative_title}</span>
                  ) : (
                    <>Operational Excellence <br /> <span className="text-primary">Since 2015.</span></>
                  )}
                </h2>
              </div>
              <div className="space-y-6 text-slate-600 text-lg font-medium leading-relaxed">
                {settings?.about_content ? (
                  <p className="whitespace-pre-line">{settings.about_content}</p>
                ) : (
                  <>
                    <p>
                      TORVO TOOLS PVT. LTD. emerged from a critical need in the industrial sector for high-performance equipment backed by authentic technical support. We don't just distribute tools; we engineer the logistical backbone for heavy-duty professional environments.
                    </p>
                    <p>
                      Our ecosystem bridges the gap between the world's leading manufacturers and the local professionals who build our infrastructure. Every asset in our inventory is verified for operational integrity and factory-direct compliance.
                    </p>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="p-8 bg-slate-50 border border-slate-100 shadow-sm">
                  <p className="text-4xl font-bold text-slate-900 tracking-tighter">{settings?.about_stats_1_value || '500+'}</p>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wide mt-1">{settings?.about_stats_1_label || 'Authorized Centers'}</p>
                </div>
                <div className="p-8 bg-slate-50 border border-slate-100 shadow-sm">
                  <p className="text-4xl font-bold text-slate-900 tracking-tighter">{settings?.about_stats_2_value || '100%'}</p>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wide mt-1">{settings?.about_stats_2_label || 'Genuine Protocol'}</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-slate-100 overflow-hidden relative group shadow-2xl border-white border-[1px]">
                <img
                  src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=2070&auto=format&fit=crop"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 border-[20px] border-white/40 pointer-events-none"></div>
              </div>
              <div className="absolute -bottom-10 -left-10 bg-slate-950 p-10 hidden md:block shadow-2xl">
                <Factory className="h-9 w-12 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - LIGHT VERSION */}
      <section className="bg-slate-50 section-padding text-slate-900 overflow-hidden relative border-y border-slate-100">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>
        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
            <span className="text-primary text-[10px] font-bold uppercase tracking-normal">The Architecture of Trust</span>
            <h2 className="text-4xl md:text-5xl font-bold font-semibold tracking-tight text-slate-900">Corporate <span className="text-primary">Directives.</span></h2>
            <p className="text-slate-500 font-medium tracking-wide text-xs">Built on a foundation of industrial integrity and high-performance logistics.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Target />, title: "Precision Focus", desc: "Targeting the exact technical requirements of the professional engineering community." },
              { icon: <ShieldCheck />, title: "Asset Security", desc: "Rigorous quality control protocols ensuring that every tool meets industrial safety standards." },
              { icon: <Award />, title: "Global Authority", desc: "Direct partnerships with Makita, Bosch, and DeWalt ensuring tier-1 authorized supply." }
            ].map((v, i) => (
              <div key={i} className="bg-white border border-slate-100 p-10 space-y-6 hover:border-primary transition-all duration-500 group shadow-sm hover:shadow-2xl">
                <div className="bg-slate-50 w-16 h-11 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                  {React.cloneElement(v.icon, { className: "h-8 w-8" })}
                </div>
                <h3 className="text-2xl font-bold font-semibold tracking-tight text-slate-900 transition-colors">{v.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white relative">
        <div className="container-custom text-center space-y-10">
          <h2 className="text-3xl md:text-5xl font-bold font-semibold tracking-tight text-slate-900">Ready to Build <br /> <span className="text-primary text-outline-dark opacity-40">The Future?</span></h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
            <Button asChild className="h-11 px-12 btn-primary-sleek text-lg">
              <Link to="/register" className="flex items-center gap-3">Join Partner Network <ChevronRight className="h-5 w-5" /></Link>
            </Button>
            <Button asChild variant="outline" className="h-11 px-12 btn-outline-sleek text-lg">
              <Link to="/contact">Contact Technical HQ</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
