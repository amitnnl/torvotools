import React, { useState, useEffect } from "react";
import { getNotifications, markAsRead } from "../services/api";
import { Bell, AlertTriangle, Info, CheckCircle2, X, Clock } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const response = await getNotifications();
            const data = response.data || [];
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />;
            case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 group transition-all text-slate-500 hover:text-primary">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-primary text-white text-[8px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white border-slate-100 p-0 rounded shadow-2xl z-[200]">
                <DropdownMenuLabel className="p-6 flex items-center justify-between bg-slate-50 border-b border-slate-100 round-t-2xl">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-normal text-primary">System Overlink</p>
                        <h3 className="text-sm font-bold text-slate-900 font-semibold tracking-tight">Communications</h3>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0 bg-transparent" />
                <div className="max-h-[400px] overflow-y-auto overflow-x-hidden divide-y divide-slate-50">
                    {notifications.length > 0 ? (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`p-6 transition-all group relative ${n.is_read ? 'opacity-50' : 'bg-primary/5'}`}
                            >
                                <div className="flex gap-4">
                                    <div className="mt-1">{getIcon(n.type)}</div>
                                    <div className="space-y-2 flex-1">
                                        <p className="text-[10px] font-bold tracking-wide text-slate-900">{n.title}</p>
                                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed tracking-wide">{n.message}</p>
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase">
                                                <Clock className="h-3 w-3" />
                                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {!n.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                    className="text-[8px] font-bold tracking-wide text-primary hover:underline"
                                                >
                                                    Acknowledge
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center space-y-4">
                            <CheckCircle2 className="h-8 w-8 text-slate-100 mx-auto" />
                            <p className="text-[10px] font-bold text-slate-300 tracking-wide leading-relaxed">System baseline nominal. <br /> No active alerts detected.</p>
                        </div>
                    )}
                </div>
                {notifications.length > 0 && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                        <button className="w-full text-[9px] font-bold tracking-wide text-slate-400 hover:text-primary transition-colors">
                            Archive All Communications
                        </button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
