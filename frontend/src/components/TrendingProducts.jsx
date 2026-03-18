import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import ProductCard from './ProductCard';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, LayoutGrid } from 'lucide-react';

const TrendingProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts({ limit: 8 });
                const data = response.data.data ? response.data.data : response.data;
                setProducts(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return null;

    return (
        <section className="bg-white section-padding relative">
            <div className="container-custom">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <LayoutGrid className="h-5 w-5 text-primary" />
                            <span className="text-slate-400 text-sm font-bold tracking-wide">Trending Now</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                            Best <span className="text-primary italic">Sellers.</span>
                        </h2>
                    </div>

                    <Button asChild className="btn-outline-sleek h-10 px-5">
                        <Link to="/products" className="flex items-center gap-3">
                            View All <ArrowRight className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.slice(0, 8).map(product => (
                        <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

            </div>

            {/* Full-Width CTA Section */}
            <div className="mt-24 w-full bg-slate-900 py-24 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-full bg-primary opacity-10 blur-[120px] rounded-full translate-x-1/2 group-hover:translate-x-1/3 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600 opacity-5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

                <div className="container-custom relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="space-y-6 text-center lg:text-left">
                            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                                Optimized for Individual <br className="hidden lg:block" /> and Fleet Procurement.
                            </h3>
                            <p className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl mx-auto lg:mx-0">
                                Whether you're a single professional or a large industrial firm, access our 24/7 logistics network with real-time tracking and verified technical support.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-5 shrink-0">
                            <Button asChild className="btn-primary-sleek h-11 px-12 shadow-primary/30 text-base">
                                <Link to="/register">Create Account</Link>
                            </Button>
                            <Button asChild variant="outline" className="h-11 px-4 rounded-sm border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm transition-all text-base">
                                <Link to="/contact">Contact Sales</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrendingProducts;
