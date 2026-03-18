import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  File as FileIcon,
  Package,
  ArrowUpDown,
  History,
  ShieldCheck,
  Zap,
  Box,
  Trash2,
  Edit3,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/api";
import ProductForm from "../../components/ProductForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSettings } from '../../contexts/SettingsContext';
import { getImageUrl } from "../../lib/utils";
import { IMAGE_BASE_URL } from '../../services/api';
import { Link } from "react-router-dom";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { settings } = useSettings();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      // Handle both paginated and non-paginated responses
      const data = response.data.data ? response.data.data : response.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        setError("Failed to delete product.");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setError(""); // Reset previous errors
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      fetchProducts();
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Technical Save Failure:", err);
      let serverMessage = err.response?.data?.message || "Operational link failure. Verification required.";

      if (err.response?.data?.missing_fields) {
        serverMessage += ` Missing: ₹{err.response.data.missing_fields.join(", ")}`;
      }

      setError(serverMessage);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Cinematic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Box className="h-4 w-4 text-primary" />
            <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-normal">Resource Management</span>
          </div>
          <h1 className="text-4xl font-extrabold font-semibold tracking-tight text-slate-900 leading-none">
            Inventory <br /> <span className="text-primary text-gradient">Command.</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" className="btn-outline-sleek h-10 px-5">
            <FileIcon className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={handleAdd} className="btn-primary-sleek h-10 px-5 group">
            <PlusCircle className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90" /> Initialize Asset
          </Button>
        </div>
      </div>

      {/* Logic Filter Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="SEARCH INVENTORY BY ASSET NAME OR SKU..."
            className="w-full bg-white border border-slate-100 p-5 pl-14 font-extrabold text-xs tracking-wide focus:outline-none focus:border-primary transition-all shadow-sm text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-2 border border-slate-100 shadow-inner">
          <div className="flex items-center gap-2 px-4 text-[9px] font-extrabold tracking-wide text-slate-400">
            <Zap className="h-3 w-3 text-primary" /> Status Filter
          </div>
          {['Active', 'Archived'].map(s => (
            <button key={s} className="px-4 py-2 text-[10px] font-extrabold tracking-wide bg-white border border-slate-100 text-slate-900 hover:text-primary transition-all shadow-sm">{s}</button>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 rounded-none border-none overflow-hidden shadow-2xl">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-full bg-primary opacity-10 -skew-x-12 translate-x-12"></div>
            <DialogTitle className="text-3xl font-extrabold font-semibold tracking-tight text-white">
              {selectedProduct ? "Modify Asset" : "Initialize Asset"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-bold tracking-wide text-[10px] mt-2">
              {selectedProduct ? `Updating Technical Node: ₹{selectedProduct.id}` : "Configure New Industrial Equipment Module"}
            </DialogDescription>
          </div>
          <div className="p-8 bg-white max-h-[80vh] overflow-y-auto custom-scrollbar">
            {error && (
              <div className="bg-red-50 border border-red-100 p-4 mb-8">
                <div className="text-red-600 text-[10px] font-extrabold tracking-wide flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 animate-pulse rounded-full"></div>
                  Critical Signal Failure: {typeof error === 'object' ? JSON.stringify(error) : error}
                </div>
              </div>
            )}
            <ProductForm
              product={selectedProduct}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Card className="premium-card overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 border-b-2 border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px] py-3 font-extrabold tracking-wide text-[10px] text-slate-400">Visual ID</TableHead>
                <TableHead className="font-extrabold tracking-wide text-[10px] text-slate-400">Asset Designation</TableHead>
                <TableHead className="font-extrabold tracking-wide text-[10px] text-slate-400">Technical Status</TableHead>
                <TableHead className="font-extrabold tracking-wide text-[10px] text-slate-400">Inventory Level</TableHead>
                <TableHead className="font-extrabold tracking-wide text-[10px] text-slate-400">Valuation</TableHead>
                <TableHead className="hidden md:table-cell font-extrabold tracking-wide text-[10px] text-slate-400">Deployment Date</TableHead>
                <TableHead className="text-right font-extrabold tracking-wide text-[10px] text-slate-400">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-3">
                    <div className="w-16 h-11 bg-white border border-slate-100 p-2 overflow-hidden group-hover:border-primary transition-all shadow-sm rounded-sm">
                      <img
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                        src={getImageUrl(product.thumbnail_url || product.image_url, "https://placehold.co/64")}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="space-y-1">
                      <p className="font-extrabold font-semibold tracking-tight text-slate-900 leading-none group-hover:text-primary transition-colors">{product.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 tracking-wide">Sector: {product.category_name || 'N/A'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${product.is_active ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`}></div>
                      <span className={`text-[10px] font-extrabold tracking-wide ${product.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                        {product.is_active ? 'In Service' : 'Archived'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Package className={`h-3 w-3 ${product.stock <= product.low_stock_threshold ? 'text-red-500' : 'text-slate-400'}`} />
                        <span className={`text-sm font-extrabold ${product.stock <= product.low_stock_threshold ? 'text-red-600' : 'text-slate-900'}`}>
                          {product.stock}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 tracking-wide">Units</span>
                      </div>
                      {product.stock <= product.low_stock_threshold && (
                        <div className="inline-block bg-red-50 text-red-600 text-[8px] font-extrabold tracking-wide px-2 py-0.5 border border-red-100">
                          Low Stock Alert
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-extrabold text-slate-900">{settings?.currency_symbol}{parseFloat(product.price).toFixed(2)}</p>
                      {product.dealer_price && <p className="text-[8px] font-bold text-primary tracking-wide">Dealer: {settings?.currency_symbol}{product.dealer_price}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-wide bg-slate-50 px-3 py-1.5 rounded-full w-fit">
                      <History className="h-3 w-3 text-primary" /> {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(product)}
                        className="h-9 w-9 rounded-none border-slate-100 text-slate-400 hover:bg-primary hover:text-slate-900 hover:border-primary transition-all shadow-sm"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="h-9 w-9 rounded-none border-slate-100 text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="h-9 w-9 rounded-none border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                      >
                        <Link to={`/product/${product.id}`}><ExternalLink className="h-4 w-4" /></Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t border-slate-100 py-3 px-4">
          <div className="flex items-center gap-4 text-[10px] font-extrabold tracking-wide text-slate-400">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Displaying <span className="text-slate-900 font-extrabold">{filteredProducts.length}</span> verified industrial modules
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProductManagement;
