import React, { useEffect } from 'react';
import { Settings, Wrench, ShieldCheck, Zap, LifeBuoy, ChevronRight, BarChart3, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Services = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      icon: <Wrench />,
      title: "Maintenance Protocol",
      desc: "Comprehensive diagnostic and preventative maintenance for all industrial-grade power tools."
    },
    {
      icon: <ShieldCheck />,
      title: "Quality Certification",
      desc: "Official factory-standard validation and safety certification for professional equipment."
    },
    {
      icon: <Briefcase />,
      title: "Corporate Procurement",
      desc: "Dedicated account management for large-scale infrastructure and construction projects."
    },
    {
      icon: <BarChart3 />,
      title: "Inventory Analytics",
      desc: "Real-time tracking and lifecycle management for enterprise-level tool inventories."
    },
    {
      icon: <Users />,
      title: "On-Site Support",
      desc: "Technical field engineers available for direct consultation at active industrial sites."
    },
    {
      icon: <Zap />,
      title: "Emergency Repairs",
      desc: "High-priority rapid response logistics for critical equipment failures."
    }
  ];

  return (
    <div className="bg-white min-h-screen page-header-padding">
      {/* Visual Header - LIGHT THEME */}
      <section className="relative h-[35vh] flex items-center bg-slate-50 border-b border-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-multiply grayscale"></div>
        <div className="container-custom relative z-10 text-slate-900">
          <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-12 bg-primary"></div>
              <span className="text-primary text-xs font-bold uppercase tracking-normal">Service Logic</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-semibold tracking-tight text-slate-900 leading-[0.9]">
              Technical <br /> <span className="text-primary text-gradient">Support.</span>
            </h1>
            <p className="text-slate-500 text-base font-medium max-w-xl leading-relaxed uppercase tracking-wider">
              High-performance equipment requires high-precision technical care. We provide the expertise to keep you operational.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div key={i} className="bg-white border border-slate-100 p-8 space-y-4 hover:border-primary transition-all duration-500 hover:-translate-y-2 group shadow-sm hover:shadow-2xl">
                <div className="bg-slate-50 w-16 h-11 flex items-center justify-center text-slate-900 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-slate-100 shadow-inner">
                  {React.cloneElement(service.icon, { className: "h-8 w-8" })}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-semibold tracking-tight text-slate-900 group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{service.desc}</p>
                </div>
                <div className="pt-2 flex items-center gap-3 text-[10px] font-bold tracking-wide text-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all">
                  View Specifications <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action: Technical Command - LIGHT VERSION */}
      <section className="bg-slate-900 section-padding relative overflow-hidden text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 -skew-x-12 translate-x-1/2"></div>
        <div className="container-custom relative z-10 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold font-semibold tracking-tight text-white">Need Immediate <br /> <span className="text-primary">Engineering Support?</span></h2>
            <p className="text-slate-400 text-base font-medium max-w-2xl mx-auto uppercase tracking-wider leading-relaxed">Our technical command center is ready to assist with complex industrial challenges.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button asChild size="lg" className="h-11 px-12 btn-primary-sleek text-lg">
              <Link to="/contact">Request Technical Node</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-12 btn-outline-sleek text-lg border-white/20 text-white hover:bg-white hover:text-slate-900">
              <Link to="/about">Our Protocol</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
