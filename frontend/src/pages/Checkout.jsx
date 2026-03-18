import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { createOrder, IMAGE_BASE_URL, createPaymentIntent, getCredit, getProjects } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import { AuthContext } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';
import { Button } from "@/components/ui/button";
import {
    ShieldCheck,
    Truck,
    Lock,
    ChevronRight,
    MapPin,
    CreditCard,
    CheckCircle2,
    ArrowLeft,
    RefreshCw,
    Zap,
    Briefcase,
    Building2,
    HardHat
} from "lucide-react";

const Checkout = () => {
    const { cart, clearCart, total, subtotal, discount } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const { settings } = useSettings();
    const [shippingAddress, setShippingAddress] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [creditData, setCreditData] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchB2BData = async () => {
            if (user && (user.role === 'dealer' || user.role === 'admin')) {
                try {
                    const [creditRes, projectsRes] = await Promise.all([
                        getCredit(),
                        getProjects()
                    ]);
                    setCreditData(creditRes.data);
                    setProjects(projectsRes.data || []);
                } catch (err) {
                    console.error("Failed to fetch B2B context", err);
                }
            }
        };

        fetchB2BData();

        // Dynamically load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
    }, [user]);

    const handleRazorpayPayment = async () => {
        if (!shippingAddress.trim()) {
            setError('VALID SHIPPING ADDRESS IS REQUIRED FOR LOGISTICS CALCULATION.');
            return;
        }

        if (!user) {
            if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
                setError('FULL CONTACT DETAILS ARE REQUIRED FOR GUEST CHECKOUT.');
                return;
            }
        }

        setIsProcessing(true);
        setError('');

        try {
            // 1. Create order on server to get razorpay_order_id
            const response = await createPaymentIntent({
                items: cart,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone
            });
            const data = response.data;

            // 2. Configure Razorpay Options
            const options = {
                key: data.key_id,
                amount: data.amount,
                currency: data.currency,
                name: settings?.website_title || "Torvo Tools",
                description: "Equipment Procurement",
                image: settings?.logo_url ? `${IMAGE_BASE_URL}${settings.logo_url}` : null,
                order_id: data.order_id,
                handler: function (response) {
                    // Payment successful, verify on server
                    handlePlaceOrder(true, response.razorpay_payment_id);
                },
                prefill: {
                    name: user ? data.user_name : customerName,
                    email: user ? data.user_email : customerEmail,
                    contact: user ? data.user_phone : customerPhone
                },
                theme: {
                    color: "#0284c7",
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            setError(err.response?.data?.message || 'GATEWAY SYNCHRONIZATION FAILED.');
            setIsProcessing(false);
        }
    };

    const handlePlaceOrder = async (paymentConfirmed = false, paymentId = null) => {
        if (!shippingAddress.trim()) {
            setError('VALID SHIPPING ADDRESS IS REQUIRED.');
            return;
        }

        if (!user) {
            if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
                setError('FULL CONTACT DETAILS ARE REQUIRED FOR GUEST CHECKOUT.');
                return;
            }
        }

        if (paymentMethod === 'credit_invoice') {
            if (!user) {
                setError('CREDIT ACCOUNTS ARE FOR REGISTERED DEALERS ONLY.');
                return;
            }
            const available = parseFloat(creditData?.credit_limit || 0) - parseFloat(creditData?.current_balance || 0);
            if (total > available) {
                setError(`INSUFFICIENT CREDIT LIMIT. AVAILABLE: ${formatCurrency(available, settings)}`);
                return;
            }
        }

        setIsProcessing(true);
        setError('');

        try {
            const orderData = {
                items: cart,
                shipping_address: shippingAddress,
                payment_method: paymentMethod,
                payment_id: paymentId,
                project_id: selectedProjectId,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone
            };
            const response = await createOrder(orderData);
            clearCart();
            navigate('/order-success', {
                state: {
                    order_id: response.data.order_id,
                    total: total,
                    email: user ? user.email : customerEmail
                }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'TRANSACTION FAILED. PLEASE VERIFY CONNECTION TO COMMAND CENTER.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0 && !success) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 page-header-padding text-slate-900">
                <div className="bg-white p-12 text-center shadow-2xl border border-gray-100 max-w-lg w-full">
                    <h1 className="text-4xl font-bold font-semibold tracking-tight text-slate-900 mb-4">No Active Orders</h1>
                    <p className="text-gray-500 font-medium mb-8">You cannot proceed to checkout with an empty procurement list.</p>
                    <Button asChild size="lg" className="btn-primary-sleek w-full h-11">
                        <Link to="/products">Return to Catalog</Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-900 page-header-padding text-white text-center">
                <div className="space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="bg-primary/20 w-32 h-32 rounded-full flex items-center justify-center mx-auto border-4 border-primary">
                        <CheckCircle2 className="h-11 w-16 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-6xl font-bold font-semibold tracking-tight leading-none text-white">Order <br /> <span className="text-primary text-gradient">Secured.</span></h1>
                        <p className="text-gray-400 font-bold tracking-wide text-sm">{success}</p>
                    </div>
                    <p className="text-gray-500 max-w-md mx-auto uppercase text-[10px] tracking-widest font-bold">Redirecting to procurement archive for technical tracking...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen page-header-padding text-slate-900">
            {/* Header */}
            <div className="border-b border-slate-100 bg-slate-50">
                <div className="container-custom py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-normal text-slate-600">
                            <Link to="/cart" className="hover:text-primary transition-colors flex items-center gap-2">
                                <ArrowLeft className="h-3 w-3" /> Summary
                            </Link>
                            <ChevronRight className="h-3 w-3 opacity-30" />
                            <span className="text-slate-900">Checkout Terminal</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-wide text-primary">
                            <ShieldCheck className="h-4 w-4" /> SECURE RAZORPAY PROTOCOL
                        </div>
                    </div>
                </div>
            </div>

            <main className="container-custom py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">

                    {/* Input Section */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-4 border-l-8 border-primary pl-8">
                            <h2 className="text-5xl font-bold font-semibold tracking-tight text-slate-900 leading-none text-slate-900">Logistics & <br /> <span className="text-primary text-gradient">Delivery.</span></h2>
                            <p className="text-slate-600 font-medium">Identify the technical deployment destination.</p>
                        </div>

                        <div className="space-y-10">
                            {!user && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-2">
                                        <Zap className="h-5 w-5 text-primary" />
                                        <h3 className="text-sm font-bold tracking-wide uppercase">Guest Identity Protocols</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-600 tracking-wide uppercase">Full Technical Name</label>
                                            <input
                                                type="text"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                placeholder="ENTER NAME..."
                                                className="w-full bg-slate-50 border border-slate-100 p-4 text-xs font-bold focus:border-primary focus:outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-600 tracking-wide uppercase">Communication Node (Email)</label>
                                            <input
                                                type="email"
                                                value={customerEmail}
                                                onChange={(e) => setCustomerEmail(e.target.value)}
                                                placeholder="EMAIL@EXAMPLE.COM"
                                                className="w-full bg-slate-50 border border-slate-100 p-4 text-xs font-bold focus:border-primary focus:outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-bold text-slate-600 tracking-wide uppercase">Direct Link (Phone Number)</label>
                                            <input
                                                type="text"
                                                value={customerPhone}
                                                onChange={(e) => setCustomerPhone(e.target.value)}
                                                placeholder="+91 XXXXX XXXXX"
                                                className="w-full bg-slate-50 border border-slate-100 p-4 text-xs font-bold focus:border-primary focus:outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-600 tracking-wide">Providing contact details enables order tracking and digital invoice transmission.</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-900">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <h3 className="text-sm font-bold tracking-wide">Shipping Address</h3>
                                </div>
                                <textarea
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    placeholder="ENTER FULL BUSINESS OR WORKSHOP ADDRESS..."
                                    className="w-full bg-slate-50 border border-slate-100 p-6 font-bold text-sm focus:border-primary focus:outline-none transition-all min-h-[140px] uppercase tracking-wider shadow-inner"
                                />
                                {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 text-[10px] font-bold text-red-600 tracking-wide">{error}</div>}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-900">
                                    <HardHat className="h-5 w-5 text-primary" />
                                    <h3 className="text-sm font-bold tracking-wide">Technical Project Linkage</h3>
                                </div>
                                <select
                                    className="w-full bg-slate-50 border border-slate-100 p-6 font-bold text-xs tracking-wide focus:border-primary focus:outline-none appearance-none"
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    value={selectedProjectId || ""}
                                >
                                    <option value="">-- UNLINKED PROCUREMENT (GENERAL) --</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - {p.site_location || 'REMOTE'}</option>
                                    ))}
                                </select>
                                <p className="text-[8px] font-bold text-slate-600 tracking-wide px-1">Grouping procurement by project enables advanced inventory forecasting.</p>
                            </div>

                            <div className="space-y-6 pt-10 border-t border-slate-100">
                                <div className="flex items-center gap-3 text-slate-900">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    <h3 className="text-sm font-bold tracking-wide">Payment Matrix</h3>
                                </div>

                                {creditData && creditData.credit_limit > 0 && (
                                    <div className="bg-primary/5 border border-primary/10 p-4 mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-5 w-5 text-primary" />
                                            <div>
                                                <p className="text-[8px] font-bold tracking-wide text-primary">Active Corporate Credit</p>
                                                <p className="text-sm font-bold text-slate-900">CREDIT LIMIT: {formatCurrency(creditData.credit_limit, settings)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-bold tracking-wide text-slate-600">Available</p>
                                            <p className="text-sm font-bold text-slate-900">{formatCurrency(parseFloat(creditData.credit_limit) - parseFloat(creditData.current_balance), settings)}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setPaymentMethod('razorpay')}
                                        className={`flex items-center justify-between p-6 border transition-all ${paymentMethod === 'razorpay' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-primary'}`}
                                    >
                                        <div className="text-left space-y-1">
                                            <span className="text-xs font-bold tracking-wide block">Razorpay Node</span>
                                            <span className="text-[7px] font-bold tracking-wide opacity-60 block">Instant Digital Clearance</span>
                                        </div>
                                        <div className={`w-4 h-4 border rounded-full flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-primary' : 'border-slate-200'}`}>
                                            {paymentMethod === 'razorpay' && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                                        </div>
                                    </button>

                                    {user && creditData && creditData.credit_limit > 0 && (
                                        <button
                                            onClick={() => setPaymentMethod('credit_invoice')}
                                            className={`flex items-center justify-between p-6 border transition-all ${paymentMethod === 'credit_invoice' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-primary'}`}
                                        >
                                            <div className="text-left space-y-1">
                                                <span className="text-xs font-bold tracking-wide block">B2B Credit Invoice</span>
                                                <span className="text-[7px] font-bold tracking-wide opacity-60 block">Account Net-30/60</span>
                                            </div>
                                            <div className={`w-4 h-4 border rounded-full flex items-center justify-center ${paymentMethod === 'credit_invoice' ? 'border-primary' : 'border-slate-200'}`}>
                                                {paymentMethod === 'credit_invoice' && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                                            </div>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setPaymentMethod('pod')}
                                        className={`flex items-center justify-between p-6 border transition-all ${paymentMethod === 'pod' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-primary'}`}
                                    >
                                        <div className="text-left space-y-1">
                                            <span className="text-xs font-bold tracking-wide block">Pay on Delivery</span>
                                            <span className="text-[7px] font-bold tracking-wide opacity-60 block">Field Disbursement</span>
                                        </div>
                                        <div className={`w-4 h-4 border rounded-full flex items-center justify-center ${paymentMethod === 'pod' ? 'border-primary' : 'border-slate-200'}`}>
                                            {paymentMethod === 'pod' && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                                        </div>
                                    </button>
                                </div>

                                <div className="pt-6">
                                    <Button
                                        onClick={paymentMethod === 'razorpay' ? handleRazorpayPayment : () => handlePlaceOrder()}
                                        disabled={isProcessing}
                                        className="w-full h-20 btn-primary-sleek transition-all"
                                    >
                                        {isProcessing ? (
                                            <div className="flex items-center gap-3"><RefreshCw className="animate-spin" /> SYNCHRONIZING...</div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                {paymentMethod === 'razorpay' ? <Zap className="mr-3 fill-white text-white" /> : <Truck className="mr-3" />}
                                                Authorize Procurement
                                                <ChevronRight className="ml-3 h-6 w-6" />
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-5">
                        <div className="bg-slate-900 text-white p-10 space-y-10 shadow-2xl relative overflow-hidden text-white">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 -skew-x-12 translate-x-8 -translate-y-8"></div>
                            <h3 className="text-2xl font-bold font-semibold tracking-tight border-b border-white/5 pb-6 relative z-10 text-white">Order Manifest</h3>
                            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-6 group">
                                        <div className="w-16 h-11 bg-white border border-white/10 p-2 shrink-0">
                                            <img src={item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${IMAGE_BASE_URL}${item.image_url}`) : 'https://placehold.co/100'} alt={item.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-[10px] font-bold font-semibold tracking-tight leading-tight group-hover:text-primary transition-colors text-white">{item.name}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase">Qty: {item.quantity}</p>
                                            <p className="text-xs font-bold tracking-tight text-primary">{formatCurrency(item.price * item.quantity, settings?.currency_symbol, settings?.locale)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4 pt-10 border-t border-white/5 relative z-10">
                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-normal text-slate-400">
                                    <span>Net Valuation</span>
                                    <span>{formatCurrency(total, settings?.currency_symbol, settings?.locale)}</span>
                                </div>
                                <div className="flex justify-between items-end pt-4">
                                    <span className="text-base font-medium font-semibold tracking-tight text-white">Grand Total</span>
                                    <span className="text-4xl font-bold tracking-tighter text-primary">{formatCurrency(total, settings?.currency_symbol, settings?.locale)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pt-4 relative z-10">
                                <Lock className="h-4 w-4 text-primary" />
                                <p className="text-[8px] font-bold uppercase tracking-normal text-slate-600 leading-relaxed">System protected by Razorpay technical guard protocols.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
