import React, { useEffect, useState } from 'react';
import { getProducts, getCategories, getBrands, IMAGE_BASE_URL } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  ArrowUpDown, 
  IndianRupee, 
  Search, 
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedBrand, setSelectedBrand] = useState("All");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setPage(1); // Reset to page 1 when filters change
    }, [selectedCategory, selectedBrand, sortBy]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [catRes, brandRes] = await Promise.all([
                    getCategories(),
                    getBrands()
                ]);
                setCategories(catRes.data || []);
                setBrands(brandRes.data || []);
            } catch (err) {
                console.error("Failed to fetch filters:", err);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = {
                    search: debouncedSearch,
                    category_id: selectedCategory,
                    brand_id: selectedBrand,
                    sort: sortBy,
                    page: page,
                    limit: 12
                };
                const res = await getProducts(params);
                setProducts(res.data.data || []);
                setTotalPages(res.data.meta.total_pages || 1);
                window.scrollTo(0, 0);
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [debouncedSearch, selectedCategory, selectedBrand, sortBy, page]);

    // Client-side price filtering (since it's usually dynamic on UI)
    const filteredProducts = products.filter(product => {
        const price = parseFloat(product.price);
        const matchesMinPrice = minPrice === "" || price >= parseFloat(minPrice);
        const matchesMaxPrice = maxPrice === "" || price <= parseFloat(maxPrice);
        return matchesMinPrice && matchesMaxPrice;
    });

    if (loading && products.length === 0) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    const FilterSidebar = () => (
        <div className="space-y-12">
            {/* Price Range Filter */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold tracking-wide text-slate-900 border-l-4 border-primary pl-4 flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-primary" /> Price Range
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 tracking-wide">Min</label>
                        <input 
                            type="number" 
                            placeholder="0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 p-3 text-xs font-bold focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 tracking-wide">Max</label>
                        <input 
                            type="number" 
                            placeholder="ANY"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 p-3 text-xs font-bold focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold tracking-wide text-slate-900 border-l-4 border-primary pl-4">Sector Modules</h3>
                <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setSelectedCategory("All")}
                      className={`text-left px-4 py-3 text-[10px] font-bold tracking-wide transition-all border ${selectedCategory === "All" ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-primary'}`}
                    >
                        Global Inventory
                    </button>
                    {categories.map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id.toString())}
                          className={`text-left px-4 py-3 text-[10px] font-bold tracking-wide transition-all border ${selectedCategory === cat.id.toString() ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-primary'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold tracking-wide text-slate-900 border-l-4 border-primary pl-4">Manufacturer</h3>
                <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setSelectedBrand("All")}
                      className={`text-left px-4 py-3 text-[10px] font-bold tracking-wide transition-all border ${selectedBrand === "All" ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-primary'}`}
                    >
                        All Partners
                    </button>
                    {brands.map(brand => (
                        <button 
                          key={brand.id}
                          onClick={() => setSelectedBrand(brand.id.toString())}
                          className={`text-left px-4 py-3 text-[10px] font-bold tracking-wide transition-all border ${selectedBrand === brand.id.toString() ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-primary'}`}
                        >
                            {brand.name}
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={() => {setSearchTerm(""); setSelectedCategory("All"); setSelectedBrand("All"); setMinPrice(""); setMaxPrice(""); setSortBy("newest");}}
                className="w-full py-2 text-[10px] font-bold tracking-wide text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
                Reset System Parameters
            </button>
        </div>
    );

    return (
        <div className="bg-white min-h-screen page-header-padding">
            {/* Header / Search Area - LIGHT THEME */}
            <div className="bg-slate-50 border-b border-slate-100 py-8 text-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/4 h-full bg-primary opacity-5 -skew-x-12 translate-x-1/2"></div>
                <div className="container-custom relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-normal text-primary">
                                <Link to="/">Home</Link>
                                <ChevronRight className="h-3 w-3" />
                                <span>Technical Catalog</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase leading-none text-slate-900">
                                Equipment <br /> <span className="text-primary text-gradient">Search Core.</span>
                            </h1>
                        </div>
                        <div className="relative max-w-md w-full">
                            <input 
                              type="text" 
                              placeholder="IDENTIFY ASSET..."
                              className="w-full bg-white border border-slate-200 p-5 pl-12 text-sm font-bold tracking-wide focus:outline-none focus:border-primary transition-all text-slate-900 shadow-sm"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Listing Area */}
            <div className="container-custom py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b border-slate-100 pb-4 gap-6">
                    <p className="text-[10px] font-bold uppercase tracking-normal text-slate-400">
                        SYSTEM DETECTED: <span className="text-slate-900">{filteredProducts.length}</span> ACTIVE ASSETS
                    </p>
                    
                    <div className="flex items-center gap-4">
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 border border-slate-100 shadow-sm">
                            <ArrowUpDown className="h-4 w-4 text-primary" />
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-[10px] font-bold tracking-wide focus:outline-none text-slate-900 appearance-none cursor-pointer"
                            >
                                <option value="newest">Recent Arrivals</option>
                                <option value="price-low">Value Choice (Low to High)</option>
                                <option value="price-high">Maximum Power (High to Low)</option>
                            </select>
                        </div>

                        {/* Mobile Filter Toggle */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 text-[10px] font-bold tracking-wide border border-slate-900 shadow-lg">
                                        <SlidersHorizontal className="h-4 w-4" /> Parameters
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="bg-white overflow-y-auto w-80 p-8">
                                    <SheetHeader className="mb-12 border-b border-slate-100 pb-6">
                                        <SheetTitle className="text-3xl font-bold font-semibold tracking-tight text-slate-900">Refine Search</SheetTitle>
                                    </SheetHeader>
                                    <FilterSidebar />
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-80 shrink-0">
                        <FilterSidebar />
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {filteredProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {filteredProducts.map(product => (
                                        <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="mt-16 flex items-center justify-center gap-4">
                                        <button 
                                            disabled={page === 1}
                                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                            className="h-9 px-4 border border-slate-100 text-[10px] font-bold tracking-wide hover:border-primary disabled:opacity-30 disabled:hover:border-slate-100 transition-all"
                                        >
                                            Prev Node
                                        </button>
                                        <div className="flex items-center gap-2">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => setPage(i + 1)}
                                                    className={`w-12 h-9 text-[10px] font-bold transition-all border ${page === i + 1 ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-primary'}`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <button 
                                            disabled={page === totalPages}
                                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                            className="h-9 px-4 border border-slate-100 text-[10px] font-bold tracking-wide hover:border-primary disabled:opacity-30 disabled:hover:border-slate-100 transition-all"
                                        >
                                            Next Node
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-[350px] flex flex-col items-center justify-center border-4 border-dashed border-slate-100 space-y-6">
                                <div className="bg-slate-50 p-8 rounded-none shadow-sm">
                                    <X className="h-9 w-12 text-slate-200" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="font-bold tracking-wide text-slate-900">No matching equipment located</p>
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-normal">Adjust your parameters or reset the search core</p>
                                </div>
                                <button 
                                  onClick={() => {setSearchTerm(""); setSelectedCategory("All"); setSelectedBrand("All"); setMinPrice(""); setMaxPrice(""); setSortBy("newest");}}
                                  className="text-[10px] font-bold tracking-wide text-primary hover:underline border-b-2 border-primary pb-1"
                                >
                                    Force Reset All Modules
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
