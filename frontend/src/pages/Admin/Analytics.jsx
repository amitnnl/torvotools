import React, { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FileDown,
    TrendingUp,
    BarChart3,
    Users,
    Target,
    Zap,
    ShieldCheck,
    ChevronRight,
    Database,
    History
} from "lucide-react";
import { getAnalytics, getReportUrl } from "@/services/api";
import { useSettings } from '@/contexts/SettingsContext';
import { formatCurrency } from "@/lib/utils";

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { settings } = useSettings();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await getAnalytics();
                setData(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const handleExport = (type) => {
        const url = getReportUrl(type);
        window.open(url, '_blank');
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    const conversionRate = data.total_users > 0 ? (data.total_orders / data.total_users) * 100 : 0;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header / Export Control */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-normal">Business Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-bold font-semibold tracking-tight text-secondary leading-none">
                        Operational <br /> <span className="text-primary text-gradient">Analytics.</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <Button onClick={() => handleExport('sales')} variant="outline" className="btn-outline-sleek h-10 px-5 font-bold">
                        <FileDown className="h-4 w-4 mr-2" /> Sales Manifest
                    </Button>
                    <Button onClick={() => handleExport('inventory')} className="btn-primary-sleek h-10 px-5 shadow-2xl">
                        <Database className="h-4 w-4 mr-2" /> Inventory Audit
                    </Button>
                </div>
            </div>

            {/* Primary Performance Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Gross Valuation", val: formatCurrency(data.total_sales, settings?.currency_symbol, settings?.locale), icon: <TrendingUp />, sub: "Historical Throughput" },
                    { label: "Technical Conversion", val: `${conversionRate.toFixed(1)}%`, icon: <Target />, sub: "User Engagement Ratio" },
                    { label: "Partner Loyalty", val: `${data.repeat_purchase_rate}%`, icon: <Zap />, sub: "Recurrent Procurement" },
                    { label: "Growth Matrix", val: `+${data.new_customers_last_30_days}`, icon: <Users />, sub: "30-Day Acquisition" }
                ].map((m, i) => (
                    <Card key={i} className="rounded-none border-gray-100 shadow-sm group hover:border-primary/30 transition-all duration-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <p className="text-[9px] font-bold tracking-wide text-gray-400 group-hover:text-primary transition-colors">{m.label}</p>
                            <div className="p-2 bg-gray-50 text-secondary group-hover:bg-primary group-hover:text-white transition-all">
                                {React.cloneElement(m.icon, { className: "h-3 w-3" })}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tighter text-secondary">{m.val}</div>
                            <p className="text-[8px] font-bold text-gray-400 tracking-wide mt-1">{m.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Velocity Chart */}
            <Card className="rounded-none border-gray-100 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-gray-50 bg-gray-50/30 py-8 px-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-bold tracking-wide text-secondary flex items-center gap-3">
                                <History className="h-4 w-4 text-primary" /> Sales Velocity Matrix
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold tracking-wide text-gray-400">30-Day Operational Sales Trajectory</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 border border-green-100">
                            <ShieldCheck className="h-3 w-3" />
                            <span className="text-[8px] font-bold tracking-wide">Real-time Data Active</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-10 px-4">
                    <div className="h-[400px] w-full min-w-0">
                        <ResponsiveContainer width="99%" height={400}>
                            <AreaChart data={data.sales_over_time}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    fontWeight="900"
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    fontWeight="900"
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => formatCurrency(val, settings?.currency_symbol, settings?.locale)}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0', color: '#fff' }}
                                    itemStyle={{ color: '#0284c7', textTransform: 'uppercase', fontWeight: '900', fontSize: '10px' }}
                                    labelStyle={{ color: '#64748b', fontWeight: '900', marginBottom: '4px', fontSize: '10px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="daily_sales"
                                    stroke="#0284c7"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Asset Performance Grid */}
            <div className="grid md:grid-cols-2 gap-10">
                <Card className="rounded-none border-gray-100 shadow-lg">
                    <CardHeader className="border-b border-gray-50"><CardTitle className="text-xs font-bold tracking-wide text-secondary">High-Velocity Modules</CardTitle></CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {data.top_selling_products.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 group hover:bg-primary transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-bold text-gray-200 group-hover:text-white/20 transition-colors">0{i + 1}</span>
                                    <p className="text-[11px] font-bold uppercase tracking-tight text-secondary group-hover:text-white">{p.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-primary group-hover:text-white">{p.total_quantity_sold} Units</p>
                                    <p className="text-[8px] font-bold text-gray-400 tracking-wide group-hover:text-white/60">Dispatched</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-none border-gray-100 shadow-lg">
                    <CardHeader className="border-b border-gray-50"><CardTitle className="text-xs font-bold tracking-wide text-secondary">Procurement Frequency</CardTitle></CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {data.most_ordered_products.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 group hover:bg-slate-900 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-bold text-gray-200 group-hover:text-white/20 transition-colors">0{i + 1}</span>
                                    <p className="text-[11px] font-bold uppercase tracking-tight text-secondary group-hover:text-white">{p.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-primary group-hover:text-primary">{p.total_orders_count} Orders</p>
                                    <p className="text-[8px] font-bold text-gray-400 tracking-wide group-hover:text-gray-500 text-white/60">Logic Match</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
