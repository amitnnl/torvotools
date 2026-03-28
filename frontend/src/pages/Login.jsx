import React, { useState, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { login as apiLogin } from '../services/api';
import { Button } from "@/components/ui/button";
import { Search, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await apiLogin({ email, password });
            if (response.data.jwt) {
                login(response.data.jwt);
                const redirect = searchParams.get('redirect') || '/';
                navigate(redirect);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials or connection error.');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-white">
            {/* Left Side: Visual/Branding */}
            <div className="relative hidden lg:flex lg:w-1/2 bg-muted items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-muted via-transparent to-transparent"></div>

                <div className="relative z-10 p-20 space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-primary text-xs font-bold uppercase tracking-normal">Industrial Access</h2>
                        <h1 className="text-white text-7xl font-bold tracking-tighter leading-none uppercase">
                            Powering <br /> <span className="text-primary">Professionals</span>
                        </h1>
                    </div>
                    <p className="text-gray-400 text-base font-medium max-w-md leading-relaxed">
                        Access your professional equipment dashboard and manage your procurement with precision.
                    </p>
                    <div className="flex gap-10 pt-10 border-t border-white/10">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-primary h-6 w-6" />
                            <span className="text-white text-[10px] font-bold tracking-wide">Secure Portal</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-primary h-6 w-6" />
                            <span className="text-white text-[10px] font-bold tracking-wide">Direct Support</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white">
                <div className="w-full max-w-md space-y-12">
                    <div className="space-y-4 text-center lg:text-left">
                        <h3 className="text-4xl font-bold font-semibold tracking-tight text-slate-900">Sign In</h3>
                        <p className="text-gray-500 font-medium">Please enter your credentials to access the platform.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-normal text-gray-400">Professional Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-normal text-gray-400">Secure Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 font-bold focus:outline-none focus:border-primary transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 text-xs font-bold text-red-600 tracking-wide">{error}</div>}

                        <Button type="submit" className="w-full h-10 btn-primary-sleek">
                            Verify & Enter
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </Button>
                    </form>

                    <div className="pt-12 border-t border-gray-100 text-center lg:text-left">
                        <p className="text-sm font-medium text-gray-500">
                            New partner? <Link to="/register" className="text-primary font-bold tracking-wide hover:underline ml-2">Request Access</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
