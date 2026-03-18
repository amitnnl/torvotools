import { useState, useContext } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Bell,
  Home,
  ShoppingCart,
  Package,
  Users,
  LineChart,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  File,
  Tag,
  Star,
  LayoutGrid,
  FileText,
  Newspaper,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AuthContext } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { IMAGE_BASE_URL } from "../../services/api";


const mainNavItems = [
  { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/analytics", icon: LineChart, label: "Analytics" },
];

const catalogNavItems = [
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/categories", icon: LayoutGrid, label: "Categories" },
  { to: "/admin/brands", icon: Star, label: "Brands" },
];

const customerNavItems = [
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/dealers", icon: Users, label: "Dealers" },
];

const marketingNavItems = [
  { to: "/admin/banners", icon: File, label: "Banners" },
  { to: "/admin/coupons", icon: Tag, label: "Coupons" },
];

const contentNavItems = [
  { to: "/admin/pages", icon: FileText, label: "Pages" },
  { to: "/admin/posts", icon: Newspaper, label: "Posts" },
  { to: "/admin/features", icon: Zap, label: "Features" },
  { to: "/admin/menus", icon: Menu, label: "Menus" },
];

const settingsNavItems = [
  { to: "/admin/settings", icon: Settings, label: "Settings" },
]


const NavItem = ({ to, icon: Icon, label, isSidebarOpen }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 mx-2 my-0.5 transition-all duration-300 relative group rounded-xl ${isActive
        ? "bg-primary/10 text-primary font-bold shadow-sm"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      } ${isSidebarOpen ? "" : "justify-center"}`
    }
  >
    <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${isSidebarOpen ? "" : "h-5 w-5"}`} />
    <span className={`${isSidebarOpen ? "block" : "hidden"} text-xs tracking-tight font-bold`}>{label}</span>
  </NavLink>
);


const NewAdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useContext(AuthContext);
  const { settings, loading } = useSettings();

  const getLogo = (isMobile = false) => {
    if (loading) return null;
    if (settings?.logo_url) {
      return <img src={`${IMAGE_BASE_URL}${settings.logo_url}`} alt="Logo" className="h-8 w-auto" />;
    }
    return <span className={`font-black tracking-tighter text-slate-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>VIET <span className="text-primary tracking-normal font-medium">SHOP</span></span>;
  };

  return (
    <div className={`grid min-h-screen w-full bg-[#fcfcfd] ${isSidebarOpen ? 'md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]' : 'md:grid-cols-[80px_1fr]'} transition-all duration-500`}>
      <aside
        className={`hidden border-r border-slate-100 bg-white md:block transition-all duration-300`}
      >
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center justify-between border-b border-slate-50 px-6">
            <Link to="/admin/dashboard" className="flex items-center gap-2 font-semibold">
              {isSidebarOpen ? (
                getLogo()
              ) : (
                <div className="bg-primary/10 p-2 rounded-xl text-primary"><Package className="h-6 w-6" /></div>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-900"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-6 px-2">
            <nav className="grid items-start text-sm font-medium">
              {mainNavItems.map(item => <NavItem key={item.to} {...item} isSidebarOpen={isSidebarOpen} />)}
              <h3 className={`mt-8 mb-3 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 ${isSidebarOpen ? 'block' : 'hidden'}`}>Catalog</h3>
              {catalogNavItems.map(item => <NavItem key={item.to} {...item} isSidebarOpen={isSidebarOpen} />)}
              <h3 className={`mt-8 mb-3 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 ${isSidebarOpen ? 'block' : 'hidden'}`}>Marketing</h3>
              {marketingNavItems.map(item => <NavItem key={item.to} {...item} isSidebarOpen={isSidebarOpen} />)}
              <h3 className={`mt-8 mb-3 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 ${isSidebarOpen ? 'block' : 'hidden'}`}>Users</h3>
              {customerNavItems.map(item => <NavItem key={item.to} {...item} isSidebarOpen={isSidebarOpen} />)}
              <h3 className={`mt-8 mb-3 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 ${isSidebarOpen ? 'block' : 'hidden'}`}>Content</h3>
              {contentNavItems.map(item => <NavItem key={item.to} {...item} isSidebarOpen={isSidebarOpen} />)}
              <h3 className={`mt-8 mb-3 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 ${isSidebarOpen ? 'block' : 'hidden'}`}>System</h3>
              {settingsNavItems.map(item => <NavItem key={item.to} {...item} isSidebarOpen={isSidebarOpen} />)}
            </nav>
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-slate-100 bg-white/80 backdrop-blur-md px-8 lg:h-16 sticky top-0 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden text-slate-600 rounded-xl"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-white border-none p-4 w-72 shadow-2xl">
              <div className="p-4 mb-6 border-b border-slate-50">
                {getLogo(true)}
              </div>
              <nav className="grid gap-1">
                {mainNavItems.map(item => <NavItem key={item.to} {...item} isSidebarOpen={true} />)}
                <h3 className="mt-6 mb-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Sections</h3>
                {catalogNavItems.map(item => <NavItem key={item.to} {...item} isSidebarOpen={true} />)}
                {marketingNavItems.map(item => <NavItem key={item.to} {...item} isSidebarOpen={true} />)}
                {customerNavItems.map(item => <NavItem key={item.to} {...item} isSidebarOpen={true} />)}
                {contentNavItems.map(item => <NavItem key={item.to} {...item} isSidebarOpen={true} />)}
                {settingsNavItems.map(item => <NavItem key={item.to} {...item} isSidebarOpen={true} />)}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1 luxury-title text-sm font-bold text-slate-600 hidden md:block uppercase tracking-widest">Administrator Node</div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:text-primary transition-colors">
                  <Bell className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl w-80 p-4 animate-in zoom-in-95 duration-200">
                <DropdownMenuLabel className="text-xs font-black uppercase tracking-widest text-slate-600 mb-2">Live Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="py-4 px-2 text-center">
                  <p className="text-sm font-bold text-slate-600">System nodes fully optimized.</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-full border border-slate-100 px-3 h-10 hover:bg-slate-50 transition-all">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black uppercase shadow-sm">{user?.name?.charAt(0)}</div>
                  <ChevronDown className="h-3 w-3 text-slate-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl w-64 p-2 animate-in slide-in-from-top-2 duration-200">
                <DropdownMenuLabel className="px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Session Active</p>
                  <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-50 mx-2" />
                <DropdownMenuItem asChild className="rounded-xl py-3 px-4 focus:bg-primary/5 focus:text-primary mb-1 cursor-pointer">
                  <Link to="/profile" className="font-bold text-xs uppercase tracking-tight flex items-center gap-3"><Users className="h-4 w-4" /> Account Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl py-3 px-4 focus:bg-primary/5 focus:text-primary mb-1 cursor-pointer">
                  <Link to="/" className="font-bold text-xs uppercase tracking-tight flex items-center gap-3"><Home className="h-4 w-4" /> Public view</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50 mx-2" />
                <DropdownMenuItem onClick={logout} className="rounded-xl py-3 px-4 focus:bg-red-50 text-red-500 font-black text-xs uppercase tracking-widest cursor-pointer">Terminate Session</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-8 lg:p-12 bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default NewAdminLayout;
