import { useEffect, useState } from "react";
import { getInventoryPrediction } from "../services/api";
import {
    Brain,
    AlertCircle,
    TrendingUp,
    Clock,
    ShieldAlert,
    ChevronRight,
    Activity,
    Zap,
    BarChart3,
    CalendarDays,
    RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useContext } from 'react';
import { CartContext } from "../contexts/CartContext";
import { toast } from "react-hot-toast";

const InventoryPrediction = () => {
    const { addToCart } = useContext(CartContext);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleProcure = (item) => {
        addToCart(item, item.recommended_quantity);
        toast.success(`SYSTEM: ₹{item.recommended_quantity} units of ${item.name} added to procurement queue.`);
    };

    useEffect(() => {
        fetchPredictions();
        window.scrollTo(0, 0);
    }, []);

    const fetchPredictions = async () => {
        setLoading(true);
        try {
            const response = await getInventoryPrediction();
            setPredictions(response.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskStyles = (risk) => {
        switch (risk) {
            case 'CRITICAL': return 'bg-red-500 text-white border-red-600';
            case 'WARNING': return 'bg-amber-500 text-white border-amber-600';
            default: return 'bg-green-500 text-white border-green-600';
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="bg-white min-h-screen page-header-padding">
            {/* AI Header */}
            <section className="bg-slate-900 py-24 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent animate-pulse"></div>
                </div>
                <div className="container-custom relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-primary">
                                <Brain className="h-6 w-6" />
                                <span className="text-[10px] font-bold uppercase tracking-normal">Predictive Logistics Core v1.0</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-bold font-semibold tracking-tight leading-none">
                                Demand <br /> <span className="text-primary text-gradient">Forecasting.</span>
                            </h1>
                            <p className="text-gray-400 text-sm font-bold tracking-wide max-w-xl leading-relaxed">
                                AI-driven analysis of burn rates, project timelines, and historical procurement to prevent operational downtime.
                            </p>
                        </div>
                        <Button onClick={fetchPredictions} variant="outline" className="h-11 px-4 rounded-none border border-primary/50 text-primary font-bold tracking-wide text-[10px] hover:bg-primary hover:text-white transition-all">
                            <RefreshCcw className="mr-2 h-4 w-4" /> Recompute Neural Model
                        </Button>
                    </div>
                </div>
            </section>

            <main className="container-custom py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Insights Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-slate-50 border border-slate-100 p-10 space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-900 font-semibold tracking-tight">Model Summary</h3>
                                <p className="text-[10px] font-bold text-slate-400 tracking-wide">Global Supply Chain Health</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-white p-6 border border-slate-100 shadow-sm">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-bold text-slate-400 tracking-wide">Critical Risks</p>
                                        <p className="text-4xl font-bold text-red-500">{predictions.filter(p => p.risk_level === 'CRITICAL').length}</p>
                                    </div>
                                    <ShieldAlert className="h-10 w-10 text-red-100" />
                                </div>
                                <div className="flex justify-between items-center bg-white p-6 border border-slate-100 shadow-sm">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-bold text-slate-400 tracking-wide">Neutral Nodes</p>
                                        <p className="text-4xl font-bold text-slate-900">{predictions.filter(p => p.risk_level === 'STABLE').length}</p>
                                    </div>
                                    <Activity className="h-10 w-10 text-slate-100" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-200">
                                <div className="flex items-start gap-4 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                                    <Zap className="h-5 w-5 text-primary mt-1" />
                                    <p className="text-[9px] font-bold text-slate-600 uppercase leading-relaxed tracking-wider">
                                        Neural engine detects a 14% increase in procurement frequency for heavy-duty drill bits across all active projects.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prediction Grid */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-6 uppercase tracking-normal font-bold text-[10px]">
                            <div className="flex gap-4">
                                <span className="text-slate-900">Ranked by Risk Level</span>
                                <span className="text-slate-400">Total Items: {predictions.length}</span>
                            </div>
                            <BarChart3 className="h-4 w-4 text-primary" />
                        </div>

                        {predictions.length > 0 ? (
                            <div className="space-y-6">
                                {predictions.map((p) => (
                                    <div key={p.product_id} className="group bg-white border border-slate-50 hover:border-primary transition-all duration-500 p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm hover:shadow-xl">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`px-2 py-1 text-[7px] font-bold tracking-wide border ${getRiskStyles(p.risk_level)}`}>
                                                    {p.risk_level}
                                                </div>
                                                <span className="text-slate-400 text-[8px] font-bold tracking-wide">ID: {p.product_id}</span>
                                            </div>
                                            <h4 className="text-2xl font-bold text-slate-900 font-semibold tracking-tight group-hover:text-primary transition-colors">{p.name}</h4>

                                            <div className="flex flex-wrap gap-8 pt-2">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-bold text-slate-400 tracking-wide">Daily Consumption</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-slate-900">{p.daily_burn_rate} Units / Day</p>
                                                        {p.surge_detected && (
                                                            <div className="flex items-center gap-1 text-[7px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 border border-primary/10">
                                                                <Zap className="h-2 w-2" /> Project Surge Multiplier
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-bold text-slate-400 tracking-wide">Confidence Score</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="bg-primary h-full" style={{ width: `${p.prediction_confidence}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-bold">{p.prediction_confidence}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-auto flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 bg-slate-50 md:bg-transparent p-6 md:p-0">
                                            <div className="text-center space-y-1">
                                                <p className="text-[8px] font-bold text-slate-400 tracking-wide">Stockout In</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-5xl font-bold tracking-tighter ${p.days_until_stockout < 15 ? 'text-red-500' : 'text-slate-900'}`}>{p.days_until_stockout}</span>
                                                    <span className="text-[10px] font-bold uppercase text-slate-400">Days</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase bg-primary/5 px-3 py-2 border border-primary/10">
                                                    <CalendarDays className="h-3 w-3" /> Reorder by {p.recommended_restock_date}
                                                </div>
                                                <Button
                                                    onClick={() => handleProcure(p)}
                                                    className="w-full h-10 rounded-none bg-slate-900 text-white text-[9px] font-bold tracking-wide hover:bg-primary transition-all"
                                                >
                                                    Procure {p.recommended_quantity} Units
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center border border-dashed border-slate-100 space-y-6 grayscale opacity-40">
                                <AlertCircle className="h-11 w-16" />
                                <h3 className="text-xl font-bold uppercase">Insufficient Data Points</h3>
                                <p className="text-[10px] font-bold tracking-wide">Neural model requires at least 90 days of operational volume.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InventoryPrediction;
