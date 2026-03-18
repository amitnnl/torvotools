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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getDealers,
  updateDealer,
  createDealer,
  deleteDealer,
  getCredit,
  updateCredit,
} from "../../services/api";
import DealerForm from "@/components/DealerForm";
import { Wallet, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DealerManagement = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditData, setCreditData] = useState({ credit_limit: 0, credit_status: 'active' });
  const [savingCredit, setSavingCredit] = useState(false);

  const handleManageCredit = async (dealer) => {
    setSelectedDealer(dealer);
    try {
      const response = await getCredit(dealer.id);
      setCreditData({
        credit_limit: response.data.credit_limit || 0,
        credit_status: response.data.credit_status || 'active'
      });
      setIsCreditModalOpen(true);
    } catch (err) {
      setError("Failed to fetch credit data.");
    }
  };

  const handleSaveCredit = async () => {
    setSavingCredit(true);
    try {
      await updateCredit({
        user_id: selectedDealer.id,
        credit_limit: creditData.credit_limit,
        credit_status: creditData.credit_status
      });
      setIsCreditModalOpen(false);
      fetchDealers();
    } catch (err) {
      setError("Failed to update credit.");
    } finally {
      setSavingCredit(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      setLoading(true);
      const response = await getDealers();
      setDealers(response.data);
    } catch (err) {
      setError("Failed to fetch dealers.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dealer) => {
    setSelectedDealer(dealer);
    setIsFormOpen(true);
  };

  const handleDelete = async (dealerId) => {
    if (window.confirm("Are you sure you want to delete this dealer?")) {
      try {
        await deleteDealer(dealerId);
        fetchDealers();
      } catch (err) {
        setError("Failed to delete dealer.");
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedDealer(null);
    fetchDealers();
  };

  const handleApprove = async (dealer, isApproved) => {
    try {
      await updateDealer(dealer.id, { ...dealer, is_approved: isApproved });
      fetchDealers();
    } catch (err) {
      setError("Failed to update dealer status.");
    }
  };

  const handleTierChange = async (dealer, tier) => {
    try {
      await updateDealer(dealer.id, { ...dealer, tier });
      fetchDealers();
    } catch (err) {
      setError("Failed to update dealer tier.");
    }
  };

  const filteredDealers = dealers.filter((dealer) =>
    dealer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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
                <BreadcrumbPage>Dealers</BreadcrumbPage>
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
                <DropdownMenuCheckboxItem>Approved</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Pending</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-7 gap-1">
              <FileIcon className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 gap-1" onClick={() => setSelectedDealer(null)}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Dealer
                </span>
              </Button>
            </DialogTrigger>
          </div>
        </div>
        <Tabs defaultValue="all">
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Dealers</CardTitle>
                <CardDescription>
                  Manage your dealer network.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="hidden md:table-cell">
                        GST Number
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Tier
                      </TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDealers.map((dealer) => (
                      <TableRow key={dealer.id}>
                        <TableCell className="font-medium">
                          {dealer.company_name}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{dealer.name}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {dealer.email}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {dealer.gst_number}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className="capitalize">
                            {dealer.is_approved ? "Approved" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {dealer.tier}
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
                              <DropdownMenuItem onClick={() => handleEdit(dealer)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleManageCredit(dealer)}>
                                Manage Credit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleApprove(dealer, dealer.is_approved ? 0 : 1)}
                              >
                                {dealer.is_approved ? "Mark as Pending" : "Approve"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(dealer.id)}>
                                Delete
                              </DropdownMenuItem>
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
                  Showing <strong>1-10</strong> of <strong>{filteredDealers.length}</strong>{" "}
                  dealers
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDealer ? "Edit Dealer" : "Add Dealer"}</DialogTitle>
          </DialogHeader>
          <DealerForm dealer={selectedDealer} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>

      <Dialog open={isCreditModalOpen} onOpenChange={setIsCreditModalOpen}>
        <DialogContent className="max-w-md bg-slate-900 text-white border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-semibold tracking-tight flex items-center gap-3 text-white">
              <Wallet className="h-6 w-6 text-primary" />
              Corporate Credit Matrix
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-8 py-3">
            <div className="bg-white/5 p-6 border border-white/10 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 tracking-wide">Authorized Entity</p>
                <p className="text-base font-medium text-primary uppercase">{selectedDealer?.company_name}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold tracking-wide text-slate-400">Credit Limit Valuation (USD)</Label>
                <Input
                  type="number"
                  className="bg-white/5 border-white/10 text-xl font-bold focus:border-primary focus:ring-primary h-10"
                  value={creditData.credit_limit}
                  onChange={(e) => setCreditData({ ...creditData, credit_limit: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold tracking-wide text-slate-400">Node Status Protocol</Label>
                <Select
                  value={creditData.credit_status}
                  onValueChange={(val) => setCreditData({ ...creditData, credit_status: val })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 h-10 font-bold uppercase text-xs">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10 text-white font-bold uppercase text-xs">
                    <SelectItem value="active">ACTIVE OPERATION</SelectItem>
                    <SelectItem value="frozen">FROZEN (RESTRICTED)</SelectItem>
                    <SelectItem value="suspended">SUSPENDED (CRITICAL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-start gap-4 p-4 bg-primary/5 rounded-lg text-primary">
              <Info className="h-5 w-5 mt-1" />
              <p className="text-[9px] font-bold uppercase leading-relaxed tracking-wider">
                Authorized credit limits enable Net-30/60 procurement nodes. Adjustments require manual reconciliation with finance audits.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreditModalOpen(false)}
                className="flex-1 h-10 border-white/10 text-white hover:bg-white/5 font-bold uppercase text-xs tracking-widest"
              >
                Abort
              </Button>
              <Button
                onClick={handleSaveCredit}
                disabled={savingCredit}
                className="flex-1 h-10 bg-primary hover:bg-primary/80 text-white font-bold uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
              >
                {savingCredit ? "Synchronizing..." : "Commit Protocol"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DealerManagement;
