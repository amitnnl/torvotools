import { useEffect, useState } from "react";
import { getInvoices, payInvoice } from "../services/api";
import {
    Download,
    History,
    CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateIndustrialPDF } from "../lib/pdfGenerator";
import { toast } from "react-hot-toast";
import React from 'react';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await getInvoices();
            setInvoices(response.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
        window.scrollTo(0, 0);
    }, []);

    const handlePay = async (id) => {
        try {
            await payInvoice(id);
            toast.success("SYSTEM: Financial reconciliation complete. Credit balance updated.");
            fetchInvoices();
        } catch (err) {
            toast.error("SYSTEM: Payment node failure.");
        }
    };

    const handleDownload = (inv) => {
        generateIndustrialPDF({
            type: 'INVOICE',
            documentNumber: inv.invoice_number,
            date: new Date(inv.created_at).toLocaleDateString(),
            customer: { name: "AUTHORIZED PARTNER", email: "CREDIT-LINKED-ACCOUNT", address: "REGISTERED JOB SITE" },
            items: [{ name: `PROCUREMENT ORDER #${inv.order_id}`, quantity: 1, price: parseFloat(inv.subtotal) }],
            totals: { subtotal: parseFloat(inv.subtotal), gst: parseFloat(inv.tax_amount), total: parseFloat(inv.total_amount) },
            status: inv.status
        });
    };

    const getStatusStyles = (status) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'bg-green-500 text-white';
            case 'pending': return 'bg-amber-500 text-white';
            case 'overdue': return 'bg-red-500 text-white';
            case 'cancelled': return 'bg-gray-500 text-white';
            default: return 'bg-slate-900 text-white';
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    const totalOutstanding = invoices
        .filter(inv => inv.status === 'pending')
        .reduce((acc, inv) => acc + parseFloat(inv.total_amount), 0);

    return (
        <div className="bg-white min-h-screen page-header-padding">
            {/* Header section with Stats */}
            <section className="bg-slate-50 border-b border-slate-100 py-20 relative overflow-hidden">
                <div className="container-custom relative z-10">
                    <div className="grid lg:grid-cols-12 gap-16 items-end">
                        <div className="lg:col-span-7 space-y-6">
                            <div className="flex items-center gap-3 text-primary">
                                <History className="h-5 w-5" />
                                <span className="text-[10px] font-bold uppercase tracking-normal">Financial Archive</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold font-semibold tracking-tight leading-none text-slate-900">
                                Invoice <br /> <span className="text-primary text-gradient">Console.</span>
                            </h1>
                            <p className="text-slate-500 text-sm font-bold tracking-wide max-w-xl leading-relaxed">
                                Automated billing history, transaction verification, and official procurement records.
                            </p>
                        </div>
                        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                            <div className="bg-white p-8 border border-slate-100 shadow-sm space-y-2">
                                <p className="text-[9px] font-bold uppercase text-slate-400">Total Outstanding</p>
                                <p className="text-3xl font-bold text-slate-900 tracking-tighter">₹{totalOutstanding.toLocaleString()}</p>
                            </div>
                            <div className="bg-primary p-8 shadow-xl space-y-2">
                                <p className="text-[9px] font-bold uppercase text-white/60">Total Vouchers</p>
                                <p className="text-3xl font-bold text-white tracking-tighter">{invoices.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="container-custom py-16">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 font-bold text-[10px] tracking-wide text-slate-400">
                                <th className="p-6 text-left">Internal Token</th>
                                <th className="p-6 text-left">Generation Date</th>
                                <th className="p-6 text-left">Associated RFQ</th>
                                <th className="p-6 text-left">Status</th>
                                <th className="p-6 text-right">Net Valuation</th>
                                <th className="p-6 text-right">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {invoices.length > 0 ? invoices.map((inv) => (
                                <tr key={inv.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="p-6">
                                        <p className="font-bold text-sm text-slate-900 font-semibold tracking-tight">{inv.invoice_number}</p>
                                        <p className="text-[9px] font-bold text-slate-400">ID: {inv.id}</p>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-bold text-slate-600 uppercase">{new Date(inv.created_at).toLocaleDateString()}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">DUE: {new Date(inv.due_date).toLocaleDateString()}</p>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-bold text-slate-900 uppercase underline decoration-primary/30">#RFQ-{inv.rfq_id}</p>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 text-[8px] font-bold tracking-wide ${getStatusStyles(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <p className="text-base font-bold text-slate-900 tracking-tight">₹{parseFloat(inv.total_amount).toLocaleString()}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Incl. Tax</p>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {inv.status === 'pending' && (
                                                <Button
                                                    onClick={() => handlePay(inv.id)}
                                                    variant="outline"
                                                    className="h-10 border border-primary text-primary hover:bg-primary hover:text-white transition-all"
                                                >
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    <span className="text-[9px] font-bold tracking-wide">Settle</span>
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => handleDownload(inv)}
                                                variant="ghost"
                                                className="h-10 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                <span className="text-[9px] font-bold tracking-wide">Asset</span>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center tracking-wide text-slate-400 font-bold text-xs italic">
                                        No financial data packets identified in the archive.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Invoices;
