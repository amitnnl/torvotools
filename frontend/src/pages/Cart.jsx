import React, { useContext, useState } from 'react';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Link } from 'react-router-dom';
import { verifyCoupon, IMAGE_BASE_URL } from '../services/api';
import { formatCurrency } from '../lib/utils';
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Truck, RefreshCw, ChevronLeft } from "lucide-react";

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, subtotal, total, coupon, discount, applyCoupon, removeCoupon } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const { settings } = useSettings();
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        setCouponError('');
        try {
            const response = await verifyCoupon(couponCode);
            applyCoupon(response.data);
            setCouponCode('');
        } catch (error) {
            setCouponError('Invalid code.');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center space-y-8 bg-gray-50 page-header-padding">
                <div className="bg-white p-12 text-center shadow-2xl border border-gray-100 max-w-lg w-full">
                    <div className="bg-gray-100 w-24 h-24 rounded-none flex items-center justify-center mx-auto mb-8 border border-dashed border-gray-300">
                        <ShoppingBag className="h-10 w-10 text-gray-300" />
                    </div>
                    <h1 className="text-4xl font-bold font-semibold tracking-tight text-secondary mb-4">Inventory Empty</h1>
                    <p className="text-gray-500 font-medium mb-8">Your procurement list is currently empty. Explore our catalog to add industrial equipment.</p>
                    <Button asChild size="lg" className="btn-primary-sleek w-full h-11">
                        <Link to="/products">Return to Catalog</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen page-header-padding">
            <div className="bg-slate-50 border-b border-slate-100 py-8 text-slate-900 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 translate-x-1/2"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-bold font-semibold tracking-tight uppercase leading-none">
                                Procurement <br /> <span className="text-primary">Summary</span>
                            </h1>
                            <p className="text-slate-400 font-bold tracking-wide text-xs">Review your equipment list before checkout</p>
                        </div>
                        <Button variant="outline" onClick={clearCart} className="btn-outline-sleek h-9">
                            <Trash2 className="h-4 w-4 mr-2" /> Clear All
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col xl:flex-row gap-12">
                    {/* Item List */}
                    <div className="flex-1 space-y-4">
                        <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b-2 border-gray-100 text-[10px] font-bold uppercase tracking-normal text-gray-400">
                            <div className="col-span-6">Equipment Details</div>
                            <div className="col-span-2 text-center">Price</div>
                            <div className="col-span-2 text-center">Quantity</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        {cart.map(item => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 items-center py-2 border-b border-gray-100 group">
                                <div className="col-span-6 flex items-center gap-6">
                                    <div className="w-20 h-20 bg-gray-50 border border-gray-100 p-2 shrink-0 overflow-hidden shadow-sm">
                                        <img
                                            src={item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${IMAGE_BASE_URL}${item.image_url}`) : 'https://placehold.co/150'}
                                            alt={item.name}
                                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Link to={`/product/${item.id}`} className="text-base font-bold font-semibold tracking-tight text-slate-900 hover:text-primary transition-colors">{item.name}</Link>
                                        <p className="text-[9px] font-bold text-slate-400 tracking-wide">{item.category_name || 'Industrial Tool'}</p>
                                        <button onClick={() => removeFromCart(item.id)} className="text-[9px] font-bold tracking-wide text-red-500 hover:underline flex items-center gap-1 mt-1">
                                            <Trash2 className="h-3 w-3" /> Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-2 text-center">
                                    <p className="font-bold text-slate-600 text-sm">{formatCurrency(item.price, settings?.currency_symbol, settings?.locale)}</p>
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    <div className="flex items-center border border-slate-100 overflow-hidden bg-white h-8">
                                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-2 py-1 hover:bg-slate-50 font-bold">-</button>
                                        <span className="w-8 text-center font-bold text-xs">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-slate-50 font-bold">+</button>
                                    </div>
                                </div>
                                <div className="col-span-2 text-right">
                                    <p className="text-base font-bold text-slate-900 tracking-tight">
                                        {formatCurrency(item.price * item.quantity, settings?.currency_symbol, settings?.locale)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <Link to="/products" className="inline-flex items-center text-[10px] font-bold tracking-wide text-primary hover:gap-3 transition-all pt-4">
                            <ChevronLeft className="h-4 w-4" /> Continue Procurement
                        </Link>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="w-full xl:w-96">
                        <div className="bg-slate-50 p-6 space-y-6 border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-bold font-semibold tracking-tight text-slate-900">Summary</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold tracking-wide text-slate-500">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal, settings?.currency_symbol, settings?.locale)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-xs font-bold tracking-wide text-primary">
                                        <span>Discount</span>
                                        <span>-{formatCurrency(discount, settings?.currency_symbol, settings?.locale)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs font-bold tracking-wide text-slate-500">
                                    <span>Logistics</span>
                                    <span className="text-green-600">Calculated later</span>
                                </div>
                                <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                                    <span className="text-sm font-bold font-semibold tracking-tight text-slate-900">Total Due</span>
                                    <span className="text-2xl font-bold tracking-tighter text-primary">
                                        {formatCurrency(total, settings?.currency_symbol, settings?.locale)}
                                    </span>
                                </div>
                            </div>

                            {/* Coupon Section */}
                            <div className="space-y-3 pt-4">
                                {!coupon ? (
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="COUPON CODE"
                                            className="w-full bg-white border border-slate-100 p-3 pl-12 text-[10px] font-bold tracking-wide focus:outline-none focus:border-primary transition-all"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-wide text-primary hover:text-slate-900"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-primary/5 p-3 border border-primary/20 flex justify-between items-center shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-primary" />
                                            <span className="text-[10px] font-bold tracking-wide">{coupon.code} Applied</span>
                                        </div>
                                        <button onClick={removeCoupon} className="text-[10px] font-bold uppercase text-red-500 hover:underline">Remove</button>
                                    </div>
                                )}
                            </div>

                            <Button asChild size="lg" className="w-full h-10 btn-primary-sleek">
                                <Link to="/checkout" className="text-white">
                                    Confirm & Proceed
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                                </Link>
                            </Button>

                            {/* Secure Badges */}
                            <div className="space-y-3 pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-4">
                                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                                    <p className="text-[8px] font-bold tracking-wide text-slate-400 leading-tight">Secure Professional Transaction Protocol</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
