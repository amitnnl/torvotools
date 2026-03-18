import { useEffect, useState } from "react";
import { getFleet, updateFleet } from "../services/api";
import {
    Briefcase,
    MapPin,
    Settings,
    ChevronRight,
    Search,
    Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import React from 'react';

const FleetManagement = () => {
    const [fleet, setFleet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchFleet = async () => {
            try {
                const response = await getFleet();
                setFleet(response.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFleet();
        window.scrollTo(0, 0);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-500 bg-green-50 border-green-100';
            case 'maintenance': return 'text-amber-500 bg-amber-50 border-amber-100';
            case 'decommissioned': return 'text-red-500 bg-red-50 border-red-100';
            case 'on-site': return 'text-primary bg-primary/5 border-primary/10';
            default: return 'text-gray-500 bg-gray-50 border-gray-100';
        }
    };

    const filteredFleet = filter === 'all' ? fleet : fleet.filter(item => item.status === filter);

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="bg-white min-h-screen page-header-padding">
            {/* Industrial Header */}
            <section className="bg-secondary py-20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/4 h-full bg-primary opacity-20 -skew-x-12 translate-x-1/2"></div>
                <div className="container-custom relative z-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <Briefcase className="h-5 w-5" />
                            <span className="text-[10px] font-bold uppercase tracking-normal">Asset Command Center</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold font-semibold tracking-tight leading-none">
                            Fleet <br /> <span className="text-primary text-gradient">Management.</span>
                        </h1>
                        <p className="text-gray-400 text-sm font-bold tracking-wide max-w-xl leading-relaxed">
                            Technical monitoring of all operational units, maintenance schedules, and job-site deployments.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-12 border-b border-gray-100 sticky top-navbar bg-white/80 backdrop-blur-md z-30">
                <div className="container-custom flex flex-wrap items-center justify-between gap-6 font-bold uppercase text-[10px] tracking-widest">
                    <div className="flex gap-4">
                        {['all', 'active', 'on-site', 'maintenance'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 border-b-2 transition-all ${filter === f ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-secondary'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                        <Search className="h-4 w-4" />
                        <span>Filter by Serial/Site</span>
                    </div>
                </div>
            </section>

            <main className="container-custom py-16">
                {filteredFleet.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredFleet.map((item) => (
                            <div key={item.id} className="bg-white border border-gray-100 hover:border-primary transition-all duration-500 group shadow-sm hover:shadow-2xl overflow-hidden">
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-gray-50 border border-gray-100 shadow-inner group-hover:scale-110 transition-transform">
                                            <Settings className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className={`px-3 py-1 border text-[8px] font-bold tracking-wide ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 tracking-wide">Model & Serial</p>
                                        <h3 className="text-xl font-bold text-secondary leading-tight uppercase truncate">{item.product_name}</h3>
                                        <p className="font-mono text-xs font-bold text-primary bg-primary/5 inline-block px-2 py-1">SN: {item.serial_number}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <MapPin className="h-3 w-3" />
                                                <span className="text-[8px] font-bold tracking-wide">Deployment</span>
                                            </div>
                                            <p className="text-[10px] font-extrabold text-secondary uppercase truncate">{item.site_location || 'Storage Hub'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar className="h-3 w-3" />
                                                <span className="text-[8px] font-bold tracking-wide">Next Service</span>
                                            </div>
                                            <p className="text-[10px] font-extrabold text-secondary uppercase truncate">{item.next_service_date || 'Not Scheduled'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-4">
                                            <div className="p-1 bg-white border border-gray-100 shadow-sm">
                                                <QRCodeCanvas
                                                    value={`TORVO-ASSET-${item.serial_number}`}
                                                    size={40}
                                                    level="H"
                                                    includeMargin={false}
                                                />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[7px] font-bold text-gray-400 tracking-wide leading-none">Field Verification Vector</p>
                                                <p className="text-[9px] font-bold text-secondary uppercase leading-none">{item.serial_number}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="text-[9px] font-bold tracking-wide text-primary hover:bg-primary/5 h-8">
                                            Technical Audit <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center border border-dashed border-gray-100 space-y-6">
                        <div className="bg-gray-50 p-10"><Search className="h-11 w-16 text-gray-200" /></div>
                        <div className="text-center space-y-2 tracking-wide">
                            <h3 className="text-2xl font-bold text-secondary">No Fleet Data</h3>
                            <p className="text-[10px] font-bold text-gray-400">Begin procurement to build your industrial inventory.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FleetManagement;
