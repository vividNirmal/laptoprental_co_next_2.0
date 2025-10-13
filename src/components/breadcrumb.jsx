"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "./ui/separator";

// Helper function to determine if a segment looks like an ID
const isIdSegment = (segment) => { 
  return /^[a-zA-Z0-9]{10,}$/.test(segment);
};
const formatSegment = (segment) => {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  
  const getPageTitle = () => {  
    if (pathSegments.length === 0) return "Home";
    const lastSegment = pathSegments[pathSegments.length - 1];    
    if (isIdSegment(lastSegment)) {
      return "Edit";
    }    
    return formatSegment(lastSegment);
  };
  const pageTitle = getPageTitle();
  return (
    <div className="flex items-center max-w-full mb-4 2xl:mb-6">
      <h2 className="text-xl 2xl:text-2xl font-medium tracking-tight text-primary">{pageTitle}</h2>
      <Separator orientation="vertical" className="bg-zinc-300 mx-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathSegments.map((segment, index) => {
            let href = "/" + pathSegments.slice(0, index + 1).join("/");
            let displaySegment = segment
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            const isLast = index === pathSegments.length - 1;
            
            if (segment === "dashboard") {
              href = "/dashboard";
            }

            // If it's the last segment and looks like an ID, display "Edit"
            if (isLast && isIdSegment(segment)) {
              displaySegment = pageTitle;
            }

            return (
              <Fragment key={href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{displaySegment}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>{displaySegment}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
