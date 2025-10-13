"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X, LogOut, ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getRequest, postRequest } from "@/service/viewService" // Your API service
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "./ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"
import { useDispatch, useSelector } from "react-redux"
import { handleAdminuser, handleUser } from "@/redux/userReducer/userRducer"

export default function Header() {
  const router = useRouter()
  // Get toggle function and mobile state from sidebar context
  const [loginUser, setLoginUser] = useState(null)
  const [emailStatus, setEmailStatus] = useState(false)
  const [statusPopupOpen, setStatusPopupOpen] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)
  const adminuser = useSelector((state) => state.users.adminuser)
  const dispatch = useDispatch()
  useEffect(() => {
    fetchEmailPermission()
    getuserBytoken()
    const user = localStorage.getItem("loginuser")
    if (user) {
      setLoginUser(JSON.parse(user))
    }
    
  }, [])


  async function fetchEmailPermission() {
    try {
      const res = await getRequest("get-email-permission")
      setEmailStatus(res?.data?.send_quotation_mail === "yes")
    } catch (error) {
      console.error("Failed to fetch email permission:", error)
      toast.error("Failed to load email permission status.")
    }
  }

  async function getuserBytoken() {
    const token = localStorage.getItem("token")
    if (token) {
      const responce = await getRequest(`get-user-by-token/${token}`)
      dispatch(handleAdminuser(responce?.data))
    }

  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("loginuser")
    router.push("/dashboard/login") // Use Next.js router for navigation
  }

  const handleStatusChange = async () => {
    setButtonLoading(true)
    const formData = new FormData()
    formData.append("send_quotation_mail", emailStatus ? "no" : "yes")
    try {
      const res = await postRequest("update-email-permission", formData)
      setEmailStatus(res?.data?.send_quotation_mail === "yes")
      setStatusPopupOpen(false)
      toast.success(res.message || "Email status updated successfully.")
    } catch (err) {
      toast.error(err?.message || "Error updating status.")
    } finally {
      setButtonLoading(false)
    }
  }

  return (
    <>
      <div className="items-center w-full gap-5 px-0 py-2.5 flex justify-end">
        {/* Sidebar Toggle Button for Mobile */}

        {loginUser?.role == 0 && (
          <div className="bg-white p-2 text-xs 2xl:text-base text-gray-500 flex items-center gap-3 hover:text-black transition-colors duration-300 ease-linear">
            <span>Premium Email</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <Input
                type="checkbox"
                className="sr-only peer"
                checked={emailStatus}
                onChange={() => setStatusPopupOpen(true)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7367f0]/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7367f0]" />
            </label>
          </div>
        )}

        <div className="shrink-0 flex items-center gap-2 sm:gap-3">
          <div className="relative px-1 shrink-0">
            <a href="/" className="hidden sm:flex items-center gap-2 text-gray-700">
              <ExternalLink className="size-5" />
              <span className="text-xs 2xl:text-base">visit site</span>
            </a>
          </div>
        </div>

        <div className="relative shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="cursor-pointer flex items-center text-gray-700 h-auto p-0 hover:bg-transparent">
                <span className="shrink-0 block mr-3 font-medium text-xs 2xl:text-base">{loginUser?.name}</span>
                <span className="shrink-0 rounded-full bg-[#7367f0] flex items-center justify-center text-white font-semibold size-7 md:size-9 2xl:size-10">
                  {loginUser?.name?.charAt(0)?.toUpperCase()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[260px] p-3">
              <div className="relative z-10 p-2">
                <span className="block font-medium text-gray-700 text-xs dark:text-gray-400">{loginUser?.name}</span>
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{loginUser?.email}</span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="relative z-10 cursor-pointer flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-xs hover:bg-gray-100 hover:text-[#7367f0]"
                onClick={handleLogout}
              >
                <LogOut className="size-5 fill-gray-500 group-hover:fill-[#7367f0]" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Email Status Change Dialog */}
      <AlertDialog open={statusPopupOpen} onOpenChange={setStatusPopupOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <button
            onClick={() => setStatusPopupOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 focus:outline-none"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle>Change email status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {emailStatus ? "off" : "on"} premium email service?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange} disabled={buttonLoading}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
