import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  PlusCircle,
  Menu as MenuIcon,
  ChevronRight,
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
import { getMenus, deleteMenu, updateMenuOrder } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import MenuForm from "@/components/MenuForm";
import { Reorder } from "framer-motion";

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await getMenus();
      setMenus(response.data);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };
  
  const openDialog = (menu = null) => {
    setCurrentMenu(menu);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentMenu(null);
    fetchMenus();
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await deleteMenu(id);
        fetchMenus();
      } catch (error) {
        console.error("Error deleting menu:", error);
      }
    }
  };

  const handleSaveOrder = async () => {
    try {
        const updatedMenus = menus.map((m, index) => ({ ...m, sort_order: index }));
        await updateMenuOrder({ menus: updatedMenus });
        alert("Menu order saved!");
    } catch (error) {
        console.error("Error saving menu order:", error);
    }
  };

  // Group menus by parent
  const mainMenus = menus.filter(m => !m.parent_id);
  const subMenus = (parentId) => menus.filter(m => String(m.parent_id) === String(parentId));

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
              <BreadcrumbPage>Navigation Menu</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleSaveOrder}>Save Order</Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 gap-1" onClick={() => openDialog()}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Item
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentMenu ? "Edit Menu Item" : "Add Menu Item"}
                </DialogTitle>
                <DialogDescription>
                  Configure your website's main navigation.
                </DialogDescription>
              </DialogHeader>
              <MenuForm menu={currentMenu} onClose={closeDialog} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Site Navigation</CardTitle>
          <CardDescription>
            Organize links for your header and footer. Drag to reorder main items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Menu Item</TableHead>
                <TableHead>Link</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <Reorder.Group as="tbody" values={menus} onReorder={setMenus}>
              {menus.map((m) => (
                <Reorder.Item as="tr" key={m.id} value={m} className={`border-b hover:bg-muted/50 transition-colors ${m.parent_id ? 'bg-muted/20' : ''}`}>
                  <TableCell className="cursor-move text-muted-foreground">⠿</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        {m.parent_id ? <ChevronRight className="h-4 w-4 text-muted-foreground ml-4" /> : <MenuIcon className="h-4 w-4" />}
                        <span className={m.parent_id ? 'text-sm' : 'font-medium'}>{m.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.link}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(m)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(m.id)}>Delete</DropdownMenuItem>
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

export default MenuManagement;
