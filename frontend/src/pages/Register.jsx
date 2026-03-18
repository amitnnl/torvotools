import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister } from '../services/api';
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Building2, FileCheck, MapPin, ArrowRight, ShieldPlus } from "lucide-react";

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [gstNumber, setGstNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const userData = {
            name, email, password, role,
            ...(role === 'dealer' && { gst_number: gstNumber, company_name: companyName, address }),
        };

        try {
            const response = await apiRegister(userData);
            setSuccess(response.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during registration.');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-white">
            {/* Left Side: Visual */}
            <div className="relative hidden lg:flex lg:w-1/3 bg-muted items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity grayscale"></div>
                <div className="relative z-10 p-12 space-y-8">
                    <div className="space-y-4 text-center">
                        <ShieldPlus className="h-11 w-16 text-primary mx-auto" />
                        <h1 className="text-white text-4xl font-bold font-semibold tracking-tight leading-none">
                            Partner <br /> <span className="text-primary">Network</span>
                        </h1>
                        <p className="text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
                            Join our global network of industrial professionals and authorized dealers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-20 bg-white">
                <div className="w-full max-w-2xl space-y-10">
                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold font-semibold tracking-tight text-slate-900">Join Torvo</h3>
                        <p className="text-gray-500 font-medium">Create your professional or personal account to start procurement.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-bold tracking-wide text-gray-400">Account Type</label>
                                <div className="flex gap-4">
                                    {['customer', 'dealer'].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={`flex-1 py-3 border font-bold font-semibold tracking-tight text-xs transition-all ${role === r ? 'bg-muted border-muted text-white' : 'bg-white border-gray-100 text-gray-400 hover:border-primary'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold tracking-wide text-gray-400">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all" placeholder="John Doe" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold tracking-wide text-gray-400">Professional Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all" placeholder="name@company.com" required />
                                </div>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-bold tracking-wide text-gray-400">Security Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all" placeholder="••••••••" required />
                                </div>
                            </div>

                            {role === 'dealer' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-wide text-gray-400">GST Identification</label>
                                        <div className="relative">
                                            <FileCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all" placeholder="GSTN123456" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-wide text-gray-400">Company Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all" placeholder="Industrial Corp" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-bold tracking-wide text-gray-400">Business Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-12 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all min-h-[100px]" placeholder="Full company address..." required />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 text-xs font-bold text-red-600 tracking-wide">{error}</div>}
                        {success && <div className="bg-green-50 border-l-4 border-green-500 p-4 text-xs font-bold text-green-600 tracking-wide">{success}</div>}

                        <Button type="submit" className="w-full h-10 btn-primary-sleek">
                            Complete Registration
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </Button>
                    </form>

                    <p className="text-center text-sm font-medium text-gray-500 pt-6">
                        Already verified? <Link to="/login" className="text-primary font-bold tracking-wide hover:underline ml-2">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
