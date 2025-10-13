import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumb";

export default async function RootLayout({ children }) {
  return (
    <Suspense fallback={<Loader2 />}>
      <SidebarProvider className={'bg-[#f7f7f7]'}>
        <AppSidebar />
        <SidebarInset className={'bg-transparent gap-5'}>
          <header className="flex shrink-0 items-center gap-2 rounded-2xl bg-white border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)] transition-[width,height] ease-linear">
            <div className="flex items-center gap-2 px-4 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Header />
            </div>
          </header>
          <div className="flex flex-1 flex-col space-y-4 p-4 2xl:p-5 bg-white rounded-2xl border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)]">
            <Breadcrumbs/>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>      
    </Suspense>
  );
}
