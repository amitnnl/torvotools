import React, { useState, useEffect } from 'react';
import { trackOrder } from '../services/api';
import { formatCurrency } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from "@/components/ui/button";
import { Package, Search, MapPin, Calendar, CreditCard, CheckCircle2, Truck, Box, ShieldCheck, ArrowRight } from "lucide-react";

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { settings } = useSettings();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlOrderId = params.get('order_id');
        const urlEmail = params.get('email');

        if (urlOrderId && urlEmail) {
            setOrderId(urlOrderId);
            setEmail(urlEmail);
            // Auto-trigger fetch
            const autoTrack = async () => {
                setLoading(true);
                try {
                    const response = await trackOrder(urlOrderId, urlEmail);
                    setOrder(response.data);
                } catch (err) {
                    setError(err.response?.data?.message || 'Order not found. Please verify details.');
                } finally {
                    setLoading(false);
                }
            };
            autoTrack();
        }
    }, []);

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const response = await trackOrder(orderId, email);
            setOrder(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Order not found. Please verify details.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-amber-500';
            case 'processing': return 'bg-blue-500';
            case 'shipped': return 'bg-indigo-500';
            case 'delivered': return 'bg-green-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="bg-white min-h-screen page-header-padding">
            <div className="container-custom py-12">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-3">
                            <Truck className="h-6 w-6 text-primary" />
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Logistics Protocol</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold font-semibold tracking-tight text-slate-900 leading-none">
                            Track Your <span className="text-primary italic">Consignment.</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-lg mx-auto">
                            Enter your professional procurement ID and associated email to retrieve real-time operational status.
                        </p>
                    </div>

                    {/* Tracking Form */}
                    <div className="bg-slate-50 p-8 md:p-12 border border-slate-100 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -translate-y-1/2 translate-x-1/2 rounded-full"></div>

                        <form onSubmit={handleTrack} className="grid md:grid-cols-12 gap-6 relative z-10">
                            <div className="md:col-span-5 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order ID</label>
                                <div className="relative">
                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <input
                                        type="text"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        className="w-full bg-white border border-slate-200 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all text-sm uppercase"
                                        placeholder="E.G. 10254"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-5 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Associated Email</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white border border-slate-200 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all text-sm"
                                        placeholder="purchasing@company.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 flex items-end">
                                <Button type="submit" disabled={loading} className="w-full h-14 btn-primary-sleek">
                                    {loading ? 'Searching...' : 'Track'}
                                </Button>
                            </div>
                        </form>

                        {error && (
                            <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-4 text-xs font-bold text-red-600 tracking-wide animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Order Details Display */}
                    {order && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-white border border-slate-100 shadow-lg">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Order Status</p>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(order.status)}`}></div>
                                        <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{order.status}</h2>
                                    </div>
                                </div>
                                <div className="mt-6 md:mt-0 flex gap-8">
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Assets</p>
                                        <p className="text-xl font-bold text-slate-900">{formatCurrency(order.total_amount, settings)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">System Logged</p>
                                        <p className="text-xl font-bold text-slate-900">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-12 gap-8">
                                {/* Items List */}
                                <div className="lg:col-span-8 space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-4">Consignment Manifest</h3>
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-6 p-6 bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500">
                                            <div className="w-16 h-12 bg-white flex items-center justify-center p-2 border border-slate-100">
                                                <Box className="h-6 w-6 text-slate-200 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900 leading-tight">{item.product_name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900">{formatCurrency(item.price, settings)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Logistics Info */}
                                <div className="lg:col-span-4 space-y-8">
                                    <div className="bg-slate-900 text-white p-8 space-y-6">
                                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Destination Protocol</h3>
                                        <div className="flex gap-4">
                                            <MapPin className="h-5 w-5 text-primary shrink-0" />
                                            <p className="text-sm font-medium leading-relaxed text-slate-300 italic">
                                                {order.shipping_address}
                                            </p>
                                        </div>
                                        <div className="pt-6 border-t border-white/5 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="h-4 w-4 text-primary" />
                                                <p className="text-[10px] font-bold tracking-wide">Transit Professionalism Guaranteed</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 border border-slate-100 bg-white space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Need Modification?</h3>
                                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                            Our logistics command center is available 24/7 for urgent rerouting requests.
                                        </p>
                                        <Button variant="outline" className="w-full text-[10px] font-bold tracking-widest uppercase h-10 border-slate-200 hover:text-primary hover:border-primary">
                                            Contact Dispatch <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrackOrder;
