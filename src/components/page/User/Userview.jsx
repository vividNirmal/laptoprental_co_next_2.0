"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { Label } from "@/components/ui/label";

const Userview = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiGet(`/user-details/${userId}`);
        setUser(res.data);
      } catch (e) {
        setUser(null);
        setError("User not found or error fetching user details.");
      }
      setLoading(false);
    }
    if (userId) fetchUser();
  }, [userId]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  if (error)
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  if (!user) return <div className="text-center mt-8">User not found.</div>;

  return (
    <section className="flex flex-1 flex-col r p-4 ">
      <Card className="w-full border-0">
        {/* <CardHeader>
          <CardTitle className="px-0 text-2xl font-bold">User Details</CardTitle>
        </CardHeader> */}
        {/* <CardContent> */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <tbody>
              <tr>
                <td className=" px-4">
                  {" "}
                  <Label
                    htmlFor="state"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    User Name
                  </Label>
                </td>
                <td className="py-3 px-4">{user.name || "-"}</td>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-4">
                  {" "}
                  <Label
                    htmlFor="state"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Email
                  </Label>
                </td>
                <td className="py-3 px-4">{user.email || "-"}</td>
              </tr>
              <tr>
                <td className="px-4 ">
                  <Label
                    htmlFor="state"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Phone Number
                  </Label>
                </td>
                <td className="py-3 px-4">{user.phone_number || "-"}</td>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-4">
                  <Label
                    htmlFor="state"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Role
                  </Label>
                </td>

                <td className="py-3 px-4">
                  {user.role === "2"
                    ? "Advace User"
                    : user.role === "1"
                    ? "User"
                    : "-"}
                </td>
              </tr>
              <tr>
                <td className="px-4 ">
                  <Label
                    htmlFor="state"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Approved
                  </Label>
                </td>
                <td className="py-3 px-4">{user.is_approved ? "Yes" : "No"}</td>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-4">
                  <Label
                    htmlFor="state"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Verified
                  </Label>
                </td>
                <td className="py-3 px-4">{user.is_verified ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="px-4 ">
                  <Label
                    htmlFor="state"
                    className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
                  >
                    Blocked
                  </Label>
                </td>
                <td className="py-3 px-4">{user.is_blocked ? "Yes" : "No"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* </CardContent> */}
      </Card>
    </section>
  );
};

export default Userview;
