import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  File as FileIcon,
} from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/api";
import CategoryForm from "../../components/CategoryForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { IMAGE_BASE_URL } from "../../services/api";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(response.data);
    } catch (err) {
      setError("Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (err) {
        setError("Failed to delete category.");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setError(""); // Clear previous errors
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      fetchCategories();
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      const message = err.response?.data?.message || "Failed to save category. Technical linkage error.";
      setError(message);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold font-semibold tracking-tight text-slate-900">Catalog <span className="text-primary">Hierarchy.</span></h1>
          <p className="text-[10px] font-extrabold uppercase tracking-normal text-slate-500">Logic Core: Organization // Depth Level: N-Tier</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" className="h-10 gap-2 border-slate-200 hover:bg-slate-50 uppercase text-[10px] font-extrabold tracking-widest transition-all">
            <FileIcon className="h-3.5 w-3.5" />
            Export Map
          </Button>
          <Button size="sm" className="btn-primary-sleek h-10 gap-2" onClick={handleAdd}>
            <PlusCircle className="h-3.5 w-3.5" />
            Initialize Node
          </Button>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-slate-100 shadow-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b border-slate-50">
            <DialogTitle className="text-2xl font-extrabold font-semibold tracking-tight text-slate-900">
              {selectedCategory ? "Calibrate Category" : "Build Category"}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold tracking-wide text-slate-400">
              {selectedCategory
                ? "Modifying existing hierarchical parameters."
                : "Generating a new classification entity in the system registry."}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-none">
              <p className="text-red-600 text-[10px] font-extrabold tracking-wide flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 animate-pulse rounded-full"></div>
                Critical Failure: {error}
              </p>
            </div>
          )}
          <CategoryForm
            category={selectedCategory}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Card className="premium-card overflow-hidden">
        <CardHeader className="border-b border-slate-50 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-sm font-extrabold uppercase tracking-normal text-slate-900">Registry Ledger</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total registered classifications: {categories.length}</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              <Input
                type="search"
                placeholder="Filter classifications..."
                className="pl-9 h-10 w-full md:w-[300px] bg-slate-50 border-none rounded-none text-[11px] font-bold tracking-wide focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-50">
                <TableHead className="w-[100px] text-[10px] font-extrabold tracking-wide text-slate-400 py-2.5 pl-8">Visual ID</TableHead>
                <TableHead className="text-[10px] font-extrabold tracking-wide text-slate-400 py-2.5">Nomenclature</TableHead>
                <TableHead className="text-[10px] font-extrabold tracking-wide text-slate-400 py-2.5">Lineage Path</TableHead>
                <TableHead className="text-right text-[10px] font-extrabold tracking-wide text-slate-400 py-2.5 pr-8">Operative Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id} className="group border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <TableCell className="py-2 pl-8">
                    <div className="w-12 h-9 bg-white border border-slate-100 p-1.5 rounded-lg overflow-hidden transition-all group-hover:border-primary shadow-sm">
                      <img
                        src={category.image_url && category.image_url.startsWith('http') ? category.image_url : (category.image_url ? `${IMAGE_BASE_URL}${category.image_url}` : 'https://placehold.co/64')}
                        alt={category.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="text-sm font-extrabold tracking-tight text-slate-900 uppercase group-hover:text-primary transition-colors">{category.name}</span>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${category.parent_id ? 'bg-slate-300' : 'bg-primary animate-pulse'}`}></div>
                      <span className={`text-[10px] font-bold tracking-wide ${category.parent_id ? 'text-slate-400' : 'text-primary'}`}>
                        {categories.find(c => String(c.id) === String(category.parent_id))?.name || 'ROOT LEVEL'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2 pr-8">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 flex px-3 gap-2 text-[10px] font-bold tracking-wide text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                        onClick={() => handleEdit(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 flex px-3 gap-2 text-[10px] font-bold tracking-wide text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        onClick={() => handleDelete(category.id)}
                      >
                        Purge
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t border-slate-50 py-3 bg-slate-50/20">
          <div className="text-[10px] font-bold uppercase tracking-normal text-slate-400">
            System Synchronized // Showing <strong>1-{filteredCategories.length}</strong> of <strong>{categories.length}</strong> Entities
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CategoryManagement;
