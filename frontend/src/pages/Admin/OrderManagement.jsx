import { useState, useEffect } from "react";
import {
  File as FileIcon,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getOrders, updateOrder } from "../../services/api";
import { useSettings } from '../../contexts/SettingsContext'; // Import useSettings

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { settings } = useSettings(); // Use settings context

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("Failed to fetch orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      fetchOrders();
    } catch (err) {
      setError("Failed to update order status.");
    }
  };

  const renderOrderRows = (ordersToRender) => {
    if (loading) {
      return <TableRow><TableCell colSpan="6" className="text-center">Loading...</TableCell></TableRow>;
    }
    if (error) {
      return <TableRow><TableCell colSpan="6" className="text-center text-red-500">{error}</TableCell></TableRow>;
    }
    if (ordersToRender.length === 0) {
      return <TableRow><TableCell colSpan="6" className="text-center">No orders found.</TableCell></TableRow>;
    }
    return ordersToRender.map((order) => (
      <TableRow key={order.id}>
        <TableCell>
          <div className="font-medium">{order.user_name}</div>
          <div className="hidden text-sm text-muted-foreground md:inline">
            {order.user_email}
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell">Sale</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge variant="outline" className="capitalize">
            {order.status}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {new Date(order.created_at).toLocaleDateString()}
        </TableCell>
        <TableCell className="text-right">{settings?.currency_symbol}{order.total_amount}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">Update Status</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {['pending', 'fulfilled', 'cancelled'].map(status => (
                    <DropdownMenuItem
                      key={status}
                      onSelect={() => handleStatusChange(order.id, status)}
                      disabled={order.status === status}
                    >
                      <span className="capitalize">{status}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };
  
  const OrderTable = ({ orders, searchTerm }) => {
    const filteredOrders = orders.filter(order =>
      order.user_name && order.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Manage your orders and view their details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderOrderRows(filteredOrders)}</TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>{filteredOrders.length}</strong> orders
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
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
              <BreadcrumbPage>Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by customer name..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* ... other buttons ... */}
        </div>
      </div>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="all" key="all">
          <OrderTable orders={orders} searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="pending" key="pending">
          <OrderTable orders={orders.filter(o => o.status === 'pending')} searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="fulfilled" key="fulfilled">
          <OrderTable orders={orders.filter(o => o.status === 'fulfilled')} searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="cancelled" key="cancelled">
          <OrderTable orders={orders.filter(o => o.status === 'cancelled')} searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>
    </>
  );
};
export default OrderManagement;
