import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getProfile, updateProfile, getReportUrl, getCredit } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency } from '../lib/utils';
import { Button } from "@/components/ui/button";
import {
    User, Mail, Lock, Building2, FileCheck, MapPin,
    ShieldCheck, ChevronRight, Save, RefreshCw, FileDown,
    Trophy, TrendingUp, Percent, Info, Wallet
} from "lucide-react";

const Profile = () => {
    const { user: authUser } = useContext(AuthContext);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        dealer_details: {
            company_name: '',
            gst_number: '',
            address: ''
        }
    });
    const [creditData, setCreditData] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { settings } = useSettings();

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [profileRes, creditRes] = await Promise.all([
                    getProfile(),
                    (authUser?.role === 'dealer' || authUser?.role === 'admin') ? getCredit() : Promise.resolve({ data: null })
                ]);
                setProfile(profileRes.data);
                if (creditRes.data) setCreditData(creditRes.data);
            } catch (err) {
                console.error("Failed to fetch profile/credit context");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
        window.scrollTo(0, 0);
    }, [authUser]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setError('');
        setSuccess('');
        try {
            const updateData = {
                name: profile.name,
                email: profile.email,
                new_password: newPassword || undefined
            };
            if (profile.role === 'dealer') {
                updateData.dealer_details = profile.dealer_details;
            }
            await updateProfile(updateData);
            setSuccess("SECURITY AND IDENTITY PARAMETERS UPDATED SUCCESSFULLY.");
            setNewPassword('');
        } catch (err) {
            setError(err.response?.data?.message || "TRANSMISSION FAILED. PLEASE VERIFY DATA.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="bg-white min-h-screen page-header-padding">
            {/* Header Area */}
            <div className="bg-muted py-16 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/4 h-full bg-primary opacity-10 -skew-x-12 translate-x-1/2"></div>
                <div className="container-custom relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-normal text-primary">
                            <span>Security Core</span>
                            <ChevronRight className="h-3 w-3" />
                            <span>Identity Management</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
                            Account <br /> <span className="text-primary text-gradient">Profile.</span>
                        </h1>
                        <p className="text-gray-400 text-sm font-bold tracking-wide">Authorized Access: {profile.role} Module</p>
                    </div>
                </div>
            </div>

            <main className="container-custom py-16">
                <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                    {/* Identity & Security Section */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-10">
                            <div className="space-y-4 border-l-4 border-primary pl-6">
                                <h2 className="text-2xl font-bold font-semibold tracking-tight text-slate-900">Core Identity</h2>
                                <p className="text-slate-500 text-xs font-bold tracking-wide">Update your basic professional information</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold tracking-wide text-gray-400 pl-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all uppercase text-sm"
                                            placeholder="COMMANDER NAME..."
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold tracking-wide text-gray-400 pl-1">Authorized Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all text-sm"
                                            placeholder="NAME@COMPANY.COM"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10 pt-12 border-t border-gray-100">
                            <div className="space-y-4 border-l-4 border-primary pl-6">
                                <h2 className="text-2xl font-bold font-semibold tracking-tight text-slate-900">Security Protocol</h2>
                                <p className="text-slate-500 text-xs font-bold tracking-wide">Reset authentication credentials</p>
                            </div>

                            <div className="space-y-2 max-w-md">
                                <label className="text-[10px] font-bold tracking-wide text-gray-400 pl-1">New Secure Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 tracking-wide mt-2 pl-1">Leave empty to maintain existing security key</p>
                            </div>
                        </div>

                        {profile.role === 'dealer' && (
                            <div className="space-y-10 pt-12 border-t border-gray-100">
                                <div className="space-y-4 border-l-4 border-primary pl-6">
                                    <h2 className="text-2xl font-bold font-semibold tracking-tight text-slate-900">Business Configuration</h2>
                                    <p className="text-slate-500 text-xs font-bold tracking-wide">Manage partner network and logistics data</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-wide text-gray-400 pl-1">Corporate Entity</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={profile.dealer_details?.company_name || ''}
                                                onChange={(e) => setProfile({ ...profile, dealer_details: { ...profile.dealer_details, company_name: e.target.value } })}
                                                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all uppercase text-sm"
                                                placeholder="INDUSTRIAL CORP..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-wide text-gray-400 pl-1">GST Identification</label>
                                        <div className="relative">
                                            <FileCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={profile.dealer_details?.gst_number || ''}
                                                onChange={(e) => setProfile({ ...profile, dealer_details: { ...profile.dealer_details, gst_number: e.target.value } })}
                                                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all uppercase text-sm"
                                                placeholder="GSTNXXXXXXXXX..."
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold tracking-wide text-gray-400 pl-1">Logistics Hub (Address)</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-6 h-4 w-4 text-gray-400" />
                                            <textarea
                                                value={profile.dealer_details?.address || ''}
                                                onChange={(e) => setProfile({ ...profile, dealer_details: { ...profile.dealer_details, address: e.target.value } })}
                                                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all uppercase text-sm min-h-[120px]"
                                                placeholder="FULL BUSINESS ADDRESS..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Sidebar */}
                    <div className="lg:col-span-5 space-y-8">
                        {profile.role === 'dealer' && (
                            <>
                                <div className="bg-gray-50 border-t-4 border-primary p-10 space-y-8">
                                    <div className="flex items-center justify-between font-bold uppercase text-slate-900 tracking-tighter">
                                        <div className="flex items-center gap-3">
                                            <Trophy className="h-6 w-6 text-primary" />
                                            <h3 className="text-xl">Partner Status</h3>
                                        </div>
                                        <div className="text-primary text-2xl">Tier {profile.dealer_details?.tier || 1}</div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-white p-6 border border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 p-2"><Percent className="h-4 w-4 text-primary" /></div>
                                                <span className="text-[10px] font-bold tracking-wide text-gray-500">Authorized Discount</span>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-900">
                                                {settings[`dealer_tier_${profile.dealer_details?.tier || 1}_discount`] || 0}%
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-3 w-3 text-primary" />
                                                    <span className="text-[9px] font-bold tracking-wide text-gray-400">Procurement Progress</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-400">TIER {profile.dealer_details?.tier || 1} ACTIVE</span>
                                            </div>
                                            <div className="h-3 bg-gray-200 overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-1000"
                                                    style={{ width: `${(profile.dealer_details?.tier || 1) * 33.3}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[8px] font-bold text-gray-400 tracking-wide text-center">Maintain high volume activity to unlock Tier {Math.min(3, (parseInt(profile.dealer_details?.tier) || 1) + 1)} benefits.</p>
                                        </div>
                                    </div>

                                    {/* B2B Credit Matrix */}
                                    {creditData && creditData.credit_limit > 0 && (
                                        <div className="bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 -skew-x-12 translate-x-4 -translate-y-4"></div>
                                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                                <Wallet className="h-5 w-5 text-primary" />
                                                <h3 className="text-xl font-bold font-semibold tracking-tight">B2B Credit Matrix</h3>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-normal text-slate-400">
                                                    <span>Credit Utilization</span>
                                                    <span className={parseFloat(creditData.current_balance) > (parseFloat(creditData.credit_limit) * 0.8) ? 'text-red-500' : 'text-primary'}>
                                                        {Math.round((parseFloat(creditData.current_balance) / parseFloat(creditData.credit_limit)) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-white/10 overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${parseFloat(creditData.current_balance) > (parseFloat(creditData.credit_limit) * 0.8) ? 'bg-red-500' : 'bg-primary'}`}
                                                        style={{ width: `${(parseFloat(creditData.current_balance) / parseFloat(creditData.credit_limit)) * 100}%` }}
                                                    ></div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-bold text-slate-500 tracking-wide">Total Limit</p>
                                                        <p className="text-xl font-bold">{formatCurrency(creditData.credit_limit, settings)}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-bold text-slate-500 tracking-wide">Available</p>
                                                        <p className="text-xl font-bold text-primary">{formatCurrency(parseFloat(creditData.credit_limit) - parseFloat(creditData.current_balance), settings)}</p>
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                                                    <Info className="h-3 w-3 text-slate-500" />
                                                    <p className="text-[8px] font-bold text-slate-500 tracking-wide">Net-30 Settlement Protocol Active</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4">
                                    {profile.dealer_details?.is_approved ? (
                                        <div className="flex items-center gap-2 text-[8px] font-bold tracking-wide text-green-600 bg-green-50 px-3 py-2 border border-green-100">
                                            <ShieldCheck className="h-4 w-4" /> Account Verified & Active
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-[8px] font-bold tracking-wide text-amber-600 bg-amber-50 px-3 py-2 border border-amber-100">
                                            <Info className="h-4 w-4" /> Pending Technical Verification
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="bg-slate-900 text-white p-10 space-y-10 sticky top-32">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    <h3 className="text-xl font-bold font-semibold tracking-tight">System Confirmation</h3>
                                </div>
                                <p className="text-gray-500 text-xs font-medium leading-relaxed">Identity changes require immediate technical validation. Ensure all parameters are accurate before transmission.</p>
                            </div>

                            {error && <div className="bg-red-500/10 border-l-4 border-red-500 p-4 text-[10px] font-bold text-red-400 tracking-wide leading-relaxed">{error}</div>}
                            {success && <div className="bg-green-500/10 border-l-4 border-green-500 p-4 text-[10px] font-bold text-green-400 tracking-wide leading-relaxed">{success}</div>}

                            <Button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full h-20 btn-primary-sleek text-lg"
                            >
                                {isUpdating ? (
                                    <div className="flex items-center gap-3"><RefreshCw className="h-5 w-5 animate-spin" /> Transmitting...</div>
                                ) : (
                                    <div className="flex items-center gap-3"><Save className="h-5 w-5" /> Commit Changes</div>
                                )}
                            </Button>

                            <div className="pt-10 border-t border-white/5 space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold tracking-wide text-white">Operational Archive</h3>
                                    <p className="text-[9px] font-bold text-gray-500 tracking-wide leading-relaxed">Download a technical summary of all account procurement activity.</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.open(getReportUrl('statement'), '_blank')}
                                    className="w-full h-10 btn-outline-sleek text-white border-white/10"
                                >
                                    <FileDown className="h-4 w-4 mr-2" /> Account Statement
                                </Button>

                                {(profile.role === 'dealer' || profile.role === 'admin') && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.open(getReportUrl('gst'), '_blank')}
                                        className="w-full h-10 btn-outline-sleek text-primary border-primary/20 hover:bg-primary/5"
                                    >
                                        <Percent className="h-4 w-4 mr-2" /> GST Procurement Manifest
                                    </Button>
                                )}
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-normal">Operational Since: {new Date(profile.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div >
    );
};

export default Profile;
