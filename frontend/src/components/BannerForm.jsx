import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import api, { IMAGE_BASE_URL } from "@/services/api";

const BannerForm = ({ banner, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        link: banner.link,
        is_active: banner.is_active,
      });
    }
  }, [banner]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const postData = new FormData();
    postData.append("title", formData.title);
    postData.append("link", formData.link);
    postData.append("is_active", formData.is_active);
    if (imageFile) {
      postData.append("image", imageFile);
    }

    try {
      if (banner) {
        // When updating, we use POST method with a _method field to fake a PUT request
        // because multipart/form-data with PUT is tricky to handle in PHP.
        postData.append("_method", "PUT");
        await api.post(`/banners/${banner.id}`, postData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post("/banners", postData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save banner:", error);
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
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          name="image"
          type="file"
          onChange={handleFileChange}
          accept="image/*"
        />
        {banner && !imageFile && (
          <img src={`${IMAGE_BASE_URL}${banner.image_url}`} alt={banner.title} className="mt-2 h-11 w-32 object-cover" />
        )}
      </div>
      <div>
        <Label htmlFor="link">Link</Label>
        <Input
          id="link"
          name="link"
          value={formData.link}
          onChange={handleChange}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, is_active: checked }))
          }
        />
        <Label htmlFor="is_active">Active</Label>
      </div>
      <div className="flex justify-end">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default BannerForm;
