import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCategory, getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import { ChevronRight, Search, LayoutGrid, X } from "lucide-react";

const Category = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          getCategory(id),
          getProducts({ category_id: id })
        ]);
        setCategory(catRes.data);
        const data = prodRes.data.data ? prodRes.data.data : prodRes.data;
        setProducts(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!category) return <div className="h-screen flex items-center justify-center">Sector not found.</div>;

  return (
    <div className="bg-white min-h-screen page-header-padding">
      {/* Sector Header */}
      <section className="bg-secondary py-20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 translate-x-1/2"></div>
        <div className="container-custom relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-normal text-primary">
              <Link to="/">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/products">Catalog</Link>
              <ChevronRight className="h-3 w-3" />
              <span>{category.name}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-semibold tracking-tight leading-none">
              {category.name} <br /> <span className="text-primary text-gradient">Inventory.</span>
            </h1>
            <p className="text-gray-400 text-base font-medium max-w-2xl leading-relaxed tracking-wide">
              Specialized technical equipment for the {category.name} sector.
            </p>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-8">
             <div className="flex items-center gap-4">
                <LayoutGrid className="h-5 w-5 text-primary" />
                <p className="text-[10px] font-bold tracking-wide text-gray-400">
                  {products.length} Assets Identified in this Module
                </p>
             </div>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                   <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center border border-dashed border-gray-100 space-y-6">
               <div className="bg-gray-50 p-6 rounded-full">
                  <X className="h-9 w-12 text-gray-200" />
               </div>
               <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold font-semibold tracking-tight text-secondary">Inventory Depleted</h3>
                  <p className="text-gray-400 font-medium tracking-wide text-[10px]">No equipment is currently active in the {category.name} sector.</p>
               </div>
               <Link to="/products" className="text-sm font-bold tracking-wide text-primary hover:underline">Return to Global Catalog</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Category;
