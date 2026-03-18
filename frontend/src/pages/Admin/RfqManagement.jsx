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
import { getRfqs, createQuote } from "../../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/contexts/SettingsContext";
import { generateQuotePDF } from "@/lib/pdfGenerator";

const RfqManagement = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [quotedPrice, setQuotedPrice] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const { settings } = useSettings();

  useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    try {
      setLoading(true);
      const response = await getRfqs();
      setRfqs(response.data);
    } catch (err) {
      setError('Failed to fetch RFQs.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuote = (rfq) => {
    setSelectedRfq(rfq);
    setIsQuoteModalOpen(true);
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    try {
      await createQuote({ 
        rfq_id: selectedRfq.id, 
        quoted_price: quotedPrice,
        notes: quoteNotes
      });
      alert('Quote submitted successfully!');
      fetchRfqs();
      setIsQuoteModalOpen(false);
      setQuotedPrice('');
      setQuoteNotes('');
    } catch (err) {
      setError('Failed to submit quote.');
    }
  };

  const filteredRfqs = rfqs.filter((rfq) =>
    rfq.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rfq.dealer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <BreadcrumbPage>RFQs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Pending</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Quoted</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-7 gap-1">
            <FileIcon className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          {/* RFQs are usually created by customers, not directly by admin */}
          {/* <Button size="sm" className="h-7 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Create RFQ
            </span>
          </Button> */}
        </div>
      </div>
      <Tabs defaultValue="all">
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>RFQs</CardTitle>
              <CardDescription>
                Manage your Request for Quotes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFQ ID</TableHead>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRfqs.map((rfq) => (
                    <TableRow key={rfq.id}>
                      <TableCell className="font-medium">{rfq.id}</TableCell>
                      <TableCell>{rfq.dealer_name}</TableCell>
                      <TableCell>{rfq.product_name}</TableCell>
                      <TableCell>{rfq.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {rfq.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
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
                            {rfq.status === 'pending' && (
                              <DropdownMenuItem
                                onClick={() => handleQuote(rfq)}
                              >
                                Submit Quote
                              </DropdownMenuItem>
                            )}
                            {rfq.status === 'quoted' && (
                                <DropdownMenuItem onClick={() => generateQuotePDF(rfq, settings)}>
                                    Download PDF Quote
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>1-10</strong> of <strong>{filteredRfqs.length}</strong>{" "}
                RFQs
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Quote for RFQ #{selectedRfq?.id}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleQuoteSubmit} className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Product
              </Label>
              <Input
                id="product"
                name="product"
                value={selectedRfq?.product_name}
                className="col-span-3"
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                value={selectedRfq?.quantity}
                className="col-span-3"
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quotedPrice" className="text-right">
                Quoted Price
              </Label>
              <Input
                id="quotedPrice"
                name="quotedPrice"
                type="number"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="quoteNotes" className="text-right pt-2">
                Notes
              </Label>
              <textarea
                id="quoteNotes"
                name="quoteNotes"
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                className="col-span-3 min-h-[100px] border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="E.g. Volume discount applied, 5-day lead time..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsQuoteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Quote</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RfqManagement;
