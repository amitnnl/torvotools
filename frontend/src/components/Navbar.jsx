import React, { useContext, useState, useEffect, useCallback, memo } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, ShoppingCart, User, Search, Package, LogOut, ChevronDown, ChevronRight, ShieldPlus, Heart, X, History, Briefcase, FileText, MessageSquare, BarChart3, Truck, FileSpreadsheet, HardHat, Brain
} from "lucide-react";

import { AuthContext } from "../contexts/AuthContext";
import { CartContext } from "../contexts/CartContext";
import { WishlistContext } from "../contexts/WishlistContext";
import { useSettings } from "../contexts/SettingsContext";
import { IMAGE_BASE_URL, getProducts } from "../services/api";
import { getImageUrl } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NotificationBell from "./NotificationBell";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = memo(() => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const { settings, loading: settingsLoading } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const productsCached = React.useRef(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && !productsCached.current) {
      const fetchAllProducts = async () => {
        try {
          const res = await getProducts({ limit: 100 });
          const data = res.data.data ? res.data.data : res.data;
          setAllProducts(data || []);
          productsCached.current = true;
        } catch (e) { console.error(e); }
      }
      fetchAllProducts();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else { setSuggestions([]); }
  }, [searchQuery, allProducts]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  }, [searchQuery, navigate]);

  const navLinks = [
    { to: "/", text: "Home" },
    { to: "/categories", text: "Categories" },
    { to: "/products", text: "Products" },
    { to: "/about", text: "About Us" },
    { to: "/contact", text: "Contact" },
  ];

  const isLightOnTop = isHomePage && !isScrolled;
  const textColor = isLightOnTop ? 'text-white' : 'text-slate-900';
  const navBg = isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-100/50' : (isHomePage ? 'bg-transparent' : 'bg-white border-b border-slate-100/50');

  const getLogo = () => {
    if (settings?.logo_url) {
      const logoSrc = settings.logo_url.startsWith('http') ? settings.logo_url : `${IMAGE_BASE_URL}${settings.logo_url}`;
      return (
        <img
          src={logoSrc}
          alt={settings?.website_title || "Logo"}
          loading="lazy"
          className={`h-9 w-auto transition-all duration-300 ${isLightOnTop ? 'brightness-100 invert' : ''}`}
        />
      );
    }
    return (
      <div className="flex flex-col leading-none">
        <span className={`text-xl md:text-2xl font-black tracking-tight ${textColor}`}>
          {settings?.website_title?.split(' ')[0] || "Viet"} <span className="text-primary">{settings?.website_title?.split(' ').slice(1).join(' ') || "Shop"}</span>
        </span>
        <span className={`text-[9px] font-bold uppercase tracking-widest ${isLightOnTop ? 'text-white/80' : 'text-slate-600'}`}>{settings?.description || "Online Store"}</span>
      </div>
    );
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] h-20 flex items-center transition-all duration-500 ${navBg}`}>
        <div className="container-custom flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            {getLogo()}
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-[13px] font-bold uppercase tracking-wider transition-all relative py-2 ${isActive ? 'text-primary' : (isLightOnTop ? 'text-white hover:text-white font-medium' : 'text-slate-700 hover:text-slate-900')}`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.text}
                    {isActive && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full transition-all"></span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-3">
            <button onClick={() => setIsSearchOpen(true)} className={`p-2 rounded-full hover:bg-slate-100/10 transition-all ${isLightOnTop ? 'text-white hover:text-primary' : 'text-slate-500 hover:text-primary'}`}>
              <Search className="h-5 w-5" />
            </button>

            <Link to="/wishlist" className="relative p-2 group rounded-full">
              <Heart className={`h-5 w-5 transition-all ${isLightOnTop ? 'text-white hover:text-primary' : 'text-slate-500 hover:text-primary'} ${wishlist?.length > 0 ? 'fill-primary text-primary' : ''}`} />
              {wishlist?.length > 0 && <span className="absolute top-1 right-1 bg-primary text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">{wishlist.length}</span>}
            </Link>

            <Link to="/cart" className="relative p-2 group rounded-full">
              <ShoppingCart className={`h-5 w-5 transition-all ${isLightOnTop ? 'text-white hover:text-primary' : 'text-slate-500 hover:text-primary'}`} />
              {cart.length > 0 && <span className="absolute top-1 right-1 bg-primary text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>}
            </Link>

            {user && <NotificationBell />}

            <div className="hidden md:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={`flex items-center gap-2 h-10 px-3 rounded-full border transition-all ${isLightOnTop ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-100 bg-slate-50/50 text-slate-900 hover:bg-slate-50'}`}>
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black uppercase shadow-sm">{user.name.charAt(0)}</div>
                      <span className="text-xs font-bold">{user.role}</span>
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 bg-white/95 backdrop-blur-xl text-slate-900 border-slate-100 p-2 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                    <DropdownMenuLabel className="px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Account Info</p>
                      <p className="text-sm font-bold truncate text-slate-900 uppercase tracking-tight">{user.name}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-50 mx-2" />
                    <DropdownMenuItem asChild className="focus:bg-primary/5 focus:text-primary py-3 px-4 cursor-pointer rounded-xl mb-1">
                      <Link to="/profile" className="flex items-center gap-3 font-bold text-xs uppercase tracking-tight"><User className="h-4 w-4 opacity-90" /> My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-primary/5 focus:text-primary py-3 px-4 cursor-pointer rounded-xl mb-1">
                      <Link to="/orders" className="flex items-center gap-3 font-bold text-xs uppercase tracking-tight"><Package className="h-4 w-4 opacity-70" /> My Orders</Link>
                    </DropdownMenuItem>
                    {(user.role === 'dealer' || user.role === 'admin') && (
                      <div className="my-1 py-1 border-t border-slate-50">
                        <DropdownMenuItem asChild className="focus:bg-primary/5 focus:text-primary py-3 px-4 cursor-pointer rounded-xl">
                          <Link to="/rfqs" className="flex items-center gap-3 font-bold text-xs uppercase tracking-tight text-slate-700"><MessageSquare className="h-4 w-4 opacity-90" /> Inquiries</Link>
                        </DropdownMenuItem>
                      </div>
                    )}
                    {user.role === 'admin' && <DropdownMenuItem asChild className="focus:bg-primary/5 focus:text-primary py-3 px-4 cursor-pointer rounded-xl bg-primary/5 text-primary"><Link to="/admin" className="flex items-center gap-3 font-bold text-xs uppercase tracking-tight"><ShieldPlus className="h-4 w-4" /> Admin Console</Link></DropdownMenuItem>}
                    <DropdownMenuSeparator className="bg-slate-50 mx-2" />
                    <DropdownMenuItem onClick={logout} className="focus:bg-red-50 py-3 px-4 cursor-pointer text-red-500 font-black text-xs uppercase tracking-widest rounded-xl">Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" className={`h-10 px-5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${isLightOnTop ? 'text-white hover:bg-white/10' : 'text-slate-900 hover:bg-slate-50'}`}>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="h-10 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all">
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={`lg:hidden rounded-full ${textColor}`}><Menu className="h-6 w-6" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white/95 backdrop-blur-xl text-slate-900 border-none p-0 w-[85%] shadow-2xl">
                <div className="p-10 space-y-12 h-screen flex flex-col justify-between">
                  <div className="space-y-12">
                    <div className="flex items-center justify-between">
                      {getLogo()}
                    </div>
                    <nav className="flex flex-col gap-6">
                      {navLinks.map((link) => (
                        <Link key={link.to} to={link.to} className="text-2xl font-black text-slate-900 hover:text-primary transition-all flex items-center justify-between group uppercase tracking-tight">
                          {link.text} <ChevronRight className="h-6 w-6 opacity-40 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-primary" />
                        </Link>
                      ))}
                    </nav>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex flex-col gap-6">
                    <Link to="/track-order" className="text-sm font-bold text-slate-600 flex items-center gap-3 uppercase tracking-widest">
                      <Truck className="h-5 w-5" /> Track Package
                    </Link>
                    {!user && (
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <Link to="/login" className="bg-slate-50 py-4 px-6 rounded-2xl text-center font-bold text-xs uppercase tracking-widest text-slate-900 border border-slate-100">Login</Link>
                        <Link to="/register" className="bg-primary py-4 px-6 rounded-2xl text-center font-bold text-xs uppercase tracking-widest text-white shadow-xl shadow-primary/20">Join Now</Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Search Overlay - Light Mode */}
      <div className={`fixed inset-0 z-[200] bg-white/95 backdrop-blur-3xl transition-all duration-700 ${isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <button onClick={() => setIsSearchOpen(false)} className="absolute top-10 right-10 text-slate-400 hover:text-primary transition-all p-4 hover:scale-110"><X className="h-10 w-10" /></button>
        <div className="container-custom h-full flex flex-col items-center justify-center">
          <div className="w-full max-w-5xl space-y-16">
            <div className="text-center space-y-4">
              <span className="text-primary text-xs font-black uppercase tracking-[0.3em]">Search products</span>
              <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.85]">FIND WHAT <br /> <span className="text-primary">YOU NEED.</span></h2>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative group max-w-3xl mx-auto w-full">
              <input
                autoFocus={isSearchOpen}
                type="text"
                placeholder="Product name or category..."
                className="w-full bg-slate-50 rounded-full border border-slate-100 py-10 px-12 text-2xl md:text-4xl font-bold tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-primary hover:bg-primary/90 text-white shadow-2xl">
                <Search className="h-7 w-7" />
              </Button>
            </form>

            <div className="w-full max-w-3xl mx-auto">
              <div className="space-y-4">
                {suggestions.length > 0 && (
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6">Suggestions</p>
                )}
                <div className="grid gap-4">
                  {suggestions.map(p => (
                    <Link key={p.id} to={`/product/${p.id}`} onClick={() => { setIsSearchOpen(false); setSearchTerm(""); }} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all group shadow-sm hover:shadow-xl">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-12 bg-white flex items-center justify-center p-2 rounded-xl border border-slate-50"><img src={getImageUrl(p.image_url)} className="max-h-full mix-blend-multiply transition-transform group-hover:scale-110" /></div>
                        <div>
                          <p className="font-bold text-lg text-slate-900 tracking-tight leading-tight">{p.name}</p>
                          <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">{p.category_name}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default Navbar;
