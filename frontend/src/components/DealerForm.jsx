import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/services/api";

const DealerForm = ({ dealer, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gst_number: "",
    company_name: "",
    address: "",
    is_approved: false,
    tier: "1",
  });

  useEffect(() => {
    if (dealer) {
      setFormData({
        name: dealer.name,
        email: dealer.email,
        password: "",
        gst_number: dealer.gst_number,
        company_name: dealer.company_name,
        address: dealer.address,
        is_approved: dealer.is_approved,
        tier: dealer.tier.toString(),
      });
    }
  }, [dealer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTierChange = (tier) => {
    setFormData((prev) => ({ ...prev, tier }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (dealer) {
        await api.put(`/dealers/${dealer.id}`, formData);
      } else {
        await api.post("/dealers", formData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save dealer:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      {!dealer && (
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
      )}
      <div>
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="gst_number">GST Number</Label>
        <Input
          id="gst_number"
          name="gst_number"
          value={formData.gst_number}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="tier">Tier</Label>
        <Select value={formData.tier} onValueChange={handleTierChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Tier 1</SelectItem>
            <SelectItem value="2">Tier 2</SelectItem>
            <SelectItem value="3">Tier 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_approved"
          name="is_approved"
          checked={formData.is_approved}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, is_approved: checked }))
          }
        />
        <Label htmlFor="is_approved">Approved</Label>
      </div>
      <div className="flex justify-end">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default DealerForm;
