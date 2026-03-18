import React from 'react';
import { ShieldCheck, BadgeIndianRupee, LifeBuoy, Truck, Settings, Zap } from "lucide-react";

const WhyChooseUs = () => {
  const features = [
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: "Quality Assurance",
      subtitle: "Certified Excellence",
      description: "Every unit undergoes a 50-point technical validation protocol to ensure operational integrity."
    },
    {
      icon: <BadgeIndianRupee className="h-10 w-10 text-primary" />,
      title: "Best Pricing",
      subtitle: "Direct Distribution",
      description: "Optimized procurement channels allowing for factory-direct competitive market rates."
    },
    {
      icon: <Settings className="h-10 w-10 text-primary" />,
      title: "Expert Support",
      subtitle: "Technical Command",
      description: "Direct access to our senior engineering support team for guidance and maintenance."
    },
    {
      icon: <Truck className="h-10 w-10 text-primary" />,
      title: "Fast Delivery",
      subtitle: "Logistics Priority",
      description: "High-priority industrial shipping with real-time tracking and dedicated logistics support."
    }
  ];

  return (
    <section className="bg-white section-padding text-slate-900 relative overflow-hidden border-y border-slate-100">
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary fill-primary" />
                <span className="text-primary text-sm font-bold tracking-wide">Our Standard</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-slate-900">
                Premium <br /> <span className="text-primary text-gradient">Quality.</span>
              </h2>
            </div>
            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-md">
              We provide the critical equipment necessary for high-stakes industrial operations, backed by a global network of manufacturers.
            </p>
            <div className="pt-8 border-t border-slate-100 grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-primary">15K+</p>
                <p className="text-xs font-semibold text-slate-400 tracking-wide">Curated Assets</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-primary">24/7</p>
                <p className="text-xs font-semibold text-slate-400 tracking-wide">Expert Support</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="premium-card p-10 space-y-6 group hover:bg-slate-900">
                <div className="bg-slate-50 w-20 h-20 flex items-center justify-center rounded border border-slate-100 group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-sm">
                  {React.cloneElement(feature.icon, {
                    className: `h-10 w-10 text-primary group-hover:text-white transition-colors`
                  })}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold tracking-wide text-primary group-hover:text-primary/60">{feature.subtitle}</p>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-white transition-colors">{feature.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed group-hover:text-slate-400 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
