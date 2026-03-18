import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMenu, updateMenu, getMenus } from "@/services/api";

const MenuForm = ({ menu, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    parent_id: "",
  });
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    fetchMenus();
    if (menu) {
      setFormData({
        name: menu.name || "",
        link: menu.link || "",
        parent_id: menu.parent_id ? String(menu.parent_id) : "none",
      });
    }
  }, [menu]);

  const fetchMenus = async () => {
    try {
      const response = await getMenus();
      // Filter out current menu to prevent self-parenting
      const filteredMenus = menu 
        ? response.data.filter(m => m.id !== menu.id)
        : response.data;
      setMenus(filteredMenus);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
        ...formData,
        parent_id: formData.parent_id === "none" ? null : formData.parent_id
    };
    try {
      if (menu) {
        await updateMenu(menu.id, submitData);
      } else {
        await createMenu(submitData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save menu:", error);
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
        <Label htmlFor="link">Link</Label>
        <Input
          id="link"
          name="link"
          value={formData.link}
          onChange={handleChange}
          required
          placeholder="/products or https://..."
        />
      </div>
      <div>
        <Label htmlFor="parent_id">Parent Menu</Label>
        <Select 
            value={formData.parent_id} 
            onValueChange={(val) => setFormData(prev => ({...prev, parent_id: val}))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select parent menu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (Main Menu)</SelectItem>
            {menus.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Menu</Button>
      </div>
    </form>
  );
};

export default MenuForm;
