import { useState } from "react";
import { getReportUrl } from "../services/api";
import {
    FileSpreadsheet,
    Download,
    ShieldCheck,
    History,
    TrendingDown,
    BarChart,
    PieChart,
    ChevronRight,
    Database,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import React from 'react';

const ProcurementReports = () => {
    const [downloading, setDownloading] = useState(null);

    const handleDownload = async (type) => {
        setDownloading(type);
        try {
            const url = await getReportUrl(type);
            window.location.href = url;
        } catch (err) {
            console.error(err);
        } finally {
            setTimeout(() => setDownloading(null), 2000);
        }
    };

    const reportModules = [
        {
            id: 'gst',
            title: 'GST Procurement Manifest',
            description: 'Automated tax breakdown for financial auditing and government compliance.',
            icon: <ShieldCheck className="h-6 w-6 text-primary" />,
            role: 'dealer'
        },
        {
            id: 'statement',
            title: 'Account Ledger (Statement)',
            description: 'Cumulative transaction history and capital expenditure timeline.',
            icon: <History className="h-6 w-6 text-amber-500" />,
            role: 'customer'
        },
        {
            id: 'inventory',
            title: 'Asset Audit (Admin)',
            description: 'Global inventory health, low-stock triggers, and SKU valuation.',
            icon: <Database className="h-6 w-6 text-slate-900" />,
            role: 'admin'
        },
        {
            id: 'sales',
            title: 'Revenue Analytics (Admin)',
            description: 'Comprehensive sales performance data across all user segments.',
            icon: <TrendingDown className="h-6 w-6 text-green-500" />,
            role: 'admin'
        }
    ];

    return (
        <div className="bg-white min-h-screen page-header-padding">
            {/* Industrial Header */}
            <section className="bg-slate-50 border-b border-slate-100 py-24 relative overflow-hidden">
                <div className="container-custom relative z-10">
                    <div className="max-w-3xl space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <FileSpreadsheet className="h-5 w-5" />
                            <span className="text-[10px] font-bold uppercase tracking-normal">Official Data Exports</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold font-semibold tracking-tight leading-none text-slate-900">
                            Procurement <br /> <span className="text-primary text-gradient">Reports.</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-bold tracking-wide leading-relaxed">
                            Generate certified data manifests for accounting, inventory auditing, and fiscal compliance.
                        </p>
                    </div>
                </div>
            </section>

            <main className="container-custom py-20">
                <div className="grid md:grid-cols-2 gap-8">
                    {reportModules.map((module) => (
                        <div key={module.id} className="group bg-white border border-slate-100 p-10 hover:border-primary transition-all duration-500 shadow-sm hover:shadow-2xl flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="p-4 bg-slate-50 border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                                        {module.icon}
                                    </div>
                                    <span className="text-[8px] font-bold tracking-wide text-slate-400 bg-slate-50 px-2 py-1">Module: {module.id}</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-slate-900 font-semibold tracking-tight">{module.title}</h3>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed tracking-wider">
                                        {module.description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-slate-50">
                                <Button
                                    onClick={() => handleDownload(module.id)}
                                    disabled={downloading === module.id}
                                    className={`w-full h-10 rounded-none bg-slate-900 text-white font-bold uppercase tracking-normal text-[10px] hover:bg-primary transition-all ${downloading === module.id ? 'opacity-50' : ''}`}
                                >
                                    {downloading === module.id ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                            Compiling Manifest...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Download className="h-4 w-4" />
                                            Download CSV Export
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Technical Note */}
                <div className="mt-32 p-12 bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10"><BarChart className="h-64 w-64" /></div>
                    <div className="relative z-10 space-y-6 max-w-2xl">
                        <div className="flex items-center gap-2 text-primary">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-[10px] font-bold tracking-wide">Compliance Protocol</span>
                        </div>
                        <h4 className="text-3xl font-bold font-semibold tracking-tight">Certified Data Protocols</h4>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed tracking-wide">
                            All generated reports are cryptographically linked to your current session. Industrial manifests are optimized for integration with ERP systems like SAP, Oracle NetSuite, and Microsoft Dynamics.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <div className="bg-white/10 px-4 py-2 text-[9px] font-bold">RFC-4180 COMPLIANT</div>
                            <div className="bg-white/10 px-4 py-2 text-[9px] font-bold">ISO-27001 SECURE</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProcurementReports;
