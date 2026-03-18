import { useState, useEffect } from "react";
import { getCategories } from "../services/api";
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

import { useSettings } from "../contexts/SettingsContext";
import { IMAGE_BASE_URL } from "../services/api";

const CategoryForm = ({ category, onSubmit, onCancel }) => {
  const { settings } = useSettings();
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("null");
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setParentId(category.parent_id ? category.parent_id.toString() : "null"); // Handle null parent_id
    }

    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        // Exclude the current category from the list of possible parents
        setCategories(
          response.data.filter((c) => !category || c.id !== category.id)
        );
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, [category]);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);

    // Explicitly handle "null" string for top-level categories
    if (parentId && parentId !== "null") {
      formData.append("parent_id", parentId);
    } else {
      formData.append("parent_id", "null");
    }

    if (imageFile) {
      formData.append("image", imageFile);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          type="file"
          onChange={handleFileChange}
          accept="image/*"
        />
        {category && !imageFile && category.image_url && (
          <div className="mt-2 border border-slate-100 p-2 rounded-lg w-20 h-20 bg-slate-50 overflow-hidden">
            <img
              src={`${IMAGE_BASE_URL}${category.image_url}`}
              alt={category.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="parentId">Parent Category</Label>
        <Select value={parentId} onValueChange={setParentId}>
          <SelectTrigger>
            <SelectValue placeholder="No Parent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">No Parent</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default CategoryForm;
