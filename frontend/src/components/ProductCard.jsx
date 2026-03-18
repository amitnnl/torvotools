import { useContext, memo } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { WishlistContext } from "../contexts/WishlistContext";
import { getImageUrl, formatCurrency } from "../lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { ArrowRight, ArrowUpRight, Box, Heart, Share2 } from "lucide-react";

// Performance Optimization: Wrap in memo to prevent unnecessary re-renders in large lists
const ProductCard = memo(({ product }) => {
  const { user } = useContext(AuthContext);
  const { settings } = useSettings();
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  let price = product.price;
  if (user && user.role === "dealer") {
    const baseDealerPrice = product.dealer_price || product.price;
    const tier = user.tier || 1;
    const discountPercent = parseFloat(settings[`dealer_tier_${tier}_discount`] || 0);
    price = baseDealerPrice * (1 - discountPercent / 100);
  }
  const priceDisplay = price ? formatCurrency(price, settings?.currency_symbol, settings?.locale) : "Enquire for Price";

  const isFavorite = isInWishlist(product.id);

  return (
    <div className="group relative bg-white border border-slate-100 rounded transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden">
      {/* Visual Identity Strip */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-50 group-hover:bg-primary transition-colors duration-500"></div>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        {/* Wishlist Toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="p-2.5 bg-white/80 backdrop-blur-md border border-slate-100 rounded-sm transition-all duration-300 hover:bg-white hover:shadow-lg group/heart block"
        >
          <Heart className={`h-4 w-4 transition-all ${isFavorite ? 'fill-primary text-primary' : 'text-slate-400 group-hover/heart:text-primary'}`} />
        </button>

        {/* Share Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            const text = `Check out this technical equipment: ${product.name} at ${window.location.origin}/product/${product.id}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          }}
          className="p-2.5 bg-white/80 backdrop-blur-md border border-slate-100 rounded-sm transition-all duration-300 hover:bg-white hover:shadow-lg group/share block"
        >
          <Share2 className="h-4 w-4 text-slate-400 group-hover/share:text-primary transition-all" />
        </button>
      </div>

      <Link to={`/product/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-[#fcfcfc] p-10">
          <img
            src={getImageUrl(product.thumbnail_url || product.image_url, "https://placehold.co/400")}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400";
            }}
          />

          {/* Status Badges */}
          <div className="absolute top-6 left-0 space-y-2">
            {product.is_new && (
              <div className="bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-r-full shadow-lg shadow-primary/20 tracking-wide">
                New Arrival
              </div>
            )}
            {user && user.role === "dealer" && (
              <div className="bg-slate-900 text-white text-[10px] font-bold px-4 py-1.5 rounded-r-full shadow-lg tracking-wide">
                Dealer Authorized
              </div>
            )}
          </div>

          {/* Quick Action Overlay */}
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-500 flex items-center justify-center">
            <div className="bg-white p-4 shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full border border-slate-100">
              <ArrowUpRight className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Info Area */}
        <div className="p-8 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-wide text-primary">{product.category_name || "General Selection"}</p>
            <h3 className="text-base font-medium tracking-tight text-slate-900 leading-tight line-clamp-2 min-h-[3rem]">
              {product.name}
            </h3>
          </div>

          <div className="pt-4 border-t border-slate-50 flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-slate-400 tracking-wide leading-none">Price</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{priceDisplay}</p>
            </div>
            <div className="h-10 w-10 bg-slate-50 rounded-sm flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
              <Box className="h-4 w-4 text-slate-300 group-hover:text-white" />
            </div>
          </div>
        </div>
      </Link>

      {/* Button Row */}
      <div className="p-4 pt-0">
        <Button asChild className="w-full h-9 btn-primary-sleek text-sm">
          <Link to={`/product/${product.id}`} className="flex items-center justify-center gap-2">
            View Details <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
});

export default ProductCard;
