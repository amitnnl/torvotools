import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingCart, 
  Users, 
  Image as ImageIcon, 
  Ticket, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { to: "/admin/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Command Deck" },
    { to: "/admin/products", icon: <Package className="h-4 w-4" />, label: "Inventory" },
    { to: "/admin/categories", icon: <Layers className="h-4 w-4" />, label: "Categories" },
    { to: "/admin/orders", icon: <ShoppingCart className="h-4 w-4" />, label: "Order Logic" },
    { to: "/admin/dealers", icon: <Users className="h-4 w-4" />, label: "Partner Network" },
    { to: "/admin/banners", icon: <ImageIcon className="h-4 w-4" />, label: "Hero Media" },
    { to: "/admin/coupons", icon: <Ticket className="h-4 w-4" />, label: "Campaigns" },
    { to: "/admin/settings", icon: <Settings className="h-4 w-4" />, label: "Core Settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar - LIGHT VERSION */}
      <aside className="hidden md:flex w-72 bg-slate-50 flex-col fixed inset-y-0 z-50 border-r border-slate-100 shadow-sm">
        <div className="p-8 border-b border-slate-100">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="bg-primary p-2 rounded-none transition-transform group-hover:rotate-90 duration-500 shadow-lg">
               <ShieldCheck className="h-5 w-5 text-slate-900" />
            </div>
            <div className="flex flex-col leading-none text-slate-900">
               <span className="text-base font-medium font-semibold tracking-tight">Command</span>
               <span className="text-primary text-[8px] font-bold uppercase tracking-normal">Center Portal</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-8">
          <nav className="px-4 space-y-2">
            <p className="px-4 text-[9px] font-bold uppercase tracking-normal text-slate-400 mb-6">Management Modules</p>
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-4 py-3 text-[11px] font-bold tracking-wide transition-all duration-300 group rounded-none ${
                  isActive(item.to) 
                  ? 'bg-primary text-slate-950 shadow-md border-l-4 border-slate-900' 
                  : 'text-slate-500 hover:text-primary hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  {item.label}
                </div>
                <ChevronRight className={`h-3 w-3 transition-transform ${isActive(item.to) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <Link to="/" className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-normal">
            <LogOut className="h-4 w-4" />
            Terminate Admin Session
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:pl-72 flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-5 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <h2 className="text-xs font-bold uppercase tracking-normal text-slate-900">
                 System Active: <span className="text-primary">{location.pathname.split('/').pop() || 'Dashboard'}</span>
              </h2>
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-bold font-semibold tracking-tight text-slate-900 leading-none">Global Controller</p>
                 <p className="text-[8px] font-bold text-slate-400 tracking-wide mt-1">Status: Authorized</p>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-none border border-slate-200 flex items-center justify-center font-bold text-slate-900 shadow-inner">
                 A
              </div>
           </div>
        </header>

        <main className="p-8 lg:p-12">
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
