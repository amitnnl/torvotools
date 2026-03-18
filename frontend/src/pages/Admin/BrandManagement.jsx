import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
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
import api from "../../services/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import BrandForm from "@/components/BrandForm";
import { Reorder } from "framer-motion";
import { IMAGE_BASE_URL } from "../../services/api";

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await api.get("/brands");
      setBrands(response.data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };
  
  const openDialog = (brand = null) => {
    setCurrentBrand(brand);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentBrand(null);
    fetchBrands();
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await api.delete(`/brands/${id}`);
        fetchBrands();
      } catch (error) {
        console.error("Error deleting brand:", error);
      }
    }
  };

  const handleReorder = async () => {
    try {
        const updatedBrands = brands.map((brand, index) => ({ ...brand, sort_order: index }));
        await api.post('/brands/order', { brands: updatedBrands });
        fetchBrands();
    } catch (error) {
        console.error("Error saving brand order:", error);
    }
};

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Brands</h1>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleReorder}>
                Save Order
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1" onClick={() => openDialog()}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Brand
                </span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>
                    {currentBrand ? "Edit Brand" : "Add Brand"}
                </DialogTitle>
                <DialogDescription>
                    {currentBrand ? "Edit the details of the brand." : "Add a new brand to your store."}
                </DialogDescription>
                </DialogHeader>
                <BrandForm brand={currentBrand} onClose={closeDialog} />
            </DialogContent>
            </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Brands</CardTitle>
          <CardDescription>
            Manage your brands. Drag and drop to reorder.
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search brands..."
                className="pl-8 sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] sm:table-cell">Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <Reorder.Group as="tbody" values={brands} onReorder={setBrands}>
              {filteredBrands.map((brand) => (
                <Reorder.Item as="tr" key={brand.id} value={brand}>
                  <TableCell className="hidden sm:table-cell">
                    <img
                      src={brand.logo_url && brand.logo_url.startsWith('http') ? brand.logo_url : (brand.logo_url ? `${IMAGE_BASE_URL}${brand.logo_url}` : "https://placehold.co/100x50")}
                      alt={brand.name}
                      className="h-9 w-24 object-contain rounded-md bg-white p-1"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openDialog(brand)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(brand.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{filteredBrands.length}</strong> of <strong>{filteredBrands.length}</strong>{" "}
            brands
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BrandManagement;
