import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Zap,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { getFeatures, deleteFeature, updateFeatureOrder } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import FeatureForm from "@/components/FeatureForm";
import { Reorder } from "framer-motion";

const FeatureManagement = () => {
  const [features, setFeatures] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await getFeatures();
      setFeatures(response.data);
    } catch (error) {
      console.error("Error fetching features:", error);
    }
  };
  
  const openDialog = (feature = null) => {
    setCurrentFeature(feature);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentFeature(null);
    fetchFeatures();
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this feature?")) {
      try {
        await deleteFeature(id);
        fetchFeatures();
      } catch (error) {
        console.error("Error deleting feature:", error);
      }
    }
  };

  const handleSaveOrder = async () => {
    try {
        const updatedFeatures = features.map((f, index) => ({ ...f, sort_order: index }));
        await updateFeatureOrder({ features: updatedFeatures });
        alert("Order saved successfully!");
    } catch (error) {
        console.error("Error saving feature order:", error);
    }
  };

  const filteredFeatures = features.filter((f) =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <a href="/admin/dashboard">Dashboard</a>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Features</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search features..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleSaveOrder}>Save Order</Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 gap-1" onClick={() => openDialog()}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Feature
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentFeature ? "Edit Feature" : "Add Feature"}
                </DialogTitle>
                <DialogDescription>
                  Manage the features listed on your homepage.
                </DialogDescription>
              </DialogHeader>
              <FeatureForm feature={currentFeature} onClose={closeDialog} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Features</CardTitle>
          <CardDescription>
            Highlight key features or services. Drag to reorder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <Reorder.Group as="tbody" values={features} onReorder={setFeatures}>
              {filteredFeatures.map((f) => (
                <Reorder.Item as="tr" key={f.id} value={f} className="border-b hover:bg-muted/50 transition-colors">
                  <TableCell className="cursor-move text-muted-foreground">⠿</TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded text-primary">
                        <Zap className="h-4 w-4" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{f.title}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[300px] truncate">{f.description}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(f)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(f.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureManagement;
