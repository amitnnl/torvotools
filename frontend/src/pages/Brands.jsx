import { useState, useEffect } from "react";
import { getBrands, IMAGE_BASE_URL } from "../services/api";
import { ShieldCheck, ChevronRight, Globe, Award, Factory } from "lucide-react";
import { Link } from "react-router-dom";

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandsData = async () => {
      try {
        const response = await getBrands();
        setBrands(response.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrandsData();
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-white min-h-screen page-header-padding">
      {/* Visual Header - LIGHT THEME */}
      <section className="bg-slate-50 border-b border-slate-100 py-24 text-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-primary opacity-5 -skew-x-12 translate-x-1/2"></div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-4">
               <div className="h-[2px] w-12 bg-primary"></div>
               <span className="text-primary text-xs font-bold uppercase tracking-normal">The Elite Network</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-semibold tracking-tight leading-none text-slate-900">
              Strategic <br /> <span className="text-primary text-gradient">Partners.</span>
            </h1>
            <p className="text-slate-500 text-base font-medium leading-relaxed max-w-xl">
              We exclusively distribute professional equipment from the world's most trusted industrial manufacturers.
            </p>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {brands.map((brand) => (
              <div key={brand.id} className="group bg-white border border-slate-100 p-12 space-y-8 hover:border-primary transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-2xl">
                <div className="absolute top-0 left-0 w-1 h-0 bg-primary group-hover:h-full transition-all duration-500"></div>
                
                <div className="h-24 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-700 p-4">
                  <img
                    src={brand.logo_url ? (brand.logo_url.startsWith('http') ? brand.logo_url : `${IMAGE_BASE_URL}${brand.logo_url}`) : 'https://placehold.co/200x100?text=BRAND'}
                    alt={brand.name}
                    className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="space-y-4 text-center">
                  <h3 className="text-2xl font-bold font-semibold tracking-tight text-slate-900 group-hover:text-primary transition-colors">{brand.name}</h3>
                  <div className="h-1 w-12 bg-slate-100 mx-auto group-hover:bg-primary transition-colors"></div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    Authorized distribution partner providing tier-1 technical support and factory-direct inventory for all {brand.name} assets.
                  </p>
                </div>

                <div className="pt-6 flex flex-col gap-4">
                   <div className="flex items-center justify-center gap-6 text-[9px] font-bold tracking-wide text-slate-400">
                      <span className="flex items-center gap-2"><Globe className="h-3 w-3 text-primary" /> Global Support</span>
                      <span className="flex items-center gap-2"><Award className="h-3 w-3 text-primary" /> Tier-1 Partner</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="bg-slate-50 border-y border-slate-100 py-24">
         <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-8">
                  <div className="space-y-4">
                     <h2 className="text-4xl font-bold font-semibold tracking-tight text-slate-900 leading-none">Authorized <br /> <span className="text-primary">Compliance Protocol.</span></h2>
                     <p className="text-slate-500 font-medium leading-relaxed">Every brand within the Torvo Network is verified for industrial standard compliance and authentic distribution rights.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="bg-white p-6 border border-slate-200 flex flex-col gap-3 shadow-sm">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                        <p className="text-[10px] font-bold tracking-wide text-slate-900">Anti-Counterfeit Guard</p>
                     </div>
                     <div className="bg-white p-6 border border-slate-200 flex flex-col gap-3 shadow-sm">
                        <Factory className="h-8 w-8 text-primary" />
                        <p className="text-[10px] font-bold tracking-wide text-slate-900">Direct-from-Factory</p>
                     </div>
                  </div>
               </div>
               <div className="relative aspect-video overflow-hidden border-[10px] border-white shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover grayscale opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="bg-primary p-10 shadow-2xl">
                        <ShieldCheck className="h-11 w-16 text-white" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Brands;
