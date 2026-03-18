import { useEffect, useState } from "react";
import { getProjects, createProject } from "../services/api";
import {
    Briefcase,
    MapPin,
    Plus,
    CheckCircle2,
    Clock,
    Search,
    ChevronRight,
    HardHat,
    LayoutGrid,
    Activity,
    Calendar,
    Layers,
    MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../contexts/AuthContext";
import React from 'react';

const ProjectManager = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
        site_location: "",
        project_status: "active"
    });

    useEffect(() => {
        fetchProjects();
        window.scrollTo(0, 0);
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await getProjects();
            setProjects(response.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await createProject(newProject);
            setIsCreateModalOpen(false);
            setNewProject({ name: "", description: "", site_location: "", project_status: "active" });
            fetchProjects();
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-primary text-white';
            case 'completed': return 'bg-green-500 text-white';
            case 'on-hold': return 'bg-amber-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="bg-white min-h-screen page-header-padding">
            {/* Project Hub Header */}
            <section className="bg-slate-900 py-20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-10 -skew-x-12 translate-x-1/2"></div>
                <div className="container-custom relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-primary">
                                <HardHat className="h-5 w-5" />
                                <span className="text-[10px] font-bold uppercase tracking-normal">Multi-Site Logistics Interface</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold font-semibold tracking-tight leading-none">
                                Job Site <br /> <span className="text-primary text-gradient">Projects.</span>
                            </h1>
                            <p className="text-gray-400 text-sm font-bold tracking-wide max-w-xl leading-relaxed">
                                Group your industrial procurement by specific deployment sites and technical phases.
                            </p>
                        </div>

                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-11 px-4 rounded-none bg-primary text-white font-bold tracking-wide text-xs hover:bg-white hover:text-primary transition-all">
                                    <Plus className="mr-2 h-5 w-5" /> Initialize New Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-none sm:max-w-[500px] bg-white">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold font-semibold tracking-tight">New Project Manifest</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateProject} className="space-y-6 pt-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold tracking-wide text-slate-400">Project Title</Label>
                                        <Input
                                            value={newProject.name}
                                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                            className="rounded-none border border-slate-100 focus:border-primary uppercase font-bold"
                                            placeholder="E.G., NORTHERN HUB PHASE 2"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold tracking-wide text-slate-400">Site Location</Label>
                                        <Input
                                            value={newProject.site_location}
                                            onChange={(e) => setNewProject({ ...newProject, site_location: e.target.value })}
                                            className="rounded-none border border-slate-100 focus:border-primary font-bold"
                                            placeholder="GPS COORDS OR PHYSICAL ADDRESS..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold tracking-wide text-slate-400">Technical Brief</Label>
                                        <Textarea
                                            value={newProject.description}
                                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                            className="rounded-none border border-slate-100 focus:border-primary h-32"
                                            placeholder="DESCRIBE PROJECT SCOPE..."
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-10 bg-slate-900 text-white font-bold tracking-wide">Commission Project</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </section>

            <main className="container-custom py-16">
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((p) => (
                            <div key={p.id} className="bg-white border border-slate-100 hover:border-primary transition-all duration-500 group shadow-sm hover:shadow-2xl flex flex-col justify-between">
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-slate-50 border border-slate-100 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                                            <Layers className="h-6 w-6 text-primary" />
                                        </div>
                                        <span className={`px-2 py-1 text-[7px] font-bold tracking-wide ${getStatusColor(p.project_status)}`}>
                                            {p.project_status}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {user?.role === 'admin' && (
                                            <p className="text-[8px] font-bold text-primary uppercase tracking-normal">Partner: {p.owner_name}</p>
                                        )}
                                        <h3 className="text-xl font-bold text-slate-900 font-semibold tracking-tight leading-tight">{p.name}</h3>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin className="h-3 w-3" />
                                            <span className="text-[9px] font-bold uppercase tracking-wider">{p.site_location || 'REMOTE HUB'}</span>
                                        </div>
                                    </div>

                                    <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed line-clamp-2">
                                        {p.description || 'NO PROJECT SCOPE DEFINED. UPDATE MANIFEST FOR TECHNICAL CLARITY.'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-bold text-slate-400 tracking-wide">Active Orders</p>
                                            <p className="text-base font-medium text-slate-900">{p.order_count || 0}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-bold text-slate-400 tracking-wide">Deployments</p>
                                            <p className="text-base font-medium text-slate-900">{p.shipment_count || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 pb-8">
                                    <Button variant="outline" className="w-full h-9 rounded-none border border-slate-100 font-bold tracking-wide text-[9px] hover:border-primary hover:text-primary transition-all">
                                        Enter Project Command <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center border border-dashed border-slate-100 space-y-6 text-center">
                        <div className="bg-slate-50 p-10 block rounded-full"><LayoutGrid className="h-11 w-16 text-slate-200" /></div>
                        <div className="max-w-md space-y-2">
                            <h3 className="text-2xl font-bold text-slate-900 font-semibold tracking-tight">No Projects Commissioned</h3>
                            <p className="text-[10px] font-bold text-slate-400 tracking-wide leading-relaxed">
                                You currently have no job-site projects. Group your orders by Commissioning your first project portal.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProjectManager;
