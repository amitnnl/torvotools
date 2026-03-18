import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFeature, updateFeature } from "@/services/api";

const FeatureForm = ({ feature, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "",
  });

  useEffect(() => {
    if (feature) {
      setFormData({
        title: feature.title || "",
        description: feature.description || "",
        icon: feature.icon || "",
      });
    }
  }, [feature]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (feature) {
        await updateFeature(feature.id, formData);
      } else {
        await createFeature(formData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save feature:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="icon">Icon Name (Lucide icon name or URL)</Label>
        <Input
          id="icon"
          name="icon"
          value={formData.icon}
          onChange={handleChange}
          placeholder="e.g. Truck, Shield, Clock"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Feature</Button>
      </div>
    </form>
  );
};

export default FeatureForm;
