import { useEffect, useState } from "react";
import { getRfqs } from "../services/api";
import { useSettings } from "../contexts/SettingsContext";
import { FileText, Clock, ChevronRight, CheckCircle2, AlertCircle, Search, MessageSquare, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import React from 'react';
import { generateQuotePDF } from "../lib/pdfGenerator";

const MyRfqs = () => {
   const [rfqs, setRfqs] = useState([]);
   const [loading, setLoading] = useState(true);
   const { settings } = useSettings();

   useEffect(() => {
      const fetchRfqs = async () => {
         try {
            const response = await getRfqs();
            setRfqs(response.data || []);
         } catch (err) {
            console.error(err);
         } finally {
            setLoading(false);
         }
      };
      fetchRfqs();
      window.scrollTo(0, 0);
   }, []);

   if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

   const getStatusBadge = (status) => {
      const s = status.toLowerCase();
      if (s === 'quoted') return <span className="bg-green-500 text-white text-[9px] font-bold tracking-wide px-3 py-1 flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Quotation Issued</span>;
      if (s === 'pending') return <span className="bg-primary text-white text-[9px] font-bold tracking-wide px-3 py-1 flex items-center gap-2"><Clock className="h-3 w-3" /> Awaiting Review</span>;
      return <span className="bg-slate-900 text-white text-[9px] font-bold tracking-wide px-3 py-1 flex items-center gap-2"><AlertCircle className="h-3 w-3" /> {status}</span>;
   };

   return (
      <div className="bg-white min-h-screen page-header-padding">
         {/* Visual Header - LIGHT THEME */}
         <section className="bg-slate-50 border-b border-slate-100 py-20 text-slate-900 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 translate-x-1/2"></div>
            <div className="container-custom relative z-10 text-slate-900">
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="h-[2px] w-12 bg-primary"></div>
                     <span className="text-primary text-xs font-bold uppercase tracking-normal">Quote Command</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-bold font-semibold tracking-tight leading-none text-slate-900">
                     Technical <br /> <span className="text-primary text-gradient">Inquiries.</span>
                  </h1>
                  <p className="text-slate-500 text-base font-medium max-w-2xl leading-relaxed tracking-wide">
                     Review and manage your custom equipment quotations and large-scale industrial project inquiries.
                  </p>
               </div>
            </div>
         </section>

         <section className="section-padding">
            <div className="container-custom">
               {rfqs.length > 0 ? (
                  <div className="space-y-8">
                     <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                        <div className="flex items-center gap-4 text-slate-900">
                           <FileText className="h-5 w-5 text-primary" />
                           <p className="text-[10px] font-bold tracking-wide text-slate-400">{rfqs.length} Custom RFQs Active</p>
                        </div>
                     </div>

                     <div className="grid gap-6">
                        {rfqs.map((rfq) => (
                           <div key={rfq.id} className="group bg-white border border-slate-100 p-8 md:p-12 hover:border-primary transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-2xl">
                              <div className="absolute top-0 left-0 w-1 h-0 bg-primary group-hover:h-full transition-all duration-500"></div>

                              <div className="flex flex-col lg:flex-row justify-between gap-12">
                                 <div className="space-y-8 flex-1 text-slate-900">
                                    <div className="flex flex-wrap items-center gap-8">
                                       <div className="space-y-1">
                                          <p className="text-[9px] font-bold tracking-wide text-slate-400">Request Token</p>
                                          <p className="text-base font-medium font-semibold tracking-tight text-slate-900">#TRV-RFQ-{rfq.id}</p>
                                       </div>
                                       <div className="h-8 w-[1px] bg-slate-100 hidden md:block"></div>
                                       <div className="space-y-1">
                                          <p className="text-[9px] font-bold tracking-wide text-slate-400">Creation Date</p>
                                          <p className="text-sm font-bold text-slate-700 uppercase">{new Date(rfq.created_at).toLocaleDateString()}</p>
                                       </div>
                                       <div className="h-8 w-[1px] bg-slate-100 hidden md:block"></div>
                                       <div className="space-y-1">
                                          <p className="text-[9px] font-bold tracking-wide text-slate-400">Current Node</p>
                                          <div>{getStatusBadge(rfq.status || 'Pending')}</div>
                                       </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-slate-50">
                                       <div className="space-y-4">
                                          <div className="flex items-center gap-3">
                                             <Briefcase className="h-4 w-4 text-primary" />
                                             <p className="text-[10px] font-bold tracking-wide text-slate-900">Target Asset</p>
                                          </div>
                                          <div className="bg-slate-50 p-4 border border-slate-100 shadow-inner">
                                             <p className="text-sm font-bold font-semibold tracking-tight text-slate-900">{rfq.product_name}</p>
                                             <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Requested Quantity: {rfq.quantity} Units</p>
                                          </div>
                                       </div>
                                       <div className="space-y-4">
                                          <div className="flex items-center gap-3">
                                             <MessageSquare className="h-4 w-4 text-primary" />
                                             <p className="text-[10px] font-bold tracking-wide text-slate-900">Inquiry Context</p>
                                          </div>
                                          <p className="text-xs font-medium text-slate-500 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                                             "{rfq.message || 'No additional technical requirements specified.'}"
                                          </p>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="lg:w-64 flex flex-col justify-center gap-4 lg:pl-12 lg:border-l border-slate-100">
                                    <Button asChild className="h-10 btn-primary-sleek">
                                       <Link to={`/product/${rfq.product_id}`} className="flex items-center gap-3 text-white">
                                          Review Asset <ChevronRight className="h-4 w-4" />
                                       </Link>
                                    </Button>
                                    {rfq.status.toLowerCase() === 'quoted' && (
                                       <Button
                                          onClick={() => generateQuotePDF(rfq, settings)}
                                          variant="outline"
                                          className="h-10 btn-outline-sleek"
                                       >
                                          View Official Quote
                                       </Button>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               ) : (
                  <div className="py-32 flex flex-col items-center justify-center border border-dashed border-slate-100 space-y-6">
                     <div className="bg-slate-50 p-10 shadow-inner">
                        <Search className="h-11 w-16 text-slate-200" />
                     </div>
                     <div className="text-center space-y-2">
                        <h3 className="text-2xl font-bold font-semibold tracking-tight text-slate-900">No Inquiries Found</h3>
                        <p className="text-slate-400 font-medium tracking-wide text-[10px]">Your customized technical quotation history is currently clear.</p>
                     </div>
                     <Link to="/products" className="h-11 px-12 btn-primary-sleek flex items-center justify-center">Browse Inventory</Link>
                  </div>
               )}
            </div>
         </section>
      </div>
   );
};

export default MyRfqs;
