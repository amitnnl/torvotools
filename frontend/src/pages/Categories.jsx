import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, IMAGE_BASE_URL } from '../services/api';
import { Layers, ChevronRight, Box, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response.data || []);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="bg-white min-h-screen page-header-padding">
            {/* Hero Section */}
            <div className="bg-slate-50 border-b border-slate-100 py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 translate-x-1/2"></div>
                <div className="container-custom relative z-10">
                    <div className="max-w-4xl space-y-6">
                        <div className="flex items-center gap-3">
                            <Layers className="h-5 w-5 text-primary" />
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Operational Sectors</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold font-semibold tracking-tighter text-slate-900 leading-none uppercase">
                            Modular <br /> <span className="text-primary italic">Inventory.</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl leading-relaxed">
                            Access our full technical breadth organized by industrial application modules. Select a specialized sector to begin asset identification.
                        </p>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="container-custom py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {categories.map((category, index) => (
                        <Link
                            key={category.id}
                            to={`/categories/${category.id}`}
                            className="group bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden relative"
                        >
                            {/* Geometric Pattern Overlay */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -translate-y-1/2 translate-x-1/2 rotate-45 group-hover:bg-primary/10 transition-colors"></div>

                            <div className="aspect-[16/10] overflow-hidden transition-all duration-1000">
                                <img
                                    src={category.image_url ? (category.image_url.startsWith('http') ? category.image_url : `${IMAGE_BASE_URL}${category.image_url}`) : 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop'}
                                    alt={category.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none border-l-2 border-primary pl-2">Sector 0{index + 1}</span>
                                        <Box className="h-4 w-4 text-slate-200 group-hover:text-primary transition-colors" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">
                                        {category.name}
                                    </h3>
                                </div>

                                <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-2 italic">
                                    {category.description || `Technical procurement modules optimized for ${category.name} industrial requirements.`}
                                </p>

                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Identify Modules</span>
                                    <div className="bg-slate-50 h-8 w-8 flex items-center justify-center rounded-none group-hover:bg-primary transition-colors">
                                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-white" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-24 p-12 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="space-y-4 text-center md:text-left relative z-10">
                        <h2 className="text-3xl font-bold font-semibold tracking-tight leading-none">Can't identify the <span className="text-primary">specific asset?</span></h2>
                        <p className="text-slate-400 text-sm font-medium">Access our global unified inventory to search by model designation or technical SKU.</p>
                    </div>
                    <Button asChild className="btn-primary-industrial h-12 px-12 shrink-0 group shadow-2xl shadow-primary/20">
                        <Link to="/products">
                            Global Catalog <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Categories;
