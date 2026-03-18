import React, { useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ArrowRight, Printer, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatCurrency } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';

const OrderSuccess = () => {
    const location = useLocation();
    const { order_id, total, email } = location.state || {};
    const { settings } = useSettings();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!order_id) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="bg-white min-h-screen page-header-padding flex items-center justify-center py-20">
            <div className="max-w-2xl w-full px-4">
                <div className="bg-slate-50 border border-slate-100 shadow-2xl p-8 md:p-16 text-center space-y-10 relative overflow-hidden">
                    {/* Background Decorative Element */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full"></div>

                    {/* Icon & Message */}
                    <div className="space-y-6 relative z-10">
                        <div className="bg-primary/10 w-24 h-24 rounded-none flex items-center justify-center mx-auto border-2 border-primary/20 scale-110">
                            <CheckCircle2 className="h-12 w-12 text-primary animate-bounce-short" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold font-semibold tracking-tighter text-slate-900 uppercase">
                                Procurement <br /> <span className="text-primary italic">Confirmed.</span>
                            </h1>
                            <p className="text-slate-600 font-medium text-lg">
                                Your industrial assets have been allocated and are entering the logistics queue.
                            </p>
                        </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 relative z-10">
                        <div className="bg-white p-6">
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Order ID</p>
                            <p className="text-xl font-bold text-slate-900 uppercase tracking-tight">#{order_id}</p>
                        </div>
                        <div className="bg-white p-6">
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Allocation Value</p>
                            <p className="text-xl font-bold text-primary tracking-tight">{formatCurrency(total, settings)}</p>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="space-y-6 relative z-10">
                        <div className="p-6 bg-slate-900 text-white space-y-4">
                            <p className="text-xs font-medium text-slate-300">
                                Tracking instructions have been dispatched to: <br />
                                <span className="text-primary font-bold">{email}</span>
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
                                <Button asChild className="flex-1 btn-primary-industrial h-11">
                                    <Link to={`/track-order?order_id=${order_id}&email=${email}`}>
                                        <Truck className="mr-2 h-4 w-4" /> Track Manifest
                                    </Link>
                                </Button>
                                <Button variant="outline" className="flex-1 h-11 border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={() => window.print()}>
                                    <Printer className="mr-2 h-4 w-4" /> Print Receipt
                                </Button>
                            </div>
                        </div>

                        <Link to="/products" className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-primary transition-all group">
                            Return to Global Inventory <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </Link>
                    </div>

                    {/* Footer Badges */}
                    <div className="pt-8 border-t border-slate-100 flex items-center justify-center gap-8 text-slate-500">
                        <Package className="h-5 w-5" />
                        <div className="h-6 w-px bg-slate-200"></div>
                        <p className="text-[8px] font-bold uppercase tracking-widest">Secure Logistics Protocol Active</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
