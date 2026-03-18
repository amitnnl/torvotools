import { useEffect, useState } from "react";
import { getOrders } from "../services/api";
import { useSettings } from "../contexts/SettingsContext";
import { Package, Clock, ChevronRight, CheckCircle2, AlertCircle, Search, FileText, Truck, ShieldCheck, MapPin, Download } from "lucide-react";
import { Link } from "react-router-dom";
import React from 'react';
import { generateInvoicePDF } from "../lib/pdfGenerator";
import { formatCurrency } from "../lib/utils";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();
        setOrders(response.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    window.scrollTo(0, 0);
  }, []);

  const statusMap = {
    'pending': { label: 'Transmission Received', step: 1, color: 'text-primary' },
    'processing': { label: 'Logistics Center', step: 2, color: 'text-primary' },
    'shipped': { label: 'In Transit', step: 3, color: 'text-primary' },
    'delivered': { label: 'Terminal Arrival', step: 4, color: 'text-green-500' },
    'cancelled': { label: 'Operation Terminated', step: 0, color: 'text-red-500' }
  };

  const LogisticsTimeline = ({ status }) => {
    const currentStatus = status.toLowerCase();
    const config = statusMap[currentStatus] || { label: status, step: 1, color: 'text-primary' };

    if (currentStatus === 'cancelled') {
      return (
        <div className="flex items-center gap-3 text-red-500 bg-red-50 p-4 border-l-4 border-red-500 shadow-sm">
          <AlertCircle className="h-5 w-5" />
          <span className="text-[10px] font-bold tracking-wide text-red-600">Operation Terminated: Administrative Cancellation</span>
        </div>
      );
    }

    const steps = [
      { id: 1, label: 'Transmission', icon: <Clock /> },
      { id: 2, label: 'Processing', icon: <Package /> },
      { id: 3, label: 'In Transit', icon: <Truck /> },
      { id: 4, label: 'Final Node', icon: <MapPin /> }
    ];

    return (
      <div className="w-full pt-10 pb-6">
        <div className="relative flex justify-between">
          {/* Background Line */}
          <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 z-0"></div>
          {/* Active Line */}
          <div
            className="absolute top-5 left-0 h-[2px] bg-primary z-0 transition-all duration-1000"
            style={{ width: `${((config.step - 1) / (steps.length - 1)) * 100}%` }}
          ></div>

          {steps.map((step) => {
            const isActive = step.id <= config.step;
            const isCurrent = step.id === config.step;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-10 h-10 rounded-none border flex items-center justify-center transition-all duration-500 shadow-sm ${isActive
                    ? 'bg-primary border-primary text-white shadow-[0_0_20px_rgba(2,132,199,0.2)]'
                    : 'bg-white border-slate-100 text-slate-300'
                  } ${isCurrent ? 'animate-pulse scale-110 border-primary' : ''}`}>
                  {React.cloneElement(step.icon, { className: "h-4 w-4" })}
                </div>
                <span className={`text-[8px] font-bold tracking-wide ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-white min-h-screen page-header-padding">
      {/* Visual Header - LIGHT THEME */}
      <section className="bg-slate-50 border-b border-slate-100 py-20 text-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 translate-x-1/2"></div>
        <div className="container-custom relative z-10 text-slate-900">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-12 bg-primary"></div>
              <span className="text-primary text-xs font-bold uppercase tracking-normal">Inventory Log</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-semibold tracking-tight leading-none text-slate-900">
              Procurement <br /> <span className="text-primary text-gradient">Archive.</span>
            </h1>
            <p className="text-slate-500 text-base font-medium max-w-2xl leading-relaxed tracking-wide">
              Comprehensive technical log of all verified industrial transactions and equipment transfers.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          {orders.length > 0 ? (
            <div className="space-y-12">
              <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                <div className="flex items-center gap-4">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="text-[10px] font-bold tracking-wide text-slate-400">{orders.length} Authenticated Transactions</p>
                </div>
              </div>

              <div className="grid gap-10">
                {orders.map((order) => (
                  <div key={order.id} className="group bg-white border border-slate-100 hover:border-primary transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-50 group-hover:bg-primary transition-all"></div>

                    <div className="p-8 md:p-12 space-y-10">
                      {/* Top Info Bar */}
                      <div className="flex flex-col lg:flex-row justify-between gap-8 border-b border-slate-50 pb-8">
                        <div className="flex flex-wrap items-center gap-10 text-slate-900">
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold tracking-wide text-slate-400">Order Token</p>
                            <p className="text-xl font-bold font-semibold tracking-tight text-slate-900">#TRV-{order.id}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold tracking-wide text-slate-400">Timestamp</p>
                            <p className="text-sm font-bold text-slate-700 uppercase">{new Date(order.created_at).toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold tracking-wide text-slate-400">Net Valuation</p>
                            <p className="text-xl font-bold text-primary tracking-tight">{formatCurrency(order.total_amount, settings?.currency_symbol, settings?.locale)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => generateInvoicePDF(order, settings)}
                            className="h-9 px-4 btn-outline-sleek"
                          >
                            <FileText className="h-4 w-4" /> Download Manifest
                          </button>
                        </div>
                      </div>

                      {/* Logistics Timeline */}
                      <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-2 w-2 bg-primary rounded-full animate-ping"></div>
                          <p className="text-[10px] font-bold tracking-wide text-slate-900">Live System Status: <span className="text-primary">{statusMap[order.status.toLowerCase()]?.label || order.status}</span></p>
                        </div>
                        <LogisticsTimeline status={order.status} />
                      </div>

                      {/* Equipment Manifest */}
                      <div className="bg-slate-50 p-8 space-y-6 shadow-inner border border-slate-100">
                        <p className="text-[10px] font-bold tracking-wide text-slate-400 flex items-center gap-2">
                          <Package className="h-3 w-3" /> Equipment Manifest
                        </p>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex gap-4 group/item">
                              <div className="w-12 h-9 bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm group-hover/item:border-primary transition-colors">
                                <Package className="h-5 w-5 text-slate-200 group-hover/item:text-primary transition-colors" />
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <p className="text-[10px] font-bold uppercase truncate text-slate-900 group-hover/item:text-primary transition-colors">{item.product_name}</p>
                                <p className="text-[9px] font-bold text-slate-400 font-semibold tracking-tight">Qty: {item.quantity} units</p>
                                <p className="text-[9px] font-bold text-primary uppercase">{formatCurrency(item.price, settings?.currency_symbol, settings?.locale)} / unit</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Destination Node */}
                      <div className="flex items-start gap-4 text-slate-500 border-t border-slate-50 pt-8">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold tracking-wide text-slate-400">Logistics Destination</p>
                          <p className="text-xs font-medium uppercase leading-relaxed max-w-lg text-slate-700">{order.shipping_address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center border border-dashed border-slate-100 space-y-6">
              <div className="bg-slate-50 p-10 shadow-inner">
                <Search className="h-11 w-16 text-slate-200" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold font-semibold tracking-tight text-slate-900">No Log Data Found</h3>
                <p className="text-slate-400 font-medium tracking-wide text-[10px]">Your historical procurement inventory is currently clear.</p>
              </div>
              <Link to="/products" className="h-11 px-12 btn-primary-sleek flex items-center justify-center shadow-xl">Initiate Procurement</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default OrderHistory;
