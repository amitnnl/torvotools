import React, { useEffect, useState } from 'react';
import {
    Activity,
    ArrowUpRight,
    IndianRupee,
    Package,
    Users,
    AlertTriangle,
    TrendingUp,
    BarChart3,
    ChevronRight,
    AlertCircle
} from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getAnalytics, getActivities } from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';
import { formatCurrency } from "../../lib/utils";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const NewDashboard = () => {
    const { settings } = useSettings();
    const [data, setData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 500);
        const fetchDashboardData = async () => {
            try {
                const [statsRes, activitiesRes] = await Promise.all([
                    getAnalytics(),
                    getActivities()
                ]);
                setData(statsRes.data);
                setActivities(activitiesRes.data || []);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <div className="h-96 flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    const stats = [
        { title: "Total Revenue", val: formatCurrency(data?.total_sales || 0, settings?.currency_symbol, settings?.locale), icon: <IndianRupee />, trend: "Operational Total" },
        { title: "Equipment Orders", val: data?.total_orders || 0, icon: <Package />, trend: "Active Transmissions" },
        { title: "Verified Partners", val: data?.total_users || 0, icon: <Users />, trend: "Authorized Network" },
        { title: "AOV", val: formatCurrency(data?.avg_order_value || 0, settings?.currency_symbol, settings?.locale), icon: <Activity />, trend: "Avg Procurement" },
    ];

    return (
        <div className="space-y-10">
            {/* Header Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold font-semibold tracking-tight text-slate-900">Operational <span className="text-primary">Intelligence.</span></h1>
                    <p className="text-[10px] font-bold uppercase tracking-normal text-slate-500">System State: Active // Last Sync: {new Date().toLocaleTimeString()}</p>
                </div>
                <div className="flex gap-4">
                    <Button asChild className="btn-primary-sleek h-9">
                        <Link to="/admin/orders" className="text-white">Order Logic <ChevronRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((s, i) => (
                    <Card key={i} className="premium-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-normal text-slate-400 group-hover:text-primary transition-colors">
                                {s.title}
                            </CardTitle>
                            <div className="bg-slate-50 p-2 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                {React.cloneElement(s.icon, { className: "h-4 w-4" })}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tighter text-slate-900">{s.val}</div>
                            <p className="text-[9px] font-bold text-slate-400 tracking-wide mt-1">
                                {s.trend}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Industrial Operation Hub */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                    <h2 className="text-[10px] font-bold uppercase tracking-normal text-slate-400">Industrial Logistics & Finance Hub</h2>
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="bg-slate-900 border-none text-white p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 -skew-x-12 translate-x-4 -translate-y-4"></div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-start">
                                <p className="text-[10px] font-bold tracking-wide text-slate-400">Corporate Credit Exposure</p>
                                <IndianRupee className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-4xl font-bold tracking-tighter">{formatCurrency(data?.b2b_stats?.total_credit_exposure || 0, settings?.currency_symbol, settings?.locale)}</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${(data?.b2b_stats?.total_credit_exposure / data?.b2b_stats?.total_credit_limit) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase">{Math.round((data?.b2b_stats?.total_credit_exposure / data?.b2b_stats?.total_credit_limit) * 100) || 0}% Utilization</span>
                                </div>
                            </div>
                            <p className="text-[8px] font-bold text-slate-500 tracking-wide pt-2">Total Authorized: {formatCurrency(data?.b2b_stats?.total_credit_limit || 0, settings?.currency_symbol, settings?.locale)}</p>
                        </div>
                    </Card>

                    <Card className="bg-white border border-slate-100 p-8 flex items-center justify-between group hover:border-primary transition-all">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold tracking-wide text-slate-400">Deployment Nodes</p>
                            <p className="text-5xl font-bold tracking-tighter text-slate-900 group-hover:text-primary transition-colors">{data?.b2b_stats?.in_flight_shipments || 0}</p>
                            <p className="text-[8px] font-bold text-slate-400 tracking-wide">Active Transits in Logistics Chain</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-full group-hover:bg-primary/10 transition-colors">
                            <Package className="h-8 w-8 text-slate-300 group-hover:text-primary" />
                        </div>
                    </Card>

                    <Card className="bg-white border border-slate-100 p-8 flex items-center justify-between group hover:border-primary transition-all">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold tracking-wide text-slate-400">Commissioned Projects</p>
                            <p className="text-5xl font-bold tracking-tighter text-slate-900 group-hover:text-primary transition-colors">{data?.b2b_stats?.active_projects || 0}</p>
                            <p className="text-[8px] font-bold text-slate-400 tracking-wide">Ongoing Job-Site Operations</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-full group-hover:bg-primary/10 transition-colors">
                            <Activity className="h-8 w-8 text-slate-300 group-hover:text-primary" />
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Sales Chart */}
                <Card className="lg:col-span-8 premium-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-bold uppercase tracking-normal text-slate-900 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" /> Procurement Velocity
                            </CardTitle>
                            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Net sales performance over the last 30 operational cycles</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="h-[350px] w-full block overflow-hidden">
                            {isMounted && data?.sales_over_time && (
                                <ResponsiveContainer width="99%" height={350}>
                                    <LineChart data={data?.sales_over_time}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9ca3af"
                                            fontSize={9}
                                            fontWeight="900"
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis
                                            stroke="#9ca3af"
                                            fontSize={9}
                                            fontWeight="900"
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(val) => formatCurrency(val, settings?.currency_symbol, settings?.locale)}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '0', color: '#fff' }}
                                            itemStyle={{ color: '#0284c7', textTransform: 'uppercase', fontWeight: '900', fontSize: '10px' }}
                                            labelStyle={{ color: '#666', fontWeight: '900', marginBottom: '4px', fontSize: '10px' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="daily_sales"
                                            stroke="#0284c7"
                                            strokeWidth={4}
                                            dot={{ fill: '#0284c7', r: 4 }}
                                            activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Low Stock Radar */}
                <Card className="lg:col-span-4 premium-card bg-slate-900 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 -skew-x-12 translate-x-8 -translate-y-8 group-hover:translate-x-4 transition-transform duration-700"></div>
                    <CardHeader className="border-b border-white/5 pb-6">
                        <CardTitle className="text-sm font-bold uppercase tracking-normal flex items-center gap-2 text-white">
                            <AlertTriangle className="h-4 w-4 text-primary" /> Low Stock Radar
                        </CardTitle>
                        <CardDescription className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Critical inventory replenishment required</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 text-white">
                        <div className="space-y-6">
                            {data?.low_stock_products?.length > 0 ? (
                                data.low_stock_products.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 group/item">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold uppercase tracking-tight group-hover/item:text-primary transition-colors">{p.name}</p>
                                            <div className="flex gap-4">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase">Available: <span className="text-red-400">{p.quantity}</span></p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase">Limit: {p.low_stock_threshold}</p>
                                            </div>
                                        </div>
                                        <Button size="icon" className="h-8 w-8 bg-white/5 hover:bg-primary transition-all rounded-none border-none">
                                            <Package className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                                    <AlertCircle className="h-10 w-10 text-slate-700" />
                                    <p className="text-[10px] font-bold tracking-wide text-slate-500">Inventory Status Nominal</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Grid: Assets & Partners */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Top Selling Products */}
                <Card className="premium-card overflow-hidden">
                    <CardHeader className="border-b border-slate-50 pb-6">
                        <CardTitle className="text-sm font-bold uppercase tracking-normal text-slate-900 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" /> High-Performance Assets
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Top equipment modules by technical utilization (Quantity)</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="h-[300px] w-full block overflow-hidden">
                            {isMounted && data?.top_selling_products && (
                                <ResponsiveContainer width="99%" height={300}>
                                    <BarChart data={data?.top_selling_products}>
                                        <XAxis
                                            dataKey="name"
                                            stroke="#9ca3af"
                                            fontSize={8}
                                            fontWeight="900"
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '0', color: '#fff' }}
                                            cursor={{ fill: '#f9fafb' }}
                                        />
                                        <Bar dataKey="total_quantity_sold" fill="#0284c7" radius={[0, 0, 0, 0]}>
                                            {data?.top_selling_products?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#0284c7' : '#111827'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Real-time Activity Feed */}
                <Card className="premium-card overflow-hidden">
                    <CardHeader className="border-b border-slate-50 pb-6">
                        <CardTitle className="text-sm font-bold uppercase tracking-normal text-slate-900 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" /> Recent Operations
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Live system events and technical inquiries</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {activities.length > 0 ? (
                                activities.map((act, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="mt-1">
                                            {act.type === 'order' && <div className="p-2 bg-blue-50 text-blue-600"><IndianRupee className="h-3 w-3" /></div>}
                                            {act.type === 'user' && <div className="p-2 bg-green-50 text-green-600"><Users className="h-3 w-3" /></div>}
                                            {act.type === 'rfq' && <div className="p-2 bg-orange-50 text-orange-600"><Activity className="h-3 w-3" /></div>}
                                            {act.type === 'review' && <div className="p-2 bg-purple-50 text-purple-600"><Activity className="h-3 w-3" /></div>}
                                        </div>
                                        <div className="flex-1 space-y-1 border-b border-gray-50 pb-4 group-last:border-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[11px] font-bold uppercase tracking-tight text-secondary group-hover:text-primary transition-colors">{act.description}</p>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-[9px] font-medium text-gray-400 tracking-wide">{new Date(act.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                                    <Activity className="h-10 w-10 text-gray-100" />
                                    <p className="text-[10px] font-bold tracking-wide text-gray-400">No operations detected</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NewDashboard;
