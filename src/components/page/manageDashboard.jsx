"use client";

import { useEffect, useState } from "react";
import { Loader2, User } from "lucide-react";
import Link from "next/link"; // Changed from react-router-dom
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const dashboardCards = [
  {
    label: "Pending Seller Approval",
    valueKey: "pending_seller_approval",
    route: "/dashboard/manage-users",
  },
  { label: "No. of Sellers", valueKey: "total_seller", route: "/dashboard/manage-users" },
  { label: "No. of Users", valueKey: "total_user", route: "/dashboard/manage-users" },
  { label: "Quotations", valueKey: "quotations", route: "/dashboard/general-quotation" },
  { label: "Premium Request", valueKey: "premium_request", route: "/dashboard/premium-request" },
  { label: "Pending Listings", valueKey: "pending_listing", route: "/dashboard/manage-listing" },
  { label: "No. of Live Sellers", valueKey: "live_seller", route: "/dashboard/manage-live-users" },
  { label: "Chat Boat", valueKey: "chat_boat", route: "/dashboard/chatbot-listing" },
  {
    label: "Total Subscriber",
    valueKey: "total_subscriber",
    route: "/dashboard/quote-subscribers-list",
  },
];

export default function ManageDashboardpage() {
  const [loader, setLoader] = useState(false);
  const [dashboardData, setDashboardData] = useState({}); // Initialize as object
  const [categoryViewCountList, setCategoryViewCountList] = useState([]);
  const [listingList, setListingList] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoader(true);
      const res = await getRequest("dashboard-details");
      const data = res.data;      
      setDashboardData(data);
      setCategoryViewCountList(data?.topCategories?.slice(0, 10) || []);
      setListingList(data?.listing_view?.slice(0, 10) || []);
    } catch (err) {
      console.error(err?.message || "Something went wrong");
      toast.error(err?.message || "Failed to load dashboard data");
    } finally {
      setLoader(false);
    }
  };

  const formatDate = (date) => moment(date).format("DD-MM-YYYY");

  const loginDetails = dashboardData?.login_details || [];

  return (
    <>
      <section className="bg-white p-5 rounded-2xl mb-3 2xl:mb-6 border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)]">
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-y-6">
          {dashboardCards.map((card, index) => (
            <li key={index}>
              <Link href={card.route} className="flex items-center space-x-4">
                <div className="bg-purple-100 text-[#7367f0] p-2 rounded-full">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg leading-none 2xl:text-xl font-bold text-gray-800">
                    {dashboardData?.[card.valueKey] ?? 0}
                  </h4>
                  <p className="text-xs 2xl:text-xs text-[#7367f0]">{card.label}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* <section className="bg-white p-5 rounded-2xl my-5 flex flex-col grow border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)]">
        <div className="flex flex-wrap items-center justify-between mb-4 2xl:mb-5">
          <h3 className="text-lg font-medium text-gray-500">Login Details</h3>
          <div className="flex flex-wrap items-center justify-end gap-2 w-fit">
            <Link
              href="/dashboard/manage-admin-users"
              className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit min-w-36 gap-2.5 text-center text-xs 22xl:text-base font-medium border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear"
            >
              See All(Admin)
            </Link>
            <Link
              href="/dashboard/manage-users"
              className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit min-w-36 gap-2.5 text-center text-xs 22xl:text-base font-medium border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear"
            >
              See All(Users)
            </Link>
          </div>
        </div>
        <div className="w-full h-64 grow overflow-auto pr-2 mb-5">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="text-gray-600 font-medium">Date</TableHead>
                <TableHead className="text-gray-600 font-medium text-right">Type</TableHead>
                <TableHead className="text-gray-600 font-medium">Ip</TableHead>
                <TableHead className="text-gray-600 font-medium">Country</TableHead>
                <TableHead className="text-gray-600 font-medium">City</TableHead>
                <TableHead className="text-gray-600 font-medium">Zip</TableHead>
                <TableHead className="text-gray-600 font-medium">Login Success</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loader ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : loginDetails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                loginDetails.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="text-gray-600 max-w-md">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-gray-600 text-right">{item.user_type}</TableCell>
                    <TableCell className="text-gray-600 text-right">{item?.ip_address}</TableCell>
                    <TableCell className="text-gray-600 text-right">{item?.country}</TableCell>
                    <TableCell className="text-gray-600 text-right">{item.city}</TableCell>
                    <TableCell className="text-gray-600 text-right">{item.zipcode}</TableCell>
                    <TableCell className="text-gray-600 text-right">{item.login_success ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <table className=" mt-1.5 align-middle caption-bottom border-collapse">
            <thead>
              <tr>
                <th className="w-[20%] bg-gray-50 border-b border-solid border-gray-200 p-2 py-4 align-middle text-left text-xs 2xl:text-base text-gray-600 font-medium rounded-tl-xl">
                  Date
                </th>
                <th className="w-[10%] bg-gray-50 border-b border-solid border-gray-200 p-2 py-4 align-middle text-left text-xs 2xl:text-base text-gray-600 font-medium rounded-tr-xl">
                  type
                </th>
                <th className="w-[12%] bg-gray-50 border-b border-solid border-gray-200 p-2 py-4 align-middle text-left text-xs 2xl:text-base text-gray-600 font-medium rounded-tr-xl">
                  IP
                </th>
                <th className="w-[15%] bg-gray-50 border-b border-solid border-gray-200 p-2 py-4 align-middle text-left text-xs 2xl:text-base text-gray-600 font-medium rounded-tr-xl">
                  Country
                </th>
                <th className="w-[14%] bg-gray-50 border-b border-solid border-gray-200 p-2 py-4 align-middle text-left text-xs 2xl:text-base text-gray-600 font-medium rounded-tr-xl">
                  City
                </th>
                <th className="w-[14%] bg-gray-50 border-b border-solid border-gray-200 p-2 py-4 align-middle text-left text-xs 2xl:text-base text-gray-600 font-medium rounded-tr-xl">
                  Zip
                </th>
                <th className="w-[15%] bg-gray-50 border-b border-solid border-gray-200 p-2 py-4 align-middle text-left text-xs 2xl:text-base text-gray-600 font-medium rounded-tr-xl">
                  Login Success
                </th>
              </tr>
            </thead>
            <tbody>
              
              {loader && (
                <tr>
                  <td className="text-center py-10" colSpan="11">
                    <div className="w-10 h-10 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              )}
              
              {!loader && (!loginDetails || loginDetails.length === 0) && (
                <tr className="py-10">
                  <td className="text-center" colSpan="11">
                    <span>Record Not Found</span>
                  </td>
                </tr>
              )}              
              {!loader &&
                loginDetails?.map((item, index) => (
                  <tr key={index}>
                    <td className="bg-white p-2 text-xs 2xl:text-base border-b border-gray-200 text-gray-500 hover:text-black transition-colors duration-300 ease-linear">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="bg-white p-2 text-xs 2xl:text-base border-b border-gray-200 text-gray-500 hover:text-black transition-colors duration-300 ease-linear">
                      {item.user_type}
                    </td>
                    <td className="bg-white p-2 text-xs 2xl:text-base border-b border-gray-200 text-gray-500 hover:text-black transition-colors duration-300 ease-linear">
                      {item?.ip_address}
                    </td>
                    <td className="bg-white p-2 text-xs 2xl:text-base border-b border-gray-200 text-gray-500 hover:text-black transition-colors duration-300 ease-linear">
                      {item?.country}
                    </td>
                    <td className="bg-white p-2 text-xs 2xl:text-base border-b border-gray-200 text-gray-500 hover:text-black transition-colors duration-300 ease-linear">
                      {item.city}
                    </td>
                    <td className="bg-white p-2 text-xs 2xl:text-base border-b border-gray-200 text-gray-500 hover:text-black transition-colors duration-300 ease-linear">
                      {item.zipcode}
                    </td>
                    <td className="bg-white p-2 text-xs 2xl:text-base border-b border-gray-200 text-gray-500 hover:text-black transition-colors duration-300 ease-linear">
                      {item.login_success ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="flex flex-wrap gap-4 2xl:gap-5">
        
        <div className="w-5/12 grow flex flex-col overflow-auto rounded-xl border border-solid border-gray-200 p-4 2xl:p-6">
          <div className="flex flex-wrap items-center justify-between mb-4 2xl:mb-5">
            <h5 className="text-lg 2xl:text-xl font-medium mb-2 2xl:mb-3 text-gray-500">
              Search Keywords
            </h5>
            <div className="flex flex-wrap items-center justify-end gap-2 w-fit">
              <Link
                href="/dashboard/category-view-count"
                className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg block w-fit min-w-36 gap-2.5 text-center text-xs 2xl:text-base font-medium border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear "
              >
                View More
              </Link>
            </div>
          </div>
          <div className="w-full h-[400px] grow overflow-auto pr-2">
            <table className="w-full 2xl:w-full mt-1.5 align-middle caption-bottom border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-50 border-b border-solid border-gray-200 p-2 py-3 2xl:py-4 align-middle text-left text-xs 2xl:text-xs text-gray-600 font-medium rounded-tl-xl">
                    Month-Year
                  </th>
                  <th className="bg-gray-50 border-b border-solid border-gray-200 p-2 py-3 2xl:py-4 align-middle text-left text-xs 2xl:text-xs text-gray-600 font-medium">
                    Search Keyword
                  </th>
                  <th className="bg-gray-50 border-b border-solid border-gray-200 p-2 py-3 2xl:py-4 align-middle text-left text-xs 2xl:text-xs text-gray-600 font-medium rounded-tr-xl">
                    No. of Times Searched
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoryViewCountList?.map((item, index) => (
                  <tr key={index}>
                    <td className="bg-white p-2 text-xs 2xl:text-xs border-b border-solid border-gray-200 text-gray-500 hover:text-black transition-colors duration-300 ease-linear">
                      {item.formatted_month}
                    </td>
                    <td className="bg-white p-2 text-xs 2xl:text-xs border-b border-solid border-gray-200 text-gray-500 hover:text-black transition-colors duration-300 ease-linear">
                      {item.category_name}
                    </td>
                    <td className="bg-white p-2 text-xs 2xl:text-xs border-b border-solid border-gray-200 text-gray-500 hover:text-black transition-colors duration-300 ease-linear">
                      {item.searchCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>        
        <div className="w-5/12 grow flex flex-col overflow-auto rounded-xl border border-solid border-gray-200 p-4 2xl:p-6">
          <div className="flex flex-wrap items-center justify-between mb-4 2xl:mb-5">
            <h5 className="text-lg 2xl:text-xl font-medium mb-2 2xl:mb-3 text-gray-500">
              Listing Views
            </h5>
            <div className="flex flex-wrap items-center justify-end gap-2 w-fit">
              <Link
                href="/dashboard/manage-listing"
                className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit min-w-36 gap-2.5 text-center text-xs 22xl:text-base font-medium border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear"
              >
                View More
              </Link>
            </div>
          </div>
          <div className="w-full h-[400px] grow overflow-auto pr-2">
            <table className="w-full 2xl:w-full mt-1.5 align-middle caption-bottom border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-50 border-b border-solid border-gray-200 p-2 py-3 2xl:py-4 align-middle text-left text-xs 2xl:text-xs text-gray-600 font-medium rounded-tl-xl">
                    Listing
                  </th>
                  <th className="bg-gray-50 border-b border-solid border-gray-200 p-2 py-3 2xl:py-4 align-middle text-left text-xs 2xl:text-xs text-gray-600 font-medium rounded-tr-xl">
                    No. of Times Viewed
                  </th>
                </tr>
              </thead>
              <tbody>
                {listingList?.map((item, index) => (
                  <tr key={index}>
                    <td className="bg-white p-2 text-xs 2xl:text-xs border-b border-solid border-gray-200 text-gray-500 hover:text-black transition-colors duration-300 ease-linear">
                      {item.name}
                    </td>
                    <td className="bg-white p-2 text-xs 2xl:text-xs border-b border-solid border-gray-200 text-gray-500 hover:text-black transition-colors duration-300 ease-linear">
                      {item.listing_views}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div> */}
      <div className="space-y-3 2xl:space-y-6">
        <Card className="border border-solid border-zinc-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0">
            <CardTitle className="text-base lg:text-lg 2xl:text-xl font-medium text-zinc-500">
              Login Details
            </CardTitle>
            <div className="flex gap-2">
              <Link href="/dashboard/manage-admin-users">
                <Button>See All(Admin)</Button>
              </Link>
              <Link href="/dashboard/manage-users">
                <Button>See All(Users)</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className={"flex flex-col max-h-72 overflow-auto custom-scroll"}>
            <Table className={"h-20 grow"}>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="text-gray-600 font-medium">Date</TableHead>
                  <TableHead className="text-gray-600 font-medium">type</TableHead>
                  <TableHead className="text-gray-600 font-medium">IP</TableHead>
                  <TableHead className="text-gray-600 font-medium">Country</TableHead>
                  <TableHead className="text-gray-600 font-medium">City</TableHead>
                  <TableHead className="text-gray-600 font-medium">Zip</TableHead>
                  <TableHead className="text-gray-600 font-medium">Login Success</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loader ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : loginDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  loginDetails.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="text-gray-600 max-w-md text-xs 2xl:text-xs">{formatDate(item.createdAt)}</TableCell>
                      <TableCell className="text-gray-600 text-xs 2xl:text-xs text-left">{item.user_type}</TableCell>
                      <TableCell className="text-gray-600 text-left text-xs 2xl:text-xs">{item?.ip_address}</TableCell>
                      <TableCell className="text-gray-600 text-left text-xs 2xl:text-xs">{item?.country}</TableCell>
                      <TableCell className="text-gray-600 text-left text-xs 2xl:text-xs">{item.city}</TableCell>
                      <TableCell className="text-gray-600 text-left text-xs 2xl:text-xs">{item.zipcode}</TableCell>
                      <TableCell className="text-gray-600 text-left text-xs 2xl:text-xs">
                        {item.login_success ? "Yes" : "No"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 2xl:gap-6">
          {/* Search Keywords Section */}
          <Card className="border border-solid border-zinc-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0">
              <CardTitle className="text-base lg:text-lg 2xl:text-xl font-medium text-zinc-500">Search Keywords</CardTitle>
              <Link href="/dashboard/category-view-count">
                <Button>View More</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-gray-600 font-medium">Month-Year</TableHead>
                    <TableHead className="text-gray-600 font-medium">Search Keyword</TableHead>
                    <TableHead className="text-gray-600 font-medium">
                      No. of Times Searched
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Empty table as shown in the image */}
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                      No data available
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Listing Views Section */}
          <Card className="border border-solid border-zinc-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0">
              <CardTitle className="px-0 text-base lg:text-lg 2xl:text-xl font-medium text-zinc-500">
                Listing Views
              </CardTitle>
              <Link href="/dashboard/manage-listing">
                <Button>View More</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-gray-600 font-medium text-xs 2xl:text-xs">Listing</TableHead>
                    <TableHead className="text-gray-600 font-medium text-xs 2xl:text-xs text-right">
                      No. of Times Viewed
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listingList.map((item, index) => (
                    <TableRow key={index} className="border-b hover:bg-gray-50">
                      <TableCell className="text-gray-600 text-left text-xs 2xl:text-xs">{item.name}</TableCell>
                      <TableCell className="text-gray-600 text-center text-xs 2xl:text-xs">
                        {item.listing_views}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
