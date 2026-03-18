import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct, createRfq, getReviews, submitReview } from "../services/api";
import { CartContext } from "../contexts/CartContext";
import { AuthContext } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { getImageUrl, formatCurrency } from "../lib/utils";
import RfqForm from "../components/RfqForm";
import ProductCard from "../components/ProductCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShoppingCart, FileText, ChevronRight, ShieldCheck, Truck, RotateCcw, Star, MessageSquare, Send, User, Box, TrendingDown, Share2, Zap, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Product = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const calculatePrice = () => {
    if (!product) return 0;
    let basePrice = parseFloat(product.price);
    const tiers = product.bulk_pricing_json ? JSON.parse(product.bulk_pricing_json) : [];

    // Find the highest tier that matches the current quantity
    const activeTier = tiers
      .filter(t => quantity >= t.min_qty)
      .sort((a, b) => b.min_qty - a.min_qty)[0];

    if (activeTier) {
      return basePrice * (1 - (parseFloat(activeTier.discount) / 100));
    }
    return basePrice;
  };

  const getCurrentTier = () => {
    if (!product || !product.bulk_pricing_json) return null;
    const tiers = JSON.parse(product.bulk_pricing_json);
    return tiers
      .filter(t => quantity >= t.min_qty)
      .sort((a, b) => b.min_qty - a.min_qty)[0];
  };
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { settings, loading: settingsLoading } = useSettings();

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchProductData = async () => {
    try {
      const response = await getProduct(id);
      if (response && response.data) {
        setProduct(response.data);
        if (user && user.role === "dealer" && response.data?.min_order_quantity) {
          setQuantity(response.data.min_order_quantity);
        }
      }
    } catch (err) {
      setError("Failed to fetch product details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductReviews = async () => {
    try {
      const response = await getReviews(id);
      setReviews(response.data || []);
    } catch (err) {
      console.error("Failed to fetch reviews");
    }
  };

  useEffect(() => {
    fetchProductData();
    fetchProductReviews();
    window.scrollTo(0, 0);
  }, [id, user]);

  const handleAddToCart = () => {
    if (user && user.role === "dealer" && quantity < (product?.min_order_quantity || 1)) {
      alert(`Min order: ${product?.min_order_quantity}`);
      return;
    }
    addToCart(product, quantity);
  };

  const handleRfqSubmit = async (rfqData) => {
    try {
      await createRfq(rfqData);
      setIsRfqModalOpen(false);
      alert("RFQ Submitted!");
    } catch (err) {
      setError("Failed to submit RFQ.");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to leave a review.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await submitReview({
        product_id: id,
        rating: newRating,
        comment: newComment
      });
      setNewComment("");
      setNewRating(5);
      fetchProductReviews();
      alert("Review submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading || settingsLoading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product not found.</div>;

  let price = product?.price;
  if (user && user.role === "dealer") {
    const baseDealerPrice = product?.dealer_price || product?.price;
    const tier = user.tier || 1;
    const discountPercent = parseFloat(settings[`dealer_tier_${tier}_discount`] || 0);
    price = baseDealerPrice * (1 - discountPercent / 100);
  }
  const priceDisplay = price ? formatCurrency(price, settings?.currency_symbol, settings?.locale) : "Price on Request";

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="bg-white min-h-screen page-header-padding">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-2 flex items-center gap-2 text-xs font-bold tracking-wide text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-secondary">{product.name}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Product Image Section */}
          <div className="space-y-6">
            <div className="aspect-square bg-gray-50 border border-gray-100 overflow-hidden group">
              <img
                src={getImageUrl(product?.image_url)}
                alt={product?.name}
                className="w-full h-full object-contain mix-blend-multiply p-12 transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-50 border border-gray-100 cursor-pointer hover:border-primary transition-colors">
                  <img src={getImageUrl(product?.image_url)} className="w-full h-full object-contain p-2 opacity-50 hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="inline-block bg-primary/10 text-primary text-[10px] font-bold tracking-wide px-3 py-1">
                  {product.category_name}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-[10px] font-bold">{averageRating}</span>
                  <span className="text-[10px] font-bold text-gray-400">({reviews.length} Reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-[8px] font-bold tracking-wide text-secondary bg-gray-100 border border-gray-200 px-2 py-1">
                  <Settings className="h-3 w-3 text-primary" />
                  {product.condition_status || "Standard Grade"}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary leading-none font-semibold tracking-tight">
                {product.name}
              </h1>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-extrabold text-secondary tracking-tight">
                    {formatCurrency(calculatePrice(), settings)}
                  </p>
                  {user && user.role === 'dealer' && (
                    <span className="text-[10px] font-bold uppercase bg-secondary text-white px-2 py-1 flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" /> Tier Rate Applied
                    </span>
                  )}
                </div>
                {getCurrentTier() && (
                  <p className="text-[10px] font-bold text-primary tracking-wide animate-pulse">
                    Bulk Volume Discount Active: {getCurrentTier().discount}% OFF
                  </p>
                )}
              </div>
            </div>

            {/* Bulk Pricing Grid for Dealers */}
            {user && user.role === 'dealer' && product.bulk_pricing_json && (
              <div className="bg-slate-50 border border-slate-100 p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Box className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-bold tracking-wide text-slate-900">Volume Procurement Tiers</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {JSON.parse(product.bulk_pricing_json).map((tier, idx) => (
                    <div key={idx} className={`p-4 border transition-all ${quantity >= tier.min_qty ? 'bg-white border-primary shadow-lg scale-105' : 'bg-transparent border-slate-200 opacity-60'}`}>
                      <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">{tier.min_qty}+ UNITS</p>
                      <p className="text-base font-medium text-secondary tracking-tighter">{tier.discount}% OFF</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-gray-600 leading-relaxed text-lg max-w-xl">
              {product.description}
            </p>

            <div className="space-y-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-[10px] font-bold tracking-wide">Quantity</Label>
                  <div className="flex items-center border border-secondary overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-100 font-bold">-</button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="w-16 text-center font-bold focus:outline-none"
                    />
                    <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-gray-100 font-bold">+</button>
                  </div>
                </div>
                {user && user.role === "dealer" && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold tracking-wide">Minimum Order</p>
                    <div className="h-11 flex items-center px-4 bg-secondary text-white font-bold">{product.min_order_quantity} Units</div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleAddToCart} className="flex-1 h-10 btn-primary-industrial">
                  <ShoppingCart className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                  Add to Cart
                </Button>

                {(!user || user.role !== "dealer") && (
                  <Button
                    onClick={() => {
                      handleAddToCart();
                      navigate('/checkout');
                    }}
                    className="flex-1 h-10 bg-slate-900 border border-slate-900 text-white hover:bg-black font-bold tracking-widest uppercase text-[10px]"
                  >
                    <Zap className="mr-2 h-4 w-4 fill-white" />
                    Buy Now
                  </Button>
                )}

                {user && user.role === "dealer" && (
                  <Dialog open={isRfqModalOpen} onOpenChange={setIsRfqModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex-1 h-10 btn-outline-industrial group">
                        <FileText className="mr-2 h-5 w-5" />
                        Get Custom Quote
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-none sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold font-semibold tracking-tight">Bulk Order Inquiry</DialogTitle>
                      </DialogHeader>
                      <RfqForm
                        product={product}
                        onSubmit={handleRfqSubmit}
                        onCancel={() => setIsRfqModalOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => {
                    const text = `Check out this technical equipment: ${product.name} at ${window.location.origin}/product/${product.id}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  variant="outline"
                  className="w-full h-10 border-slate-200 text-slate-500 hover:text-primary hover:border-primary transition-all rounded-none font-bold text-[10px] tracking-widest uppercase"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Request Peer Consultation (Share)
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
              <div className="flex flex-col items-center p-4 bg-gray-50 border border-gray-100 text-center space-y-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="text-[10px] font-bold font-semibold tracking-tight">Certified Quality</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 border border-gray-100 text-center space-y-2">
                <Truck className="h-6 w-6 text-primary" />
                <span className="text-[10px] font-bold font-semibold tracking-tight">Fast Express</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 border border-gray-100 text-center space-y-2">
                <RotateCcw className="h-6 w-6 text-primary" />
                <span className="text-[10px] font-bold font-semibold tracking-tight">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Extended Info Tabs */}
        <div className="mt-24">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-gray-100 h-auto p-0 gap-8">
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm font-bold tracking-wide pb-4 transition-all">Specifications</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm font-bold tracking-wide pb-4 transition-all">Technical Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="py-8">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold uppercase">Product Overview</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-bold uppercase">Technical Specification Grid</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border-l-2 border-primary bg-gray-50">
                      <p className="text-[10px] uppercase font-bold text-gray-500">Asset Category</p>
                      <p className="font-bold text-secondary uppercase">{product.category_name}</p>
                    </div>
                    <div className="p-4 border-l-2 border-primary bg-gray-50">
                      <p className="text-[10px] uppercase font-bold text-gray-500">Inventory SKU</p>
                      <p className="font-bold text-secondary uppercase">TRV-{product.id}-TOOL</p>
                    </div>
                    {product.specifications && (() => {
                      try {
                        const specs = JSON.parse(product.specifications);
                        return specs.map((spec, i) => (
                          <div key={i} className="p-4 border-l-2 border-primary bg-gray-50">
                            <p className="text-[10px] uppercase font-bold text-gray-500">{spec.key}</p>
                            <p className="font-bold text-secondary uppercase">{spec.value}</p>
                          </div>
                        ));
                      } catch (e) {
                        return null;
                      }
                    })()}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="py-8">
              <div className="grid lg:grid-cols-12 gap-16">
                {/* Review List */}
                <div className="lg:col-span-7 space-y-10">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="space-y-4 border-b border-gray-100 pb-10 last:border-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 flex items-center justify-center font-bold text-secondary border border-gray-200 uppercase">
                              {review.user_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold font-semibold tracking-tight text-secondary">{review.user_name}</p>
                              <p className="text-[9px] font-bold text-gray-400 tracking-wide">{new Date(review.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-primary text-primary' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-6">
                          "{review.comment || 'Performance meets industrial expectations.'}"
                        </p>
                        <div className="flex items-center gap-2 text-[8px] font-bold tracking-wide text-green-600 bg-green-50 px-2 py-1 w-max">
                          <ShieldCheck className="h-3 w-3" /> Verified Industrial Buyer
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center border border-dashed border-gray-100 space-y-4">
                      <MessageSquare className="h-9 w-12 text-gray-200 mx-auto" />
                      <p className="text-xs font-bold tracking-wide text-gray-400">No technical feedback available yet</p>
                    </div>
                  )}
                </div>

                {/* Review Submission */}
                <div className="lg:col-span-5">
                  <div className="bg-gray-50 p-10 border border-gray-100 space-y-8 sticky top-32">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold font-semibold tracking-tight text-secondary">Submit Feedback</h3>
                      <p className="text-gray-500 font-medium text-xs tracking-wide">Technical Performance Assessment</p>
                    </div>

                    {user ? (
                      <form onSubmit={handleReviewSubmit} className="space-y-6">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-normal text-gray-400">Rating Grade</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setNewRating(s)}
                                className="p-1 transition-transform hover:scale-125"
                              >
                                <Star className={`h-6 w-6 ${s <= newRating ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-normal text-gray-400">Technical Comment</Label>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full bg-white border border-gray-100 p-4 font-bold text-sm focus:outline-none focus:border-primary transition-all min-h-[120px] uppercase"
                            placeholder="DESCRIBE OPERATIONAL EXPERIENCE..."
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="w-full h-10 btn-secondary-industrial group"
                        >
                          {isSubmittingReview ? "Transmitting..." : "Submit Protocol"}
                          <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Button>
                      </form>
                    ) : (
                      <div className="space-y-6 text-center">
                        <p className="text-xs font-bold text-gray-500 tracking-wide leading-relaxed">
                          Authentication required to submit performance feedback.
                        </p>
                        <Button asChild className="w-full h-10 btn-primary-industrial">
                          <Link to="/login">Authorized Sign In</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Complementary Equipment (Parts/Acc) */}
        {(product?.spare_parts?.length > 0 || product?.accessories?.length > 0) && (
          <div className="mt-24 space-y-12">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-secondary">Complementary <span className="text-primary italic">Systems.</span></h2>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Technical Compatibility</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {product.spare_parts?.map((part) => (
                <ProductCard key={part.id} product={part} />
              ))}
              {product.accessories?.map((acc) => (
                <ProductCard key={acc.id} product={acc} />
              ))}
            </div>
          </div>
        )}

        {/* General Related Products (You may also like) */}
        {product?.related_products?.length > 0 && (
          <div className="mt-24 space-y-12">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-secondary">You May Also <span className="text-primary italic">Require.</span></h2>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discovery</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {product.related_products.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Product;
