import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getPage } from '../services/api';
import { ShieldCheck, FileText, AlertCircle } from 'lucide-react';

const DynamicPage = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            setError(false);
            try {
                // Determine what slug we are fetching.
                // If the route passes a explicit slug prop or if we extract it from useParams
                const currentSlug = slug || window.location.pathname.substring(1);
                const response = await getPage(currentSlug);
                
                if (response.data && (response.data.is_active == 1 || response.data.is_active === true)) {
                    setPage(response.data);
                    document.title = `${response.data.title} | ${import.meta.env.VITE_APP_NAME || 'Torvo Tools'}`;
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to load page:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">Retrieving Document...</p>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 container-custom">
                <div className="bg-red-50 p-6 rounded-full">
                    <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Document Not Found</h1>
                <p className="text-slate-500 max-w-md text-center">
                    The requested document module could not be located in the current database index. It may have been relocated or deactivated.
                </p>
                <button onClick={() => window.history.back()} className="btn-primary-sleek mt-4">Return to Safety</button>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen page-header-padding">
            {/* Header Area */}
            <section className="bg-slate-900 py-20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-20 -skew-x-12 translate-x-1/2"></div>
                <div className="container-custom relative z-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <FileText className="h-5 w-5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Official Documentation</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                            {page.title}
                        </h1>
                        {page.meta_description && (
                            <p className="text-gray-400 text-sm font-medium tracking-wide max-w-xl leading-relaxed">
                                {page.meta_description}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Document Content Area */}
            <main className="container-custom py-16">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/20"></div>
                    
                    <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100">
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Verified & Authored Digital Content</span>
                    </div>

                    {/* Render HTML content safely */}
                    <div 
                        className="whitespace-pre-wrap prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-2xl"
                        dangerouslySetInnerHTML={{ __html: page.content }} 
                    />
                </div>
            </main>
        </div>
    );
};

export default DynamicPage;
