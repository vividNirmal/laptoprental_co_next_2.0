"use client"
import Link from "next/link"
import { ChevronRight, Home, BookOpen, ListTree, Info, DollarSign, Mail, FileText, LogIn, LogOut, LogOutIcon } from "lucide-react"
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { userGetRequest } from "@/service/viewService";
import { handleUser } from "@/redux/userReducer/userRducer";


export function AppMobileSidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();
   const userdata = useSelector((state) => state.users.user);
     const [isLogin, setIsLogin] = useState(false); 
     
    useEffect(() => {
      const login = localStorage.getItem('usertoken');
      if(login){
        setIsLogin(true);
        getuserBytoken();
      }
    },[isLogin])
      async function getuserBytoken() {
        const token = localStorage.getItem("usertoken")
        if (token) {
          const responce = await userGetRequest(`get-frontenduser-by-token/${token}`)
          dispatch(handleUser(responce?.data))
        }    
      }
      const handleLogout = () => {
        localStorage.removeItem("usertoken")
        localStorage.removeItem("loginuser")
        setIsLogin(false)
        router.push("/") // Use Next.js router for navigation
      }
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out"
          onClick={onClose}
          aria-hidden={!isOpen}
        />
      )}

      {/* Sidebar content */}
      <aside
        className={`fixed top-0 left-0 h-dvh z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-[250px] bg-white shadow-lg flex flex-col`}
      >
        <div className="bg-[#007bff] p-4 flex items-center gap-3">
          <span className="rounded-full size-8 block bg-white shrink-0" />
          <h2 className="text-white text-base font-medium grow">{userdata?.name}</h2>
          <button onClick={onClose} aria-label="Close sidebar">
            <ChevronRight className="text-white size-5" />
          </button>
        </div>
        <nav className="p-2 flex-1 overflow-y-auto">
          <ul className="p-2 flex flex-col gap-1.5">
            <li>
              <Link
                className="flex items-center gap-2.5 text-gray-500 text-xs hover:text-black p-1"
                href="/"
                onClick={onClose}
              >
                <Home className="size-4 2xl:size-5" />
                <span className="grow block">Home</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex items-center gap-2.5 text-gray-500 text-xs hover:text-black p-1"
                href="/blog"
                onClick={onClose}
              >
                <BookOpen className="size-4 2xl:size-5" />
                <span className="grow block">Blog</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex items-center gap-2.5 text-gray-500 text-xs hover:text-black p-1"
                href="/sitemap"
                onClick={onClose}
              >
                <ListTree className="size-4 2xl:size-5" />
                <span className="grow block">Sitemap</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex items-center gap-2.5 text-gray-500 text-xs hover:text-black p-1"
                href="/about"
                onClick={onClose}
              >
                <Info className="size-5" />
                <span className="grow block">About Us</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex items-center gap-2.5 text-gray-500 text-xs hover:text-black p-1"
                href="/price-plan"
                onClick={onClose}
              >
                <DollarSign className="size-5" />
                <span className="grow block">Price Plan</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex items-center gap-2.5 text-gray-500 text-xs hover:text-black p-1"
                href="/contact-us"
                onClick={onClose}
              >
                <Mail className="size-5" />
                <span className="grow block">Contact Us</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex items-center gap-2.5 text-gray-500 text-xs hover:text-black p-1"
                href="/terms-condition"
                onClick={onClose}
              >
                <FileText className="size-5" />
                <span className="grow block">Terms & Conditions</span>
              </Link>
            </li>
            {isLogin && (
              <li>
                <Link
                  className="flex items-center gap-2.5 text-gray-500 text-xs hover:text-black p-1"
                  href="/profile"
                >
                  <FileText className="size-5" />
                  <span className="grow block">My Profile</span>
                </Link>
              </li>
            )}
            {isLogin && (
              <li>
                <Link
                  className="flex items-center gap-2.5 text-gray-500 text-xs hover:text-black p-1"
                  href="/list"
                >
                  <FileText className="size-5" />
                  <span className="grow block">All List</span>
                </Link>
              </li>
            )}
            {isLogin && (
              <li>
                <Link
                  className="flex items-center gap-2.5 text-gray-500 text-xs hover:text-black p-1"
                  href="/product"
                >
                  <FileText className="size-5" />
                  <span className="grow block">Product</span>
                </Link>
              </li>
            )}
            {isLogin && (
              <li>
                <Link
                  className="flex items-center gap-2.5 text-gray-500 text-xs hover:text-black p-1"
                  href="/ChangePassword"
                >
                  <FileText className="size-5" />
                  <span className="grow block">Change Password</span>
                </Link>
              </li>
            )}                        
            {!isLogin ? (<li>
              <Link
                className="flex items-center gap-2.5 text-gray-500 text-xs hover:text-black p-1"
                href="/login"
              >
                <LogIn className="size-5" />
                <span className="grow block">Login</span>
              </Link>
            </li>) : (
              <li>
              <Link
                className="flex items-center gap-2.5 text-gray-500 text-xs hover:text-black p-1"
                href="/login"
                onClick={handleLogout}
              >
                <LogOutIcon className="size-5" />
                <span className="grow block">Logout</span>
              </Link>
            </li>
            )}
          </ul>
        </nav>
      </aside>
    </>
  )
}
