import { useEffect, useState } from "react";
import { getProcurementDashboard } from "../services/api";
import {
    BarChart3,
    TrendingUp,
    ShieldCheck,
    PieChart,
    Activity,
    IndianRupee,
    Briefcase,
    ChevronRight,
    RefreshCw,
    Trophy
} from "lucide-react";
import React from 'react';

const ProcurementAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await getProcurementDashboard();
                setData(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
        window.scrollTo(0, 0);
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    if (!data) return <div className="p-20 text-center tracking-wide text-slate-400 font-bold">No data clusters detected.</div>;

    return (
        <div className="bg-white min-h-screen page-header-padding">
            {/* Header: Command Override */}
            <section className="bg-secondary py-20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-10 -skew-x-12 translate-x-1/2"></div>
                <div className="container-custom relative z-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <Activity className="h-5 w-5" />
                            <span className="text-[10px] font-bold uppercase tracking-normal">Procurement Intelligence</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold font-semibold tracking-tight leading-none">
                            Asset <br /> <span className="text-primary text-gradient">Analytics.</span>
                        </h1>
                        <p className="text-gray-400 text-sm font-bold tracking-wide max-w-xl leading-relaxed">
                            Visualizing procurement conversion, asset health trajectories, and capital expenditure vectors.
                        </p>
                    </div>
                </div>
            </section>

            <main className="container-custom py-16 -mt-10 relative z-20">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-8 border border-slate-100 shadow-xl space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-primary/5 text-primary"><IndianRupee className="h-6 w-6" /></div>
                            <span className="text-[8px] font-bold tracking-wide text-gray-400">Total Capital Spent</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 tracking-tighter">₹{data.total_spend.toLocaleString()}</p>
                        <div className="h-1 w-full bg-gray-100"><div className="h-full bg-primary w-2/3"></div></div>
                    </div>

                    <div className="bg-white p-8 border border-slate-100 shadow-xl space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-green-50 text-green-500"><TrendingUp className="h-6 w-6" /></div>
                            <span className="text-[8px] font-bold tracking-wide text-gray-400">RFQ Conversion</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 tracking-tighter">{data.conversion_rate}%</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{data.rfq_metrics.approved} of {data.rfq_metrics.total} Approved</p>
                    </div>

                    <div className="bg-white p-8 border border-slate-100 shadow-xl space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-amber-50 text-amber-500"><Activity className="h-6 w-6" /></div>
                            <span className="text-[8px] font-bold tracking-wide text-gray-400">System Health</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 tracking-tighter">88.4%</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Operational Asset Uptime</p>
                    </div>

                    <div className="bg-white p-8 border border-slate-100 shadow-xl space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-slate-50 text-slate-900"><Trophy className="h-6 w-6" /></div>
                            <span className="text-[8px] font-bold tracking-wide text-gray-400">Market Ranking</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 tracking-tighter">Top 5%</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">In Regional Procurement</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-10 mt-16">
                    {/* Fleet Health Chart */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold font-semibold tracking-tight text-slate-900">Asset Lifecycle Distribution</h3>
                            <PieChart className="h-5 w-5 text-gray-300" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-10">
                                {data.fleet_stats.map((stat, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-bold tracking-wide text-gray-500">{stat.status} UNITS</span>
                                            <span className="text-sm font-bold text-slate-900">{stat.count}</span>
                                        </div>
                                        <div className="h-3 bg-gray-100">
                                            <div
                                                className={`h-full transition-all duration-1000 ${stat.status === 'active' ? 'bg-green-500' :
                                                        stat.status === 'maintenance' ? 'bg-amber-500' : 'bg-primary'
                                                    }`}
                                                style={{ width: `${(stat.count / (data.fleet_stats.reduce((a, b) => a + parseInt(b.count), 0))) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-slate-50 p-10 flex flex-col items-center justify-center text-center space-y-4 border border-slate-100">
                                <Activity className="h-9 w-12 text-primary opacity-20" />
                                <p className="text-[10px] font-bold uppercase tracking-normal text-slate-400">Aggregate Reliability Index</p>
                                <p className="text-6xl font-bold text-slate-900 tracking-tighter">0.94</p>
                                <p className="text-[9px] font-bold text-primary uppercase">Excellent Operational Efficiency</p>
                            </div>
                        </div>
                    </div>

                    {/* Spend Categories */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold font-semibold tracking-tight text-slate-900">Procurement Vectors</h3>
                            <BarChart3 className="h-5 w-5 text-gray-300" />
                        </div>
                        <div className="space-y-6">
                            {data.category_spend.map((cat, i) => (
                                <div key={i} className="p-6 bg-white border border-gray-100 shadow-sm hover:border-primary transition-all group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold tracking-wide text-slate-400 group-hover:text-primary transition-colors">{cat.category}</span>
                                        <span className="text-sm font-bold text-slate-900">₹{cat.spend.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1 bg-gray-50 overflow-hidden">
                                        <div className="h-full bg-slate-900 group-hover:bg-primary transition-all" style={{ width: '60%' }}></div>
                                    </div>
                                </div>
                            ))}
                            {data.category_spend.length === 0 && (
                                <div className="py-20 text-center border border-dashed border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                                    No financial expenditure identified.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProcurementAnalytics;
