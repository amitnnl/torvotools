import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../services/api";
import { IMAGE_BASE_URL } from "../services/api";
import { Button } from "@/components/ui/button";
import { ChevronRight, Layers } from "lucide-react";

const ExploreCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return null;

  return (
    <section className="bg-[#f8f8f8] section-padding overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-gray-400 text-xs font-bold uppercase tracking-normal">Sector Logic</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-semibold tracking-tight text-secondary leading-none">
              Shop by <br /> <span className="text-primary">Category.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category, index) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className={`group relative block h-[400px] overflow-hidden ${index % 2 === 1 ? 'lg:translate-y-8' : ''}`}
            >
              <img
                src={category.image_url ? (category.image_url.startsWith('http') ? category.image_url : `${IMAGE_BASE_URL}${category.image_url}`) : 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop'}
                alt={category.name}
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-secondary/40 group-hover:bg-secondary/10 transition-colors duration-500"></div>

              {/* Content */}
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="space-y-4">
                  <p className="text-primary group-hover:text-secondary text-[10px] font-bold uppercase tracking-normal opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">Explore Module</p>
                  <h3 className="text-2xl font-bold text-primary font-semibold tracking-tight leading-none group-hover:text-secondary transition-colors">{category.name}</h3>
                  <div className="h-1 w-12 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </div>

              {/* Decorative Number */}
              <div className="absolute top-10 right-10 text-white/10 font-bold text-6xl tracking-tighter">0{index + 1}</div>
            </Link>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center text-center space-y-8">
          <p className="text-gray-400 font-bold tracking-wide text-xs">Access the full technical inventory across all industrial sectors.</p>
          <Button asChild className="btn-secondary-sleek h-11 px-12">
            <Link to="/categories" className="flex items-center gap-3">
              View All Sectors <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ExploreCategories;
