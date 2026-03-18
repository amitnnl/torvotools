import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrand, updateBrand, IMAGE_BASE_URL } from "@/services/api";

const BrandForm = ({ brand, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    sort_order: 0,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        sort_order: brand.sort_order || 0,
      });
      if (brand.logo_url) {
        setImagePreview(`${IMAGE_BASE_URL}${brand.logo_url}`);
      }
    } else {
      // Reset form when adding a new brand
      setFormData({ name: "", sort_order: 0 });
      setSelectedFile(null);
      setImagePreview(null);
    }
  }, [brand]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setSelectedFile(file);
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("sort_order", formData.sort_order);
      if (selectedFile) {
        data.append("logo", selectedFile);
      }

      if (brand) {
        await updateBrand(brand.id, data);
      } else {
        await createBrand(data);
      }
      
      onClose(); // Close the form/modal on success
    } catch (error) {
      console.error("Failed to save brand:", error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Brand Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="sort_order">Sort Order</Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          value={formData.sort_order}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="logo">Brand Logo</Label>
        <Input
          id="logo"
          name="logo"
          type="file"
          onChange={handleChange}
        />
        {imagePreview && (
          <div className="mt-2">
            <img src={imagePreview} alt="Logo Preview" className="max-w-xs h-auto" />
            <Button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setImagePreview(null);
                const fileInput = document.getElementById('logo');
                if (fileInput) fileInput.value = '';
              }}
              variant="destructive"
              className="mt-2"
            >
              Remove Image
            </Button>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default BrandForm;
