"use client";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowRightLeftIcon,
  BotMessageSquare,
  BriefcaseBusinessIcon,
  CircleDot,
  FileText,
  HomeIcon,
  KeyRound,
  LayoutGrid,
  LayoutListIcon,
  LockKeyholeIcon,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Package,
  Route,
  Settings,
  Star,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      icon: HomeIcon,
      url: "/dashboard", // Direct URL for single item
    },
    {
      title: "Quotation",
      icon: MessageCircle,
      items: [
        { title: "Quotation", url: "/dashboard/general-quotation" },
        { title: "OTP", url: "/dashboard/otp" },
        { title: "Premium Request", url: "/dashboard/premium-request" },
        {
          title: "Listing Banner Image",
          url: "/dashboard/listing-banner-image",
        },
      ],
    },
    {
      title: "Location ",
      icon: MapPin,
      items: [
        { title: "Countries", url: "/dashboard/countries" },
        { title: "States", url: "/dashboard/states" },
        { title: "Top City", url: "/dashboard/manage-city/top-city" },
        { title: "Manage City", url: "/dashboard/manage-city" },
        { title: "Area", url: "/dashboard/manage-area" },
      ],
    },
    {
      title: "Category",
      icon: LayoutGrid,
      items: [
        {
          title: "Add Categories",
          url: "/dashboard/manage-category/add-category",
        },
        { title: "Manage Categories", url: "/dashboard/manage-category" },
        { title: "Categories Sorting", url: "/dashboard/sorting-category" },
        { title: "Category Views", url: "/dashboard/category-view-count" },
      ],
    },
    {
      title: "Listing",
      icon: LayoutListIcon,
      items: [
        { title: "Add Listing", url: "/dashboard/manage-listing/add-listing" },
        { title: "Manage Listing", url: "/dashboard/manage-listing" },
        { title: "Email Premium Listing", url: "/dashboard/premium-listing" },
        { title: "Featured Listing", url: "/dashboard/featured-listing" },
        {
          title: "Add Featured",
          url: "/dashboard/featured-listing/add-featured",
        },
      ],
    },
    {
      title: "Chatbot",
      icon: BotMessageSquare,
      items: [
        { title: "Chatbot Listing", url: "/dashboard/chatbot-listing" },
        { title: "User Chatbot", url: "/dashboard/chatbot-user" },
      ],
    },
    {
      title: "Products",
      icon: Package,
      items: [
        { title: "Add Product", url: "/dashboard/manage-product/add-product" },
        { title: "Manage Product", url: "/dashboard/manage-product" },
      ],
    },
    {
      title: "Advertising",
      icon: Megaphone,
      items: [
        { title: "Banners Type", url: "/dashboard/banner-types" },
        { title: "Banners", url: "/dashboard/banners" },
        { title: "Embedding in theme", url: "/dashboard/banner-theme" },
      ],
    },
    {
      title: "Jobs",
      icon: BriefcaseBusinessIcon,
      items: [
        { title: "Job Category", url: "/dashboard/job-category" },
        { title: "Job Category Sorting", url: "/dashboard/job-sorting" },
        { title: "Job", url: "/dashboard/job" },
        { title: "Job Application", url: "/dashboard/job-application" },
      ],
    },
    {
      title: "Faq",
      icon: MessagesSquare,
      url: "/dashboard/faq",
    },
    {
      title: "ADS",
      icon: ArrowRightLeftIcon,
      url: "/dashboard/manage-redirects",
    },
    {
      title: "Reviews",
      icon: Star,
      items: [
        { title: "Listing Review", url: "/dashboard/listing-review" },
        { title: "Blog Review", url: "/dashboard/blog-review" },
      ],
    },
    {
      title: "Static Pages",
      icon: FileText,
      items: [
        { title: "Static Page", url: "/dashboard/static-pages" },
        { title: "Blog Category", url: "/dashboard/blog-category" },
        { title: "Blog", url: "/dashboard/blog-list" },
        { title: "Description Section", url: "/dashboard/description-section" },
        { title: "Footer Section", url: "/dashboard/footer-section" },
      ],
    },
    {
      title: "SEO",
      icon: CircleDot,
      items: [
        { title: "Home Page", url: "/dashboard/homepage-seo" },
        { title: "Category", url: "/dashboard/category-seo" },
        { title: "Sub Domain category", url: "/dashboard/sub-domain-category" },
        { title: "Listing", url: "/dashboard/seo-listing" },
      ],
    },
    {
      title: "Users",
      icon: Users,
      items: [
        { title: "Manage Users", url: "/dashboard/manage-users" },
        { title: "Manage Admin Users", url: "/dashboard/manage-admin-users" },
        { title: "Live User", url: "/dashboard/manage-live-users" },
      ],
    },
    {
      title: "Activity",
      icon: Activity,
      items: [
        { title: "Admin Activity", url: "/dashboard/manage-admin-activity" },
        { title: "Seller Activity", url: "/dashboard/manage-seller-activity" },
        {
          title: "Manage User Ip Activity",
          url: "/dashboard/manage-user-ip-address",
        },
      ],
    },
    {
      title: "Newsletter",
      icon: Mail,
      items: [
        { title: "Newsletter Content", url: "/dashboard/newsletter-content" },
        { title: "Marketing Content", url: "/dashboard/marketing-content" },
        { title: "Subscribers", url: "/dashboard/subscribers-list" },
      ],
    },
    {
      title: "Blacklist Keywords",
      icon: KeyRound,
      url: "/dashboard/manage-blacklist-keywords",
    },
    {
      title: "Sitemap",
      icon: Route,
      items: [
        {
          title: "Category Sitemap",
          url: "/dashboard/manage-category-sitepmap",
        },
        { title: "Listing Sitemap", url: "/dashboard/manage-listing-sitepmap" },
        {
          title: "Featured Listing Sitemap",
          url: "/dashboard/featured-sitemap-gen",
        },
        { title: "Product Sitemap", url: "/dashboard/manage-product-sitepmap" },
        { title: "Blog Sitemap", url: "/dashboard/manage-blog-sitepmap" },
        {
          title: "Searched Sitemap Listing",
          url: "/dashboard/manage-search-sitemap",
        },
        {
          title: "Job Category Sitemap Listing",
          url: "/dashboard/manage-job-category-sitemap",
        },
        {
          title: "Job Sitemap Listing",
          url: "/dashboard/manage-job-listing-sitemap",
        },
        {
          title: "Custom Sitemap Listing",
          url: "/dashboard/manage-custom-links",
        },
      ],
    },
    {
      title: "Background Processes",
      icon: Settings,
      url: "/dashboard/background-processes",
    },
    {
      title: "Setting",
      icon: Settings,
      url: "/dashboard/manage-setting",
    },
    {
      title: "Change Password",
      icon: LockKeyholeIcon,
      url: "/dashboard/change-password-admin",
    },
    {
      title: "Logout From All Websites",
      icon: LogOut,
      isLogout: true,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4">
        <h1 className="text-2xl xl:text-3xl font-bold text-center text-primary truncate">
          Rentalzone
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} pathname={pathname} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
