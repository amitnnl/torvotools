import React, { useState, useEffect } from "react";
import { getCategories, getProducts, getBrands } from "../services/api";
import { getImageUrl } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  IndianRupee,
  ShoppingCart,
  Layers,
  Image as ImageIcon,
  Trash2,
  Link as LinkIcon,
  Cpu,
  ShieldAlert,
  Save,
  X,
  Plus,
  Settings
} from "lucide-react";

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    dealer_price: "",
    min_order_quantity: "1",
    category_id: "",
    brand_id: "",
    initial_stock: "0",
    low_stock_threshold: "10",
    condition_status: "Brand New",
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedSparePartIds, setSelectedSparePartIds] = useState([]);
  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [formError, setFormError] = useState("");
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);

  useEffect(() => {
    if (product) {
      // Prioritize category_id, fallback to category if backend sent it differently
      const catId = product.category_id || product.categoryId || "";
      const brandId = product.brand_id || product.brandId || "";

      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price ? product.price.toString() : "0",
        dealer_price: product.dealer_price ? product.dealer_price.toString() : "",
        min_order_quantity: product.min_order_quantity ? product.min_order_quantity.toString() : "1",
        category_id: catId.toString(),
        brand_id: brandId.toString(),
        initial_stock: product.stock ? product.stock.toString() : "0",
        low_stock_threshold: product.low_stock_threshold ? product.low_stock_threshold.toString() : "10",
        condition_status: product.condition_status || "Brand New",
      });
      setCurrentImageUrl(product.image_url || null);
      setImagePreview(getImageUrl(product.image_url));
      setSelectedSparePartIds(product.spare_parts?.map(sp => sp.id.toString()) || []);
      setSelectedAccessoryIds(product.accessories?.map(acc => acc.id.toString()) || []);

      // Load specifications
      if (product.specifications) {
        try {
          const parsed = JSON.parse(product.specifications);
          if (Array.isArray(parsed)) setSpecifications(parsed);
          else if (typeof parsed === 'object') {
            const arr = Object.entries(parsed).map(([key, value]) => ({ key, value }));
            setSpecifications(arr.length > 0 ? arr : [{ key: "", value: "" }]);
          }
        } catch (e) {
          console.error("Failed to parse specifications", e);
          setSpecifications([{ key: "", value: "" }]);
        }
      } else {
        setSpecifications([{ key: "", value: "" }]);
      }
    }

    const fetchData = async () => {
      try {
        const [categoriesResponse, productsResponse, brandsResponse] = await Promise.all([
          getCategories(),
          getProducts({ limit: 100 }),
          getBrands()
        ]);
        setCategories(categoriesResponse.data);
        setBrands(brandsResponse.data);
        const pData = productsResponse.data.data ? productsResponse.data.data : productsResponse.data;
        setAllProducts(pData.filter(p => p.id !== product?.id));
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const addSpec = () => setSpecifications([...specifications, { key: "", value: "" }]);
  const removeSpec = (index) => setSpecifications(specifications.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.category_id || formData.category_id === "" || formData.category_id === "null") {
      setFormError("Technical Error: Sector Module (Category) link is missing. Operational validation failed.");
      return;
    }

    if (!formData.name || !formData.price || formData.name.trim() === "") {
      setFormError("Mandatory Parameters: Asset name and valuation must be defined.");
      return;
    }

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined && formData[key].toString() !== "null") {
        dataToSend.append(key, formData[key]);
      }
    });

    const validSpecs = specifications.filter(s => s.key.trim() !== "" && s.value.trim() !== "");
    if (validSpecs.length > 0) {
      dataToSend.append("specifications", JSON.stringify(validSpecs));
    }

    if (imageFile) {
      dataToSend.append("image", imageFile);
    } else if (!imagePreview && currentImageUrl) {
      dataToSend.append("image_url_removed", "true");
    }

    selectedSparePartIds.forEach((id) => dataToSend.append("spare_part_ids[]", id));
    selectedAccessoryIds.forEach((id) => dataToSend.append("accessory_ids[]", id));

    onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {formError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700 text-[10px] font-extrabold tracking-wide">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            {formError}
          </div>
        </div>
      )}
      {/* 1. Core Specifications */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-4">
          <Cpu className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-extrabold tracking-wide text-secondary">Asset Parameters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className="text-[10px] font-extrabold tracking-wide text-gray-400">Model Designation</Label>
            <input name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-4 font-bold uppercase text-sm focus:border-primary focus:outline-none transition-all" placeholder="E.G. CORDLESS DRILL XT..." required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold tracking-wide text-gray-400">Sector Module</Label>
              <Select
                value={categories.length > 0 ? (formData.category_id?.toString() || "") : (product?.category_id?.toString() || "")}
                onValueChange={(v) => {
                  if (!v && formData.category_id) {
                    console.warn("DEBUG: Potential Data Loss Prevented. Ignore empty update for Sector.");
                    return;
                  }
                  console.log("Sector Module Interaction. Link ID:", v);
                  setFormData(prev => ({ ...prev, category_id: v }));
                }}
              >
                <SelectTrigger className="rounded-none h-10 border border-gray-100 bg-gray-50 font-bold uppercase text-xs focus:ring-0">
                  <SelectValue placeholder="SECTOR" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-gray-100 shadow-2xl">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()} className="font-bold uppercase text-[10px]">{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold tracking-wide text-gray-400">Brand</Label>
              <Select
                value={brands.length > 0 ? (formData.brand_id?.toString() || "") : (product?.brand_id?.toString() || "")}
                onValueChange={(v) => {
                  if (!v && formData.brand_id) {
                    console.warn("DEBUG: Potential Data Loss Prevented. Ignore empty update for Brand.");
                    return;
                  }
                  console.log("Brand Module Interaction. Link ID:", v);
                  setFormData(prev => ({ ...prev, brand_id: v }));
                }}
              >
                <SelectTrigger className="rounded-none h-10 border border-gray-100 bg-gray-50 font-bold uppercase text-xs focus:ring-0">
                  <SelectValue placeholder="BRAND" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-gray-100 shadow-2xl">
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()} className="font-bold uppercase text-[10px]">{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold tracking-wide text-gray-400">Condition</Label>
              <Select
                value={formData.condition_status}
                onValueChange={(v) => setFormData(prev => ({ ...prev, condition_status: v }))}
              >
                <SelectTrigger className="rounded-none h-10 border border-gray-100 bg-gray-50 font-bold uppercase text-xs focus:ring-0">
                  <SelectValue placeholder="CONDITION" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-gray-100 shadow-2xl">
                  <SelectItem value="Brand New" className="font-bold uppercase text-[10px]">Brand New</SelectItem>
                  <SelectItem value="Certified Refurbished" className="font-bold uppercase text-[10px]">Certified Refurbished</SelectItem>
                  <SelectItem value="Serviceable" className="font-bold uppercase text-[10px]">Serviceable (Used)</SelectItem>
                  <SelectItem value="Parts Only" className="font-bold uppercase text-[10px]">Parts Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-[10px] font-extrabold tracking-wide text-gray-400">Technical Description</Label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-4 font-bold text-sm focus:border-primary focus:outline-none transition-all min-h-[120px] uppercase" placeholder="SPECIFY TECHNICAL CAPABILITIES..." />
          </div>

          <div className="md:col-span-2 space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <Label className="text-[10px] font-extrabold tracking-wide text-gray-400">Technical Specifications Grid</Label>
              <Button type="button" onClick={addSpec} variant="ghost" className="h-6 text-[9px] font-bold tracking-wide text-primary hover:bg-primary/5">
                <Plus className="h-3 w-3 mr-1" /> Add Parameter
              </Button>
            </div>
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-4 items-start group">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <input
                      placeholder="PARAMETER (E.G. POWER)"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                      className="bg-gray-50 border border-gray-100 p-3 font-bold text-[10px] uppercase focus:border-primary focus:outline-none"
                    />
                    <input
                      placeholder="VALUE (E.G. 2000W)"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                      className="bg-gray-50 border border-gray-100 p-3 font-bold text-[10px] uppercase focus:border-primary focus:outline-none"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeSpec(index)}
                    className="h-10 w-10 p-0 text-gray-300 hover:text-red-500 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Commercial Parameters */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-4">
          <IndianRupee className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-extrabold tracking-wide text-secondary">Commercial Core</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <Label className="text-[10px] font-extrabold tracking-wide text-gray-400">Standard Valuation</Label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-4 font-extrabold text-sm focus:border-primary focus:outline-none transition-all" placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-extrabold tracking-wide text-gray-400">Authorized Dealer Rate</Label>
            <input type="number" name="dealer_price" value={formData.dealer_price} onChange={handleInputChange} className="w-full bg-primary/5 border border-primary/10 p-4 font-extrabold text-sm text-primary focus:border-primary focus:outline-none transition-all" placeholder="OPTIONAL" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-extrabold tracking-wide text-gray-400">Min Order Requirement</Label>
            <input type="number" name="min_order_quantity" value={formData.min_order_quantity} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-4 font-extrabold text-sm focus:border-primary focus:outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-extrabold tracking-wide text-gray-400">Inventory Stock Level</Label>
            <input type="number" name="initial_stock" value={formData.initial_stock} onChange={handleInputChange} disabled={!!product} className="w-full bg-gray-50 border border-gray-100 p-4 font-extrabold text-sm focus:border-primary focus:outline-none transition-all disabled:opacity-50" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-extrabold tracking-wide text-gray-400">Low Stock Alert Threshold</Label>
            <input type="number" name="low_stock_threshold" value={formData.low_stock_threshold} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-4 font-extrabold text-sm focus:border-primary focus:outline-none transition-all" />
          </div>
        </div>
      </div>

      {/* 3. Visual Media & Relations */}
      <div className="grid md:grid-cols-2 gap-12 pt-4">
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-4">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-extrabold tracking-wide text-secondary">Media Asset</h3>
          </div>
          <div className="group relative border border-dashed border-gray-200 hover:border-primary transition-all bg-gray-50 flex flex-col items-center justify-center h-64 overflow-hidden">
            {imagePreview ? (
              <>
                <img src={imagePreview} className="w-full h-full object-contain p-8 mix-blend-multiply" />
                <button onClick={() => { setImagePreview(null); setImageFile(null); }} className="absolute top-4 right-4 bg-red-500 text-white p-2 hover:scale-110 transition-transform"><Trash2 className="h-4 w-4" /></button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-white p-4 inline-block shadow-lg border border-gray-100"><ImageIcon className="h-8 w-8 text-gray-300" /></div>
                <p className="text-[10px] font-extrabold tracking-wide text-gray-400">Identify JPG/PNG Asset</p>
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-4">
            <LinkIcon className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-extrabold tracking-wide text-secondary">Linked Modules</h3>
          </div>
          <div className="space-y-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold tracking-wide text-gray-400">Technical Spare Parts</Label>
              <div className="h-40 overflow-y-auto border border-gray-100 bg-gray-50 p-4 custom-scrollbar">
                {allProducts.map(p => (
                  <div key={`sp-${p.id}`} className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0 hover:bg-white transition-colors">
                    <Checkbox id={`sp-${p.id}`} checked={selectedSparePartIds.includes(p.id.toString())} onCheckedChange={(c) => setSelectedSparePartIds(prev => c ? [...prev, p.id.toString()] : prev.filter(id => id !== p.id.toString()))} />
                    <Label htmlFor={`sp-${p.id}`} className="text-[10px] font-bold uppercase tracking-tight text-gray-600 cursor-pointer">{p.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold tracking-wide text-gray-400">Authorized Accessories</Label>
              <div className="h-40 overflow-y-auto border border-gray-100 bg-gray-50 p-4 custom-scrollbar">
                {allProducts.map(p => (
                  <div key={`acc-${p.id}`} className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0 hover:bg-white transition-colors">
                    <Checkbox id={`acc-${p.id}`} checked={selectedAccessoryIds.includes(p.id.toString())} onCheckedChange={(c) => setSelectedAccessoryIds(prev => c ? [...prev, p.id.toString()] : prev.filter(id => id !== p.id.toString()))} />
                    <Label htmlFor={`acc-${p.id}`} className="text-[10px] font-bold uppercase tracking-tight text-gray-600 cursor-pointer">{p.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-12 border-t border-gray-100">
        <div className="flex items-center gap-3 text-red-500 bg-red-50 px-4 py-2 border border-red-100">
          <ShieldAlert className="h-4 w-4" />
          <span className="text-[9px] font-extrabold uppercase tracking-normal">Validated Transaction Required</span>
        </div>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onCancel} className="btn-outline-sleek">
            Terminate
          </Button>
          <Button type="submit" className="btn-primary-sleek">
            <Save className="h-4 w-4 mr-2" /> Commit Asset
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
