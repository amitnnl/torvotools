import { createBrowserRouter, Navigate } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import App from "../App";

// Performance Optimization: Lazy loading pages
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Product = lazy(() => import("../pages/Product"));
const Products = lazy(() => import("../pages/Products"));
const Brands = lazy(() => import("../pages/Brands"));
const About = lazy(() => import("../pages/About"));
const Services = lazy(() => import("../pages/Services"));
const Contact = lazy(() => import("../pages/Contact"));
const Cart = lazy(() => import("../pages/Cart"));
const Checkout = lazy(() => import("../pages/Checkout"));
const OrderHistory = lazy(() => import("../pages/OrderHistory"));
const Wishlist = lazy(() => import("../pages/Wishlist"));
const Profile = lazy(() => import("../pages/Profile"));
const Category = lazy(() => import("../pages/Category"));
const MyRfqs = lazy(() => import("../pages/MyRfqs"));
const FleetManagement = lazy(() => import("../pages/FleetManagement"));
const Invoices = lazy(() => import("../pages/Invoices"));
const ProcurementAnalytics = lazy(() => import("../pages/ProcurementAnalytics"));
const ShippingTracker = lazy(() => import("../pages/ShippingTracker"));
const ProcurementReports = lazy(() => import("../pages/ProcurementReports"));
const ProjectManager = lazy(() => import("../pages/ProjectManager"));
const InventoryPrediction = lazy(() => import("../pages/InventoryPrediction"));
const TrackOrder = lazy(() => import("../pages/TrackOrder"));
const Categories = lazy(() => import("../pages/Categories"));
const OrderSuccess = lazy(() => import("../pages/OrderSuccess"));
const DynamicPage = lazy(() => import("../pages/DynamicPage"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Admin Pages
const AdminRoute = lazy(() => import("./AdminRoute"));
const NewAdminLayout = lazy(() => import("../pages/Admin/NewAdminLayout"));
const NewDashboard = lazy(() => import("../pages/Admin/NewDashboard"));
const ProductManagement = lazy(() => import("../pages/Admin/ProductManagement"));
const CategoryManagement = lazy(() => import("../pages/Admin/CategoryManagement"));
const OrderManagement = lazy(() => import("../pages/Admin/OrderManagement"));
const DealerManagement = lazy(() => import("../pages/Admin/DealerManagement"));
const BannerManagement = lazy(() => import("../pages/Admin/BannerManagement"));
const CouponManagement = lazy(() => import("../pages/Admin/CouponManagement"));
const SiteSettings = lazy(() => import("../pages/Admin/SiteSettings"));
const Analytics = lazy(() => import("../pages/Admin/Analytics"));
const UserManagement = lazy(() => import("../pages/Admin/UserManagement"));
const BrandManagement = lazy(() => import("../pages/Admin/BrandManagement"));
const PageManagement = lazy(() => import("../pages/Admin/PageManagement"));
const PostManagement = lazy(() => import("../pages/Admin/PostManagement"));
const FeatureManagement = lazy(() => import("../pages/Admin/FeatureManagement"));
const MenuManagement = lazy(() => import("../pages/Admin/MenuManagement"));

// Progress/Loading component for Suspense
const LoadingNode = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
    <div className="w-16 h-11 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
    <p className="text-[10px] font-bold uppercase tracking-normal text-slate-400 animate-pulse">Initializing System Nodes...</p>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingNode />}>
        <App />
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/product/:id",
        element: <Product />,
      },
      {
        path: "/products",
        element: <Products />,
      },
      {
        path: "/categories",
        element: <Categories />,
      },
      {
        path: "/categories/:id",
        element: <Category />,
      },
      {
        path: "/wishlist",
        element: <Wishlist />,
      },
      {
        path: "/brands",
        element: <Brands />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/services",
        element: <Services />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/order-success",
        element: <OrderSuccess />,
      },
      {
        path: "/orders",
        element: <OrderHistory />,
      },
      {
        path: "/rfqs",
        element: <MyRfqs />,
      },
      {
        path: "/fleet",
        element: <FleetManagement />,
      },
      {
        path: "/invoices",
        element: <Invoices />,
      },
      {
        path: "/procurement-analytics",
        element: <ProcurementAnalytics />,
      },
      {
        path: "/shipping",
        element: <ShippingTracker />,
      },
      {
        path: "/track-order",
        element: <TrackOrder />,
      },
      {
        path: "/reports",
        element: <ProcurementReports />,
      },
      {
        path: "/projects",
        element: <ProjectManager />,
      },
      {
        path: "/predictions",
        element: <InventoryPrediction />,
      },
      {
        path: "/privacy-policy",
        element: <DynamicPage />,
      },
      {
        path: "/terms-of-service",
        element: <DynamicPage />,
      },
      {
        path: "/page/:slug",
        element: <DynamicPage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "/admin",
        element: (
          <Suspense fallback={<LoadingNode />}>
            <AdminRoute>
              <NewAdminLayout />
            </AdminRoute>
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <NewDashboard />,
          },
          {
            path: "products",
            element: <ProductManagement />,
          },
          {
            path: "categories",
            element: <CategoryManagement />,
          },
          {
            path: "orders",
            element: <OrderManagement />,
          },
          {
            path: "dealers",
            element: <DealerManagement />,
          },
          {
            path: "banners",
            element: <BannerManagement />,
          },
          {
            path: "coupons",
            element: <CouponManagement />,
          },
          {
            path: "settings",
            element: <SiteSettings />,
          },
          {
            path: "analytics",
            element: <Analytics />,
          },
          {
            path: "users",
            element: <UserManagement />,
          },
          {
            path: "brands",
            element: <BrandManagement />,
          },
          {
            path: "pages",
            element: <PageManagement />,
          },
          {
            path: "posts",
            element: <PostManagement />,
          },
          {
            path: "features",
            element: <FeatureManagement />,
          },
          {
            path: "menus",
            element: <MenuManagement />,
          },
        ],
      },
    ],
  },
]);

export default router;
