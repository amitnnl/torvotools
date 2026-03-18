import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    AlertTriangle,
    MapPin,
    Package,
    Clock,
    Send,
    X
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const RfqForm = ({ product, onSubmit, onCancel }) => {
    const [quantity, setQuantity] = useState(product?.min_order_quantity || 1);
    const [notes, setNotes] = useState('');
    const [urgency, setUrgency] = useState('Normal');
    const [siteLocation, setSiteLocation] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            product_id: product.id,
            quantity,
            notes,
            urgency,
            site_location: siteLocation
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-2 space-y-8 bg-white">
            <div className="flex items-center gap-4 bg-gray-50 p-4 border-l-4 border-primary">
                <div className="bg-white p-2 shadow-sm border border-gray-100">
                    <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-[10px] font-bold tracking-wide text-gray-400">Asset Targeted</h3>
                    <p className="font-bold text-secondary font-semibold tracking-tight truncate w-64">{product?.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold tracking-wide text-gray-500">Required Units</Label>
                    <div className="relative">
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 p-4 font-bold text-sm focus:outline-none focus:border-primary transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-bold tracking-wide text-gray-500">Operational Urgency</Label>
                    <Select value={urgency} onValueChange={setUrgency}>
                        <SelectTrigger className="rounded-none h-10 border border-gray-100 bg-gray-50 font-bold uppercase text-xs focus:ring-0">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <SelectValue placeholder="URGENCY" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-gray-100 shadow-2xl">
                            <SelectItem value="Priority" className="font-bold uppercase text-[10px]">High Priority (Critical)</SelectItem>
                            <SelectItem value="Normal" className="font-bold uppercase text-[10px]">Normal Protocol</SelectItem>
                            <SelectItem value="Planning" className="font-bold uppercase text-[10px]">Future Planning</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-bold tracking-wide text-gray-500">Delivery Site Location</Label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <input
                        placeholder="ENTER JOB SITE ADDRESS OR COORDINATES..."
                        value={siteLocation}
                        onChange={(e) => setSiteLocation(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold text-sm focus:outline-none focus:border-primary transition-all uppercase"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-bold tracking-wide text-gray-500">Technical Notes & Special Instructions</Label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 p-4 font-bold text-sm focus:outline-none focus:border-primary transition-all min-h-[100px] uppercase"
                    placeholder="SPECIFY COMPLIANCE REQUIREMENTS, CUSTOM PACKAGING, ETC..."
                />
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-10 btn-outline-industrial uppercase">
                    <X className="mr-2 h-4 w-4" /> Terminate
                </Button>
                <Button type="submit" className="flex-1 h-10 btn-primary-industrial uppercase">
                    <Send className="mr-2 h-4 w-4" /> Submit Inquiry
                </Button>
            </div>
        </form>
    );
};

export default RfqForm;
