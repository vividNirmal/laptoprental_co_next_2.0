"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { List, Package, User, Lock } from "lucide-react"
import { useMediaQuery } from "../../../hooks/useMediaQuery"
import { MobileProfileView } from "@/components/page/userPanel/Profile/mobileProfileView"
import { EditProfileForm } from "@/components/page/userPanel/Profile/editProfile"
import { DesktopBusinessListings } from "@/components/page/userPanel/Profile/desktopBusinessListing"
import { ChangePasswordForm } from "@/components/page/userPanel/Profile/changePassword"
import { useSelector } from "react-redux"
import ProductsContent from "./manageProduct"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("business-listings")
  const [mobileViewMode, setMobileViewMode] = useState("profile") // 'profile' or 'edit'
  const isSmallScreen = useMediaQuery("(max-width: 570px)")
  const userData = useSelector((state) => state.users.user)

  useEffect(() => {
    document.title = "Profile - Your App Name"
  }, [])

  // Reset mobile view mode when screen size changes from small to large
  useEffect(() => {
    if (!isSmallScreen && mobileViewMode === "edit") {
      setMobileViewMode("profile")
    }
  }, [isSmallScreen, mobileViewMode])

  const handleEditProfileClick = () => {
    setMobileViewMode("edit")
  }

  const handleEditFormCancel = () => {
    setMobileViewMode("profile")
  }

  const handleEditFormSaveSuccess = () => {
    //checkAuthStatus() // Re-fetch user data to update displayed info
    setMobileViewMode("profile") // Go back to profile view after saving
  }



  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        {/* Profile Content Area */}
        <div className="bg-white rounded-lg shadow-md p-2.5 md:p-6">
          {isSmallScreen ? (
            // Mobile Layout
            <>
              {mobileViewMode === "profile" && (
                <MobileProfileView userData={userData} onEditProfileClick={handleEditProfileClick} />
              )}
              {mobileViewMode === "edit" && (
                <EditProfileForm
                  userData={userData}
                  onSaveSuccess={handleEditFormSaveSuccess}
                  onCancel={handleEditFormCancel}
                />
              )}
              {/* Mobile Change Password (if needed, can be added here or via a separate button/modal) */}
              {/* For now, keeping it only in desktop tabs as per previous context, but can be added here if desired */}
            </>
          ) : (
            // Desktop Layout (Tabs)
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-gray-100 rounded-lg mb-6">
                <TabsTrigger value="business-listings" className="cursor-pointer flex items-center gap-2 p-3 data-[state=active]:bg-[#012B72] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-colors">
                  <List className="h-4 w-4" />
                  Business Listings
                </TabsTrigger>
                <TabsTrigger value="products" className="cursor-pointer flex items-center gap-2 p-3 data-[state=active]:bg-[#012B72] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-colors">
                  <Package className="h-4 w-4" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="edit-profile" className="cursor-pointer flex items-center gap-2 p-3 data-[state=active]:bg-[#012B72] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-colors">
                  <User className="h-4 w-4" />
                  Edit Profile
                </TabsTrigger>
                <TabsTrigger value="change-password" className="cursor-pointer flex items-center gap-2 p-3 data-[state=active]:bg-[#012B72] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-colors">
                  <Lock className="h-4 w-4" />
                  Change Password
                </TabsTrigger>
              </TabsList>

              {/* Tabs Content */}
              <TabsContent value="business-listings">
                <DesktopBusinessListings />
              </TabsContent>

              <TabsContent value="products">
                <ProductsContent />
              </TabsContent>

              <TabsContent value="edit-profile">
                <EditProfileForm userData={userData} />
              </TabsContent>

              <TabsContent value="change-password">
                <ChangePasswordForm />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
