import { useEffect, useState } from "react";
import { getShipping } from "../services/api";
import {
    Truck,
    MapPin,
    Package,
    CheckCircle2,
    Clock,
    Search,
    ChevronRight,
    Activity,
    Phone,
    User,
    Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SignatureCanvas from 'react-signature-canvas';
import { updateShipment } from "../services/api";
import React, { useRef, useContext } from 'react';
import { generateShippingManifestPDF } from "../lib/pdfGenerator";
import { useSettings } from "../contexts/SettingsContext";

const ShippingTracker = () => {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [signingId, setSigningId] = useState(null);
    const [signerName, setSignerName] = useState("");
    const signaturePad = useRef(null);
    const { settings } = useSettings();

    useEffect(() => {
        const fetchShipping = async () => {
            try {
                const response = await getShipping();
                setShipments(response.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchShipping();
        window.scrollTo(0, 0);
    }, []);

    const handleSignSubmit = async (id) => {
        if (!signerName || signaturePad.current.isEmpty()) return;

        const signatureData = signaturePad.current.getTrimmedCanvas().toDataURL('image/png');
        try {
            await updateShipment(id, {
                action: 'sign',
                digital_signature: signatureData,
                signed_by_name: signerName
            });
            setSigningId(null);
            setSignerName("");
            // Refresh
            const response = await getShipping();
            setShipments(response.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <CheckCircle2 className="h-6 w-6 text-green-500" />;
            case 'at-job-site': return <MapPin className="h-6 w-6 text-primary" />;
            default: return <Truck className="h-6 w-6 text-amber-500" />;
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="bg-white min-h-screen page-header-padding">
            {/* Logistics Header */}
            <section className="bg-slate-900 py-20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-20 -skew-x-12 translate-x-1/2"></div>
                <div className="container-custom relative z-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <Navigation className="h-5 w-5" />
                            <span className="text-[10px] font-bold uppercase tracking-normal">Integrated Logistics Chain</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold font-semibold tracking-tight leading-none">
                            Shipping <br /> <span className="text-primary text-gradient">Status.</span>
                        </h1>
                        <p className="text-gray-400 text-sm font-bold tracking-wide max-w-xl leading-relaxed">
                            Mission-critical deployment tracking. From logistics hub to job-site delivery.
                        </p>
                    </div>
                </div>
            </section>

            <main className="container-custom py-16">
                {shipments.length > 0 ? (
                    <div className="space-y-12">
                        {shipments.map((s) => (
                            <div key={s.id} className="bg-white border border-slate-100 hover:border-primary transition-all duration-500 group shadow-sm hover:shadow-2xl p-10">
                                <div className="grid lg:grid-cols-12 gap-12">
                                    {/* Left: Token & Status */}
                                    <div className="lg:col-span-4 space-y-8 lg:border-r border-slate-100 pr-10">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold tracking-wide text-slate-400">Logistics Token</p>
                                            <h3 className="text-2xl font-bold text-slate-900 font-semibold tracking-tight">#{s.tracking_number}</h3>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 text-[8px] font-bold uppercase text-slate-600 tracking-widest">
                                                Partner: {s.courier_partner}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-primary/5 rounded-full">{getStatusIcon(s.shipping_status)}</div>
                                                <div>
                                                    <p className="text-[10px] font-bold tracking-wide text-slate-400 font-bold">Current Node</p>
                                                    <p className="text-sm font-bold text-slate-900 font-semibold tracking-tight">{s.shipping_status.replace('-', ' ')}</p>
                                                </div>
                                            </div>
                                            {s.estimated_delivery && (
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-slate-50 rounded-full"><Clock className="h-6 w-6 text-slate-400" /></div>
                                                    <div>
                                                        <p className="text-[10px] font-bold tracking-wide text-slate-400 font-bold">Estimated ETA</p>
                                                        <p className="text-sm font-bold text-slate-900 font-semibold tracking-tight">{new Date(s.estimated_delivery).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Site Details & Map Visualization Placeholder */}
                                    <div className="lg:col-span-8 space-y-10">
                                        <div className="grid md:grid-cols-2 gap-12">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                    <p className="text-[10px] font-bold tracking-wide text-slate-900">Job-Site Destination</p>
                                                </div>
                                                <div className="bg-slate-50 p-6 border border-slate-100 shadow-inner space-y-2">
                                                    <p className="text-[10px] font-bold text-primary uppercase">Coordinates Identified</p>
                                                    <p className="text-sm font-bold text-slate-600 uppercase leading-relaxed">{s.site_coordinates || 'TRIANGULATING LOGISTICS HUB...'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-primary" />
                                                    <p className="text-[10px] font-bold tracking-wide text-slate-900">Site Liaison</p>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 flex items-center justify-center bg-slate-900 text-white text-xs font-bold rounded-full font-semibold tracking-tight">{s.site_contact_name?.charAt(0) || 'L'}</div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 font-semibold tracking-tight">{s.site_contact_name || 'Logistic Lead'}</p>
                                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                                <Phone className="h-3 w-3" /> {s.site_contact_phone || 'Protocol Pending'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipment Pulse Visualization */}
                                        <div className="pt-6 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex gap-2">
                                                {['manifested', 'in-transit', 'at-job-site', 'delivered'].map((step, i) => (
                                                    <div key={step} className="flex items-center">
                                                        <div className={`h-2 w-12 rounded-full ${['manifested', 'in-transit', 'at-job-site', 'delivered'].indexOf(s.shipping_status) >= i ? 'bg-primary' : 'bg-slate-100'}`}></div>
                                                    </div>
                                                ))}
                                            </div>

                                            {s.shipping_status === 'at-job-site' && signingId !== s.id && (
                                                <Button onClick={() => setSigningId(s.id)} className="bg-primary text-white font-bold uppercase text-[9px] tracking-widest px-5">
                                                    Secure Digital Sign-off
                                                </Button>
                                            )}

                                            {s.shipping_status === 'delivered' && s.digital_signature && (
                                                <div className="flex items-center gap-6 p-4 bg-slate-50 border border-slate-100">
                                                    <div className="space-y-1">
                                                        <p className="text-[7px] font-bold text-slate-400 tracking-wide">Protocol Verified</p>
                                                        <p className="text-[9px] font-bold text-slate-900 uppercase">Signed by: {s.signed_by_name}</p>
                                                        <p className="text-[7px] font-medium text-slate-400 uppercase">{new Date(s.signed_at).toLocaleString()}</p>
                                                    </div>
                                                    <img src={s.digital_signature} alt="Signature" className="h-10 border border-slate-200 bg-white" />
                                                </div>
                                            )}

                                            {signingId === s.id && (
                                                <div className="w-full max-w-md space-y-4 bg-slate-50 p-6 border border-primary/20">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[10px] font-bold tracking-wide text-primary">Terminal Verification</p>
                                                        <button onClick={() => setSigningId(null)} className="text-[8px] font-bold tracking-wide text-red-500 underline">Cancel</button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="FULL NAME OF RECIPIENT..."
                                                        className="w-full p-3 bg-white border border-slate-200 text-[10px] font-bold tracking-wide focus:outline-none focus:border-primary"
                                                        value={signerName}
                                                        onChange={(e) => setSignerName(e.target.value)}
                                                    />
                                                    <div className="bg-white border border-slate-100 h-40">
                                                        <SignatureCanvas
                                                            ref={signaturePad}
                                                            penColor='#0f172a'
                                                            canvasProps={{ className: 'signature-canvas w-full h-full' }}
                                                        />
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <Button onClick={() => signaturePad.current.clear()} variant="ghost" className="flex-1 text-[9px] font-bold tracking-wide">Clear</Button>
                                                        <Button onClick={() => handleSignSubmit(s.id)} className="flex-1 bg-slate-900 text-white text-[9px] font-bold tracking-wide">Vault Signature</Button>
                                                    </div>
                                                </div>
                                            )}

                                            <Button
                                                variant="ghost"
                                                onClick={() => generateShippingManifestPDF(s, settings)}
                                                className="text-[9px] font-bold tracking-wide text-primary hover:bg-primary/5"
                                            >
                                                Secure Manifest Log <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center border border-dashed border-slate-100 space-y-6 tracking-wide">
                        <div className="bg-slate-50 p-10"><Search className="h-11 w-16 text-slate-200" /></div>
                        <h3 className="text-2xl font-bold text-slate-900">No Active Shipments</h3>
                        <p className="text-[10px] font-bold text-slate-400">All logistics units are currently at hub rest.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ShippingTracker;
