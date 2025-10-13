"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, Check, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";

export function MobileProfileView({ userData, onEditProfileClick }) {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-zinc-100 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4">
          {/* <Avatar className="h-16 w-16 border-2 border-gray-200">
            <AvatarImage
              src={userData?.avatar || "/placeholder.svg?height=64&width=64&query=profile+picture"}
              alt={userData?.name || "User"}
            />
            <AvatarFallback className="bg-[#007bff] text-white text-base">
              {userData?.name ? getInitials(userData.name) : "U"}
            </AvatarFallback>
          </Avatar> */}
          <div className="size-10 shrink-0">
            {userData?.profile_pic && (
              <img
                src={userData.profile_pic}
                alt="Profile Picture"
                className="rounded-lg w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 className="text-base font-semibold text-gray-800">{userData?.name || "Guest User"}</h2>
              {/* Three dots icon - placeholder */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="block md:hidden p-0 size-3"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEditProfileClick}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex items-center text-gray-700 text-xs mt-1">
              {userData?.phone_number ? (
                <Link href={`tel:${userData?.phone_number || ""}`} className="flex items-center text-gray-600 text-xs sm:text-xs hover:underline">
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{userData?.phone_number || "N/A"}</span>
                </Link>
              ) : (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>N/A</span>
                </div>
              )}
              {/* <Button variant="link" className="p-0 h-auto ml-2 text-[#007bff]" onClick={onEditProfileClick}>
                Edit Profile
              </Button> */}
            </div>
            <div className="flex items-center text-gray-700 text-xs mt-1">
              {userData?.email && (
                <Link
                  href={`mailto:${userData?.email || ""}`}
                  className="flex items-center text-gray-600 text-xs sm:text-xs hover:underline mt-1"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{userData?.email || "N/A"}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
