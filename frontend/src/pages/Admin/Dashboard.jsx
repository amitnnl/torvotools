import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Dashboard = () => {
  const adminLinks = [
    {
      to: "/admin/products",
      title: "Product Management",
      description: "Create, update, and delete products.",
    },
    {
      to: "/admin/categories",
      title: "Category Management",
      description: "Create, update, and delete categories.",
    },
    {
      to: "/admin/orders",
      title: "Order Management",
      description: "View and manage customer orders.",
    },
    {
      to: "/admin/dealers",
      title: "Dealer Management",
      description: "Approve and manage dealer accounts.",
    },
    {
      to: "/admin/banners",
      title: "Banner Management",
      description: "Create, update, and delete promotional banners.",
    },
    {
      to: "/admin/coupons",
      title: "Coupon Management",
      description: "Create, update, and manage discount coupons.",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminLinks.map((link) => (
          <Link to={link.to} key={link.to}>
            <Card>
              <CardHeader>
                <CardTitle>{link.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{link.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
