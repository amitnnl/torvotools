import { useState, useEffect } from "react";
import api, { IMAGE_BASE_URL } from "@/services/api";
import Slider from 'react-slick';
import { ShieldCheck } from "lucide-react";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const TrustedBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await api.get('/brands');
        setBrands(response.data.filter(brand => brand.logo_url) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 4000,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: 'linear',
    pauseOnHover: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 600, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } }
    ]
  };

  if (loading || brands.length === 0) return null;

  return (
    <section className="bg-white py-12 border-y border-gray-100 overflow-hidden">
      <div className="container-custom mb-8">
        <div className="flex flex-col items-center text-center space-y-4">
           <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-normal">Authorized Network</span>
           </div>
           <h2 className="text-4xl md:text-5xl font-bold font-semibold tracking-tight text-secondary">
              Strategic <span className="text-primary">Partners.</span>
           </h2>
           <div className="h-1 w-12 bg-primary"></div>
        </div>
      </div>

      <div className="brand-ticker">
        <Slider {...sliderSettings}>
          {brands.map((brand) => (
            <div key={brand.id} className="px-12 outline-none">
              <div className="h-20 flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 group">
                <img
                  src={`${IMAGE_BASE_URL}${brand.logo_url}`}
                  alt={brand.name}
                  className="max-h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          ))}
        </Slider>
      </div>
      
      {/* Reverse Ticker for more dynamic feel if many brands */}
      {brands.length > 5 && (
        <div className="mt-12 opacity-60">
           <Slider {...{...sliderSettings, rtl: true}}>
            {brands.slice().reverse().map((brand) => (
              <div key={`rev-${brand.id}`} className="px-12 outline-none">
                <div className="h-20 flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 group">
                  <img
                    src={`${IMAGE_BASE_URL}${brand.logo_url}`}
                    alt={brand.name}
                    className="max-h-10 w-auto object-contain group-hover:scale-110 transition-all"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}
    </section>
  );
};

export default TrustedBrands;
