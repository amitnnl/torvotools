import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { createPost, updatePost, IMAGE_BASE_URL } from "@/services/api";

const PostForm = ({ post, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    is_active: true,
  });
  const [featuredImage, setFeaturedImage] = useState(null);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        content: post.content || "",
        excerpt: post.excerpt || "",
        is_active: post.is_active === 1 || post.is_active === true,
      });
    }
  }, [post]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFeaturedImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("slug", formData.slug);
    data.append("content", formData.content);
    data.append("excerpt", formData.excerpt);
    data.append("is_active", formData.is_active);
    if (featuredImage) {
      data.append("featured_image", featuredImage);
    }

    try {
      if (post) {
        await updatePost(post.id, data);
      } else {
        await createPost(data);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
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
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="featured_image">Featured Image</Label>
        <Input
          id="featured_image"
          name="featured_image"
          type="file"
          onChange={handleFileChange}
          accept="image/*"
        />
        {post?.featured_image && !featuredImage && (
          <img src={`${IMAGE_BASE_URL}${post.featured_image}`} alt="Featured" className="mt-2 h-20 w-auto rounded" />
        )}
      </div>
      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          className="min-h-[200px]"
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
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Post</Button>
      </div>
    </form>
  );
};

export default PostForm;
