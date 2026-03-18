import React, { useContext, useEffect } from 'react';
import { WishlistContext } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import { ChevronRight, Heart, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Wishlist = () => {
    const { wishlist, loading, fetchWishlist } = useContext(WishlistContext);

    useEffect(() => {
        fetchWishlist();
        window.scrollTo(0, 0);
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="bg-white min-h-screen page-header-padding">
            {/* Header Area - LIGHT THEME */}
            <div className="bg-slate-50 border-b border-slate-100 py-8 text-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/4 h-full bg-primary opacity-5 -skew-x-12 translate-x-1/2"></div>
                <div className="container-custom relative z-10 text-slate-900">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-normal text-primary">
                            <Link to="/">Home</Link>
                            <ChevronRight className="h-3 w-3" />
                            <span>My Wishlist</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold font-semibold tracking-tight leading-none text-slate-900">
                            Saved <br /> <span className="text-primary text-gradient">Assets.</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-bold tracking-wide">Manage your preferred technical equipment</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-8">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-4 text-slate-900">
                        <Heart className="h-5 w-5 text-primary fill-primary" />
                        <p className="text-xs font-bold tracking-wide text-slate-400">
                            <span className="text-slate-900">{wishlist?.length || 0}</span> EQUIPMENT ARCHIVED
                        </p>
                    </div>
                </div>

                {wishlist?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {wishlist.map(product => (
                            <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 flex flex-col items-center justify-center border-4 border-dashed border-slate-50 space-y-6 bg-slate-50/30">
                        <div className="bg-white p-8 shadow-xl border border-slate-100 rounded-none">
                            <Heart className="h-9 w-12 text-slate-100" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold font-semibold tracking-tight text-slate-900">No Assets Saved</h3>
                            <p className="text-slate-400 font-medium tracking-wide text-[10px]">Your equipment shortlist is currently empty.</p>
                        </div>
                        <Button asChild size="lg" className="btn-primary-sleek">
                            <Link to="/products">Explore Full Catalog</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
