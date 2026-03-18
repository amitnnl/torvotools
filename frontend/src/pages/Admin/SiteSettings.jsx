import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings, IMAGE_BASE_URL } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Palette, Layout, Briefcase, Mail, Share2, Save, RefreshCw, Image as ImageIcon, ShieldCheck, ToggleLeft, Settings } from 'lucide-react';
import { useSettings as useGlobalSettings } from '@/contexts/SettingsContext';

const SiteSettings = () => {
    const { settings: globalSettings, loadFont, updateSystemVisuals, hexToHsl, refreshSettings } = useGlobalSettings();
    const [settings, setSettings] = useState({});
    const [logoFile, setLogoFile] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await getSettings();
            setSettings(response.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to synchronize system parameters.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));

        if (name === 'primary_font') {
            updateSystemVisuals(null, value);
        }
        if (name === 'primary_color' && value.length === 7) {
            updateSystemVisuals(value, null);
        }
    };

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: prev[key] === '1' ? '0' : '1' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: 'info', text: 'Transmitting configuration changes...' });

        const formData = new FormData();
        for (const key in settings) {
            if (key !== 'logo_url' && key !== 'favicon_url') {
                formData.append(key, settings[key]);
            }
        }

        if (logoFile) formData.append('logo_file', logoFile);
        if (faviconFile) formData.append('favicon_file', faviconFile);

        try {
            await updateSettings(formData);
            setMessage({ type: 'success', text: 'GLOBAL PARAMETERS UPDATED SUCCESSFULLY.' });

            // Sync both local state and global context
            await fetchSettings();
            if (refreshSettings) refreshSettings();

        } catch (error) {
            setMessage({ type: 'error', text: 'TRANSMISSION FAILED. VERIFY SYSTEM AUTHENTICATION.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="h-96 flex items-center justify-center"><RefreshCw className="animate-spin h-8 w-8 text-primary" /></div>;

    const InputField = ({ label, name, type = "text", placeholder }) => (
        <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-600 pl-1">{label}</Label>
            <Input
                name={name}
                type={type}
                value={settings[name] ?? ''}
                onChange={handleChange}
                placeholder={placeholder}
                className="rounded-xl border border-slate-100 bg-slate-50/50 font-bold focus:border-primary transition-all text-sm h-12 px-4"
            />
        </div>
    );

    const ToggleField = ({ label, name }) => (
        <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl group hover:border-primary transition-all shadow-sm">
            <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">{label}</p>
                <p className="text-[10px] font-bold text-primary tracking-wide">Module Active</p>
            </div>
            <button
                type="button"
                onClick={() => handleToggle(name)}
                className={`w-12 h-6 rounded-full transition-all relative ${settings[name] === '1' ? 'bg-primary' : 'bg-slate-200'}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings[name] === '1' ? 'right-1' : 'left-1'}`}></div>
            </button>
        </div>
    );

    return (
        <div className="w-full space-y-12 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full w-fit border border-primary/10">
                        <Settings className="h-3 w-3 text-primary" />
                        <span className="text-primary text-[10px] font-black uppercase tracking-widest">System Engine</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                        Site <span className="text-primary">Settings.</span>
                    </h1>
                </div>

                <Button onClick={handleSubmit} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 font-bold text-sm tracking-tight transition-all active:scale-95 flex items-center gap-3">
                    {isSaving ? <RefreshCw className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                    Save Preferences
                </Button>
            </div>

            {message.text && (
                <div className={`p-6 rounded-2xl shadow-sm border font-bold text-xs uppercase tracking-widest flex items-center gap-4 ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-primary/5 border-primary/10 text-primary'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-primary text-white'}`}>
                        {message.type === 'success' ? <ShieldCheck className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                    </div>
                    {message.text}
                </div>
            )}

            <Tabs defaultValue="identity" className="w-full">
                <TabsList className="w-full justify-start rounded-2xl bg-slate-100/50 border border-slate-100 h-auto p-1.5 gap-2 overflow-x-auto no-scrollbar">
                    <TabsTrigger value="identity" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-[11px] font-bold uppercase tracking-wider transition-all">Identity</TabsTrigger>
                    <TabsTrigger value="branding" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-[11px] font-bold uppercase tracking-wider transition-all">Aesthetics</TabsTrigger>
                    <TabsTrigger value="modules" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-[11px] font-bold uppercase tracking-wider transition-all">Features</TabsTrigger>
                    <TabsTrigger value="business" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-[11px] font-bold uppercase tracking-wider transition-all">Commerce</TabsTrigger>
                    <TabsTrigger value="dealers" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-[11px] font-bold uppercase tracking-wider transition-all">Partner Pricing</TabsTrigger>
                    <TabsTrigger value="contact" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-[11px] font-bold uppercase tracking-wider transition-all">Contact</TabsTrigger>
                </TabsList>

                <div className="pt-10">
                    {/* IDENTITY TAB */}
                    <TabsContent value="identity" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid md:grid-cols-2 gap-10">
                            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3"><Globe className="h-4 w-4 text-primary" /> Web Protocol</CardTitle></CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <InputField label="Website Name" name="website_title" placeholder="VIET SHOP..." />
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-600 pl-1">Global Tagline</Label>
                                        <Input name="description" value={settings.description ?? ''} onChange={handleChange} className="rounded-xl border border-slate-100 bg-slate-50/50 font-bold focus:border-primary transition-all text-sm h-12 px-4" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-600 pl-1">About Us Description</Label>
                                        <Textarea name="about_content" value={settings.about_content ?? ''} onChange={handleChange} className="rounded-2xl border border-slate-100 bg-slate-50/50 font-bold min-h-[150px] text-sm p-4 focus:border-primary transition-all" />
                                    </div>
                                    <InputField label="Copyright Notice" name="copyright_text" />
                                </CardContent>
                            </Card>
                            <div className="space-y-6">
                                <div className="p-10 bg-slate-900 rounded-[2rem] text-white space-y-6 relative overflow-hidden group shadow-2xl">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                                    <ShieldCheck className="h-12 w-12 text-primary" />
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight mb-2">Platform Identity</h3>
                                        <p className="text-slate-200 text-sm font-medium leading-relaxed">
                                            These basic settings define your website's soul and how it's perceived by search engines and customers alike.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* BRANDING TAB */}
                    <TabsContent value="branding" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid md:grid-cols-2 gap-10">
                            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3"><ImageIcon className="h-4 w-4 text-primary" /> Visual Assets</CardTitle></CardHeader>
                                <CardContent className="p-8 space-y-10">
                                    <div className="space-y-4">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-600">Main Logo</Label>
                                        <div className="flex items-center gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-50">
                                            <div className="w-24 h-24 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-4">
                                                {settings.logo_url && <img src={settings.logo_url.startsWith('http') ? settings.logo_url : `${IMAGE_BASE_URL}${settings.logo_url}`} className="max-h-full mix-blend-multiply" alt="Logo" />}
                                            </div>
                                            <div className="space-y-2">
                                                <input type="file" onChange={(e) => setLogoFile(e.target.files[0])} className="text-[10px] font-bold tracking-wide" id="logo-upload" />
                                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Recommended: 400x120 SVG or PNG</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-6 border-t border-slate-100">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-600">Favicon</Label>
                                        <div className="flex items-center gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-50">
                                            <div className="w-16 h-12 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center p-2">
                                                {settings.favicon_url && <img src={`${IMAGE_BASE_URL}${settings.favicon_url}`} className="max-h-full" alt="Favicon" />}
                                            </div>
                                            <input type="file" onChange={(e) => setFaviconFile(e.target.files[0])} className="text-[10px] font-bold tracking-wide" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3"><Palette className="h-4 w-4 text-primary" /> Design System</CardTitle></CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-600">Brand Color</Label>
                                        <div className="flex gap-6 items-center bg-slate-50 p-4 rounded-2xl">
                                            <div className="w-16 h-16 rounded-xl shadow-2xl border-4 border-white shrink-0" style={{ backgroundColor: globalSettings?.primary_color || '#3b82f6' }}></div>
                                            <div className="w-full">
                                                <InputField name="primary_color" placeholder="#3b82f6" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-6 border-t border-slate-100">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-600">Typography</Label>
                                        <select
                                            name="primary_font"
                                            value={settings.primary_font || 'Inter'}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-4 font-bold focus:border-primary transition-all text-sm outline-none shadow-sm"
                                        >
                                            {['Inter', 'Outfit', 'Montserrat', 'Poppins', 'Roboto', 'Playfair Display', 'Oswald'].map(font => (
                                                <option key={font} value={font}>{font}</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase mt-3 px-1 italic">Real-time interface synchronization active.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* MODULES TAB */}
                    <TabsContent value="modules" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3"><Layout className="h-4 w-4 text-primary" /> Feature Management</CardTitle></CardHeader>
                            <CardContent className="p-10">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <ToggleField label="Hero Banner Section" name="show_hero" />
                                    <ToggleField label="Product Categories" name="show_categories" />
                                    <ToggleField label="Whishlist Feature" name="show_wishlist" />
                                    <ToggleField label="Company Values Area" name="show_why_us" />
                                    <ToggleField label="Trust & Reviews Node" name="show_reviews" />
                                    <ToggleField label="Partner Logo Strip" name="show_brands" />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* BUSINESS TAB */}
                    <TabsContent value="business" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3"><Briefcase className="h-4 w-4 text-primary" /> Strategic Finance</CardTitle></CardHeader>
                            <CardContent className="p-10">
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <InputField label="Currency Symbol" name="currency_symbol" />
                                    <InputField label="Standard Tax (%)" name="tax_percentage" type="number" />
                                    <InputField label="Static Shipping" name="shipping_charges" type="number" />
                                    <InputField label="GST Registration ID" name="gst_number" />
                                </div>
                                <div className="pt-10 border-t border-slate-100 mt-10 space-y-8">
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Payment Architecture</h4>
                                    <div className="grid md:grid-cols-2 gap-10">
                                        <InputField label="Razorpay Account Key" name="razorpay_key_id" placeholder="rzp_test_..." />
                                        <InputField label="Secret Protection Key" name="razorpay_key_secret" type="password" placeholder="secret_..." />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* DEALER MATRIX TAB */}
                    <TabsContent value="dealers" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid md:grid-cols-2 gap-10">
                            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> Tier Logic</CardTitle></CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <InputField label="Tier 1 (Silver) Discount %" name="dealer_tier_1_discount" type="number" placeholder="0" />
                                    <InputField label="Tier 2 (Gold) Discount %" name="dealer_tier_2_discount" type="number" placeholder="5" />
                                    <InputField label="Tier 3 (Platinum) Discount %" name="dealer_tier_3_discount" type="number" placeholder="10" />
                                </CardContent>
                            </Card>
                            <div className="space-y-6">
                                <div className="p-10 bg-primary/5 border border-primary/10 rounded-[2.5rem] text-primary space-y-6">
                                    <RefreshCw className="h-12 w-12 text-primary" />
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight mb-2">Automated Pricing</h3>
                                        <p className="text-slate-700 text-sm font-medium leading-relaxed">
                                            Discounts are applied dynamically based on user category. This ensures your high-volume partners always see their custom negotiated rates.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* CONTACT TAB */}
                    <TabsContent value="contact" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid md:grid-cols-2 gap-10">
                            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> Direct Channels</CardTitle></CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <InputField label="Physical Office" name="contact_address" />
                                    <InputField label="Support Hotline" name="mobile_number" />
                                    <InputField label="Inquiry Email" name="email_id" />
                                    <InputField label="WhatsApp Connect" name="whatsapp_number" />
                                </CardContent>
                            </Card>
                            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3"><Share2 className="h-4 w-4 text-primary" /> Social Presence</CardTitle></CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <InputField label="Facebook Link" name="social_facebook" />
                                    <InputField label="Instagram Link" name="social_instagram" />
                                    <InputField label="X (Twitter) Link" name="social_twitter" />
                                    <InputField label="LinkedIn Link" name="social_linkedin" />
                                </CardContent>
                            </Card>
                            
                            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden md:col-span-2">
                                <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> Automated Emails (SMTP)</CardTitle></CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <InputField label="SMTP Host Server" name="smtp_host" placeholder="mail.torvotools.com" />
                                        <InputField label="SMTP Port" name="smtp_port" placeholder="465 or 587" />
                                        <InputField label="Email Username" name="smtp_user" placeholder="info@torvotools.com" />
                                        <InputField label="Email Password" name="smtp_pass" type="password" placeholder="••••••••" />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-3 px-1 italic">Configure these settings to enable automated order receipts and system notifications.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default SiteSettings;
