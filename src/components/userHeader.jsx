"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Menu,
  Search,
  LogIn,
  Phone,
  MapPin,
  Loader,
  Loader2,
  Ghost,
  SearchIcon,
  User,
  ChevronDown,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import {
  getRequest,
  userGetRequest,
  userPostRequest,
} from "@/service/viewService";
import { useDispatch, useSelector } from "react-redux";
import {
  handleBanner,
  handleCategory,
  handleFooterData,
  handlePageloader,
  handleSearchValue,
  handleSetSticData,
} from "@/redux/settingReducer/settinReducer";
import { usePathname, useRouter } from "next/navigation";
import { AppMobileSidebar } from "./page/mobileviewSidebar";
import { handleUser } from "@/redux/userReducer/userRducer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import JsonLdScript from "@/components/JsonLdScript";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import SearchDropdown from "./SearchDropdown";
import {
  getSelectedLocation,
  setSelectedLocation as saveSelectedLocation,
  clearSelectedLocation,
  formatLocationDisplayName,
  isValidLocation
} from "@/lib/locationStorage";

export function DynamicFavicon() {
  const staticdata = useSelector((state) => state.setting.staticData);
  
  useEffect(() => {
    if (staticdata?.fav_icon) {
      const favIcon = staticdata.fav_icon;
      
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach(link => link.remove());
      
      // Add new favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      link.href = favIcon;
      document.head.appendChild(link);
      
      // Add apple-touch-icon
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = favIcon;
      document.head.appendChild(appleTouchIcon);
      
      // Add shortcut icon for older browsers
      const shortcutIcon = document.createElement('link');
      shortcutIcon.rel = 'shortcut icon';
      shortcutIcon.href = favIcon;
      document.head.appendChild(shortcutIcon);
      
      
    }
  }, [staticdata?.fav_icon]); // Update whenever favicon changes in Redux

  return null;
}

export default function UserHeader() {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userSelectedLocation, setUserSelectedLocation] = useState(false);
  const [banner, setBanner] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  
  
  // Function to clear user selection (updated to use localStorage)
  const clearUserLocationSelection = () => {
    setUserSelectedLocation(false);
    clearSelectedLocation();
    sessionStorage.removeItem("user_selected_location");
    sessionStorage.removeItem("location_data");
    setSelectedLocation(null);
    setLocationSearch("");
  };

  // Helper function to convert different location formats to internal format
  const convertToInternalFormat = (location) => {
    if (!location) return null;
    
    // Handle localStorage format (from our new system)
    if (location._id && location.type) {
      return {
        area_name: location.area || undefined,
        city_name: location.city,
        location_type: location.type,
        current_location_id: location._id,
      };
    }
    
    // Handle existing sessionStorage format
    if (location.location_type) {
      return {
        area_name: location.area_name,
        city_name: location.city_name,
        location_type: location.location_type,
        current_location_id: location.current_location_id,
      };
    }
    
    return location;
  };

  // Helper function to convert internal format to localStorage format
  const convertToStorageFormat = (location) => {
    if (!location) return null;
    
    return {
      _id: location.current_location_id || location._id,
      type: location.location_type || location.type,
      city: location.city_name || location.city,
      state: location.state || "Maharashtra", // Default fallback
      ...(location.area_name && { area: location.area_name })
    };
  };
  const [structuredSchemas, setStructuredSchemas] = useState([]);
  const staticdata = useSelector((state) => state.setting.staticData);
  const userdata = useSelector((state) => state.users.user);
  const listingData = useSelector((state) => state.listing);
  const searchValue = useSelector((state) => state.setting.searchvalue);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [pageLoader, setPageLoader] = useState(true);

  useEffect(() => {
    // First, check localStorage for user-selected location (priority #1)
    const storedLocation = getSelectedLocation();
    
    if (storedLocation && isValidLocation(storedLocation)) {
      // User has previously selected a location, use it
      const setDataobject = convertToInternalFormat(storedLocation);
      setSelectedLocation(setDataobject);
      setUserSelectedLocation(true);
      setLocationSearch(locatioPreviews(setDataobject));
      fetchFrontEndSettings(setDataobject?.current_location_id);
      
      // Also update sessionStorage for consistency
      sessionStorage.setItem("location_data", JSON.stringify(setDataobject));
      sessionStorage.setItem("user_selected_location", "true");
    } else {
      // No user selection, check sessionStorage for API-provided location
      const sessionLocationData = sessionStorage.getItem("location_data");
      const userSelectedFlag = sessionStorage.getItem("user_selected_location") === "true";
      
      setUserSelectedLocation(userSelectedFlag);
      
      if (sessionLocationData && !userSelectedFlag) {
        const locationData = JSON.parse(sessionLocationData);
        const setDataobject = convertToInternalFormat(locationData);
        fetchFrontEndSettings(setDataobject?.current_location_id);
        setLocationSearch(locatioPreviews(setDataobject));
        setSelectedLocation(setDataobject);
      } else {
        // No stored location data, fetch initial settings
        fetchInitialFrontEndSettings();
      }
    }

    fetchFooter();
  }, []);

  useEffect(() => {
    // Check localStorage first (user's persistent choice)
    const storedLocation = getSelectedLocation();
    
    if (storedLocation && isValidLocation(storedLocation)) {
      // User has a saved location preference, use it
      const setDataobject = convertToInternalFormat(storedLocation);
      setLocationSearch(locatioPreviews(setDataobject));
      setSelectedLocation(setDataobject);
      setUserSelectedLocation(true);
      dispatch(handleSearchValue(setDataobject));
    } else if (!userSelectedLocation) {
      // Only update from sessionStorage if user hasn't manually selected a location
      const sessionLocationData = sessionStorage.getItem("location_data");
      if (sessionLocationData) {
        const locationData = JSON.parse(sessionLocationData);
        const setDataobject = convertToInternalFormat(locationData);
        
        if (setDataobject) {
          setLocationSearch(locatioPreviews(setDataobject));
          setSelectedLocation(setDataobject);
          dispatch(handleSearchValue(setDataobject));
        }
      }
    }
  }, [pathname, dispatch, userSelectedLocation]);

  useEffect(() => {
    const login = localStorage.getItem("usertoken");
    if (login) {
      setIsLogin(true);
      getuserBytoken();
    }
  }, [isLogin]);

  useEffect(() => {
    if (staticdata && Object.keys(staticdata).length > 0) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: staticdata.site_name || window.location.hostname,
        url: staticdata.url || window.location.origin,
        logo: staticdata.website_logo || staticdata.mobile_logo || "",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: staticdata.phone_number || "",
          contactType: "Customer Service",
          areaServed: "IN",
          availableLanguage: ["English", "Hindi"],
          email: staticdata.contact_email || "",
        },
        sameAs: [
          staticdata.facebook,
          staticdata.twitter,
          staticdata.linkedin,
        ].filter(Boolean),
      };

      setStructuredSchemas([
        {
          id: "home-page-schema",
          data: structuredData,
        },
      ]);
    }
  }, [staticdata]);

  async function getuserBytoken() {
    const token = localStorage.getItem("usertoken");
    if (token) {
      const responce = await userGetRequest(
        `get-frontenduser-by-token/${token}`
      );
      dispatch(handleUser(responce?.data));
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("usertoken");
    localStorage.removeItem("loginuser");
    setIsLogin(false);
    router.push("/"); 
  };

  async function fetchFooter() {
    const responce = await userGetRequest(`frontend-footer`);
    if (responce) {
      dispatch(handleFooterData(responce.data));
      dispatch(handlePageloader(false));
    }
  }

  async function fetchBanner() {
    setPageLoader(true);
    const responce = await userGetRequest(
      `frontend-ads?current_city_id=${selectedLocation?.current_location_id || ""
      }`
    );
    if (responce) {
      setBanner(responce.data);
      setPageLoader(false);
      dispatch(handleBanner(responce.data));
    }
  }

  useEffect(() => {
    if (selectedLocation?.current_location_id) {
      fetchBanner();
    }
  }, [selectedLocation]);

  async function fetchHomepage(selectedLocation) {
    const formData = new FormData();
    formData.append("current_location_id", selectedLocation?._id);
    const resHome = await userPostRequest("home-page", formData);
    if (resHome) {
      if (Object.keys(resHome?.data?.current_location || {}).length > 0) {
        sessionStorage.setItem(
          "location_data",
          JSON.stringify(resHome?.data?.current_location)
        );
      }
      if (resHome.data?.home_page_category) {
        dispatch(handleCategory(resHome.data?.home_page_category));
      }
      if (
        resHome?.data?.current_location &&
        resHome?.data?.current_location?.current_location_id
      ) {
        fetchFrontEndSettings(
          resHome?.data?.current_location?.current_location_id
        );
        const location = setLocation(resHome?.data?.current_location);
        setLocationSearch(locatioPreviews(location));
      }
      setTimeout(() => {
        dispatch(handlePageloader(false));
      }, 500);
    }
  }

  function setLocation(location) {
    let setDataobject;
    if (location?.location_type == "area") {
      setDataobject = {
        area_name: location.area_name,
        city_name: location.city_name,
        location_type: location?.location_type,
        current_location_id: location?.current_location_id,
      };
    } else {
      setDataobject = {
        city_name: location.city_name,
        location_type: location?.location_type,
        current_location_id: location?.current_location_id,
      };
    }
    return setDataobject;
  }

  async function fetchFrontEndSettings(current_location_id) {
    const responce = await userGetRequest(
      `frontend-settings?current_city_id=${current_location_id || ""}`
    );
    if (responce) {
      dispatch(handleSetSticData(responce.data?.site_data));
      // Favicon will be automatically updated by DynamicFavicon component
      // which watches the Redux state
    }
  }

  async function fetchInitialFrontEndSettings() {
    let setDataobject;
    const response = await userGetRequest(`frontend-settings`);
    if (response) {
      dispatch(handleSetSticData(response.data?.site_data));
      // Favicon will be automatically updated by DynamicFavicon component
      
      const locationData = response.data?.current_location || {};
      if (locationData?.location_type == "area") {
        setDataobject = {
          area_name: locationData?.area_name,
          city_name: locationData?.city_name,
          location_type: locationData?.location_type,
          current_location_id: locationData?.current_location_id,
        };
      } else {
        setDataobject = {
          city_name: locationData?.city_name,
          location_type: locationData?.location_type,
          current_location_id: locationData?.current_location_id,
        };
      }
      setLocationSearch(locatioPreviews(setDataobject));
      setSelectedLocation(setDataobject);
    }
  }

  const handleLocationSelect = (location) => {
    // Convert to internal format
    let setDataobject = convertToInternalFormat(location);
    
    // If conversion didn't work, handle manually (existing logic)
    if (!setDataobject) {
      if (location.location_type == "area") {
        setDataobject = {
          area_name: location.area_name,
          city_name: location.city_name,
          location_type: location?.location_type,
          current_location_id: location?.current_location_id,
        };
      } else {
        setDataobject = {
          city_name: location.city,
          location_type: location?.type,
          current_location_id: location?._id,
        };
      }
    }
    
    // Save to localStorage (primary storage for user selection)
    const storageFormat = convertToStorageFormat(setDataobject);
    if (storageFormat && isValidLocation(storageFormat)) {
      saveSelectedLocation(storageFormat);
    }
    
    // Update component state
    setSelectedLocation(setDataobject);
    setUserSelectedLocation(true); // Mark as user-selected
    
    // Keep sessionStorage for session consistency  
    sessionStorage.setItem("user_selected_location", "true");
    sessionStorage.setItem("location_data", JSON.stringify(setDataobject));
    
    // Update Redux and UI
    dispatch(handleSearchValue(setDataobject));
    setLocationSearch(locatioPreviews(setDataobject));
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Handle modal navigation
    if (isLocationModalOpen) {
      setIsLocationModalOpen(false);
      setIsCategoryModalOpen(true);
    }
    
    // Fetch homepage data
    fetchHomepage(location);

    // Handle routing logic
    if (listingData.ListingType !== "category_location") {
      router.push("/");
    } else {
      if (
        listingData.categoryDetails != null &&
        listingData.categoryDetails != undefined
      ) {
        const locationName =
          location.type === "city" ? location.city : location.area;

        let cleanLocationName = "";
        if (locationName) {
          cleanLocationName = locationName
            .toLowerCase()
            .replace(/[^\w\s-]/g, "") 
            .replace(/KATEX_INLINE_OPEN([^)]+)KATEX_INLINE_CLOSE/g, "$1") 
            .replace(/[\s(),.-]+/g, "-") 
            .replace(/-+/g, "-") 
            .replace(/(^-|-$)/g, ""); 
        }

        const newSlug =
          `${listingData.categoryDetails.slug}-${cleanLocationName}`.toLowerCase();
        const newUrl = `/${newSlug}/${listingData.categoryDetails.unique_id}`;

        router.push(newUrl);
      }
    }
  };

  useEffect(() => {
    const locationData = searchValue;
    let setDataobject;
    if (locationData?.location_type == "area") {
      setDataobject = {
        area_name: locationData?.area_name,
        city_name: locationData?.city_name,
        location_type: locationData?.location_type,
        current_location_id: locationData?.current_location_id,
      };
    } else {
      setDataobject = {
        city_name: locationData?.city_name,
        location_type: locationData?.location_type,
        current_location_id: locationData?.current_location_id,
      };
    }

    if (setDataobject && locationData) {
      setLocationSearch(locatioPreviews(setDataobject));
      fetchFrontEndSettings(setDataobject.current_location_id);
    }
  }, [searchValue]);

  async function handleCategoryselcted(item) {
    const formData = new FormData();
    formData.append("category_id", item.unique_id);
    await userPostRequest("store-category-search-count", formData);
    const path = new URL(item.current_url).pathname;
    const relativePath = path.startsWith("/") ? path.slice(1) : path;
    router.push(`${relativePath}`);
  }

  function locatioPreviews(data) {
    if (!data) return null;
    
    if (data.location_type) {
      if (data?.area_name && data?.city_name) {
        return `${data.area_name}, ${data.city_name}`;
      } else if (data?.city_name) {
        return `${data.city_name}`;
      } else if (data?.area_name) {
        return `${data.area_name}`;
      }
    } else {
      if (data?.area && data?.city) {
        return `${data.area}, ${data.city}`;
      } else if (data?.city) {
        return `${data.city}`;
      } else if (data?.area) {
        return `${data.area}`;
      }
    }
    return null;
  }

  // Add this function for development/testing purposes - can be called from browser console
  if (typeof window !== 'undefined') {
    window.clearAllLocationData = () => {
      clearUserLocationSelection();      
    };
    window.getLocationStatus = () => {
      const stored = getSelectedLocation();
      const session = sessionStorage.getItem("location_data");
      return { stored, session: session ? JSON.parse(session) : null };
    };
  }

  return (
    <>     
      <header className="w-full bg-white border-b border-gray-200 py-2.5 md:py-4">
        <div className="container px-2.5 mx-auto">
          <div className="flex flex-wrap items-center gap-2 lg:gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden w-10 h-8 p-0 border-gray-400 text-gray-400 hover:border-gray-800 hover:text-gray-800 bg-transparent"
              onClick={() => {
                setIsSidebarOpen(true);
              }}
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Logo */}
            <div className="max-w-52 w-full">
              <Link href="/" className="block w-full">
                <Avatar className="w-full h-10">
                  <AvatarFallback className="text-xl font-bold text-black">Laptoprental.co</AvatarFallback>
                </Avatar>
              </Link>
            </div>
            {/* Search Section */}
            <div className="hidden sm:flex flex-wrap items-center gap-2 grow 2xl:grow-0 lg:gap-4 w-full sm:w-5/12 lg:w-2/4">
              <div className="relative w-5/12 lg:w-5/12">
                <SearchDropdown
                  key="location-search"
                  instanceId="location-search"
                  placeholder="Search City, Area..."
                  value={locationSearch}
                  onChange={setLocationSearch}
                  onSelect={handleLocationSelect}
                  fetchData={async (query) => {
                    const response = await userGetRequest(
                      query.trim() !== ""
                        ? `search-city-area?location=${encodeURIComponent(query)}`
                        : `search-city-area?popular=true`
                    );
                    
                    if (response?.results) {
                      let sortedResults = response.results;
                      if (query && query.trim() !== "") {
                        sortedResults = sortedResults.sort((a, b) => {
                          const aText = locatioPreviews(a).toLowerCase();
                          const bText = locatioPreviews(b).toLowerCase();
                          const searchTerm = query.toLowerCase();
                          
                          const aExact = aText === searchTerm ? 1 : 0;
                          const bExact = bText === searchTerm ? 1 : 0;
                          if (aExact !== bExact) return bExact - aExact;
                          
                          const aStarts = aText.startsWith(searchTerm) ? 1 : 0;
                          const bStarts = bText.startsWith(searchTerm) ? 1 : 0;
                          if (aStarts !== bStarts) return bStarts - aStarts;
                          
                          const aContains = aText.includes(searchTerm) ? 1 : 0;
                          const bContains = bText.includes(searchTerm) ? 1 : 0;
                          if (aContains !== bContains) return bContains - aContains;
                          
                          return 0; 
                        });
                      }
                      
                      return sortedResults;
                    }
                    return [];
                  }}
                  renderItemText={locatioPreviews}
                  icon={MapPin}
                  emptyMessage="No locations found"
                  loadingMessage="Searching locations..."
                  minQueryLength={0}
                  showOnFocus={true}
                  hideOnSelect={true}
                />
              </div>

              {/* Category Search */}
              <div className="relative w-5/12 lg:w-2/4 grow">
                <div className="relative w-full">
                  <SearchDropdown
                    key="category-search"
                    instanceId="category-search"
                    placeholder="Enter Keyword"
                    value={categorySearch}
                    onChange={setCategorySearch}
                    onSelect={handleCategoryselcted}
                    fetchData={async (query) => {
                      if (!query.trim()) return [];
                      
                      let location = JSON.parse(sessionStorage.getItem("location_data") || "{}");
                      let locItem = location?.location_type === "area" 
                        ? location?.area_name 
                        : location?.city_name;

                      const response = await userGetRequest(
                        `search-category?name=${encodeURIComponent(query)}&location=${encodeURIComponent(locItem || "")}`
                      );
                      
                      return response?.data || [];
                    }}
                    renderItemText={(item) => item.name}
                    emptyMessage="No categories found"
                    loadingMessage="Searching categories..."
                    minQueryLength={1}
                    showOnFocus={false}
                    hideOnSelect={true}
                    className="pr-12 border-[#cccccc] shadow-[0_2px_4px_0_rgba(0,0,0,.15)] focus:border-[#007bff]"
                  />
                  <Button
                    size="sm"
                    className="absolute top-1/2 -translate-y-1/2 right-1 size-7 p-0 bg-orange-400 hover:bg-orange-500"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Location Display Button */}
            <Button
              variant={Ghost}
              className="flex md:hidden ml-auto items-center gap-1 text-xs min-w-20 !px-0"
              onClick={() => {
                setIsCategoryModalOpen(true);
              }}
            >
              <MapPin className="text-orange-400 size-4 2xl:size-5 shrink-0" />
              <span className="text-xs sm:text-xs w-24 text-left whitespace-nowrap overflow-hidden text-ellipsis">
                {selectedLocation ? locatioPreviews(selectedLocation) : null}
              </span>
            </Button>

            <Dialog
              open={isCategoryModalOpen}
              onOpenChange={setIsCategoryModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full max-w-full justify-normal pl-8 py-2.5 h-auto 2xl:h-auto relative md:hidden"
                >
                  <SearchIcon />
                  Search Category
                </Button>
              </DialogTrigger>
              <DialogContent className="flex flex-col rounded-b-none sm:max-w-full fixed bottom-0 left-1/2 -translate-x-1/2 translate-y-full data-[state=open]:-translate-y-[20svh] transition-all duration-300 ease-out rounded-t-2xl shadow-lg bg-white w-full h-[70svh] overflow-y-auto">
                <DialogHeader className={"shrink-0"}>
                  <DialogTitle>Search Your Category</DialogTitle>
                </DialogHeader>
                <div className="mb-3 flex items-center gap-1 border border-solid border-orange-300 rounded-xl max-w-fit p-1.5 px-3 w-full mx-auto h-9">
                  <MapPin className="h-5 w-5 text-orange-300" />
                  <Button
                    variant="ghost"
                    className="rounded-full border-0 outline-none text-gray-600 max-w-fit w-full pl-1 text-xs lg:text-base"
                    onClick={() => {
                      setIsCategoryModalOpen(false);
                      setIsLocationModalOpen(true);
                    }}
                  >
                    {selectedLocation
                      ? locatioPreviews(selectedLocation)
                      : null}
                  </Button>
                </div>
                <SearchDropdown
                  placeholder="Search Category"
                  value={categorySearch}
                  onChange={setCategorySearch}
                  onSelect={handleCategoryselcted}
                  fetchData={async (query) => {
                    if (!query.trim()) return [];
                    
                    let location = JSON.parse(sessionStorage.getItem("location_data") || "{}");
                    let locItem = location?.location_type === "area" 
                      ? location?.area_name 
                      : location?.city_name;

                    const response = await userGetRequest(
                      `search-category?name=${encodeURIComponent(query)}&location=${encodeURIComponent(locItem || "")}`
                    );
                    
                    return response?.data || [];
                  }}
                  renderItemText={(item) => item.name}
                  emptyMessage="No categories found"
                  loadingMessage="Searching categories..."
                  minQueryLength={1}
                  showOnFocus={false}
                  hideOnSelect={true}
                  className="w-full mb-2 px-2.5 py-2 text-xs md:text-base border border-solid border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </DialogContent>
            </Dialog>

            <div className="w-full sm:w-2/4 md:w-1/3 lg:w-1/4 hidden sm:flex flex-wrap gap-3 sm:ml-auto justify-end items-center xl:justify-end pl-4 xl:pl-8 order-none lg:order-3 relative">
              {userdata && isLogin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="">
                    <Button className="flex items-center gap-1.5 cursor-pointer rounded-md border border-solid border-[#007bff] bg-[#007bff] text-white px-2 py-1.5 hover:bg-[#0056b3] hover:border-[#0056b3] transition-colors">
                      <User className="h-5 w-5" />
                      <p className="text-xs xl:text-xs capitalize w-12 xl:w-14 whitespace-nowrap overflow-hidden text-ellipsis">
                        {userdata.name}
                      </p>
                      <ChevronDown className="h-4 w-4 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="absolute -right-4 mt-2.5 flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-[0_2px_6px_0_rgba(0,0,0,0.12)]"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal">
                      <span className="block font-medium text-gray-700 text-xs">
                        {userdata.name}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="border-b border-gray-200" />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-1.5 mt-1 font-medium text-gray-700 rounded-lg group text-xs hover:bg-gray-100 hover:text-[#7367f0] transition-all duration-200 ease-linear"
                      >
                        <User className="h-4 w-4 fill-gray-500 group-hover:fill-[#7367f0]" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="relative z-10 cursor-pointer flex items-center gap-3 px-3 py-1.5 mt-2 font-medium text-gray-700 rounded-lg group text-xs hover:bg-gray-100 hover:text-[#7367f0] transition-all duration-200 ease-linear"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 fill-gray-500 group-hover:fill-[#7367f0]" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button className="bg-[#007bff] hover:bg-white hover:text-[#007bff] border border-[#007bff] px-2 py-1.5 hover:scale-103 active:scale-95 active:shadow-none">
                    <LogIn className="h-5 w-5 mr-1.5" />
                    <span className="text-xs xl:text-base">Login</span>
                  </Button>
                </Link>
              )}

              {/* Call Button */}
              {staticdata?.phone_number && (
                <Link href={`tel:${staticdata?.phone_number}`}>
                  <Button className="bg-green-600 hover:bg-white hover:text-green-600 border border-green-600 px-2 py-1.5 2xl:px-3 2xl:py-2 hover:scale-103 active:scale-95 active:shadow-none animate-pulse">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>Call Us!</span>
                  </Button>
                </Link>)}
            </div>
          </div>
          {pageLoader && !banner ? (
            <div
              className={`w-full md:rounded-xl overflow-hidden mt-5`}
            >
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : <></>}
          {banner?.ad_header_banners_data?.randomBanner?.banner_image && (
            <div
              className={`w-full md:rounded-xl overflow-hidden ${banner?.ad_header_banners_data?.randomBanner ? "mt-5" : ""
                } `}
            >
              <Link
                className="w-full block"
                href={
                  banner?.ad_header_banners_data?.randomBanner?.banner_url ||
                  "/"
                }
              >
                <Image
                  src={
                    banner?.ad_header_banners_data?.randomBanner?.banner_image
                  }
                  className="block max-w-full h-32 w-full object-cover"
                  alt="ads image"
                  width={1300}
                  height={128}
                  priority
                />
              </Link>
            </div>
          )}
        </div>
      </header>
      <AppMobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      {/* Location Search Modal */}
      <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
        <DialogContent className="flex flex-col rounded-b-none sm:max-w-full fixed bottom-0 left-1/2 -translate-x-1/2 translate-y-full data-[state=open]:-translate-y-[20svh] transition-all duration-300 ease-out rounded-t-2xl shadow-lg bg-white w-full h-[70svh] overflow-y-auto">
          <DialogHeader className="items-center flex-row">
            <Button
              variant="ghost"
              onClick={() => {
                setIsLocationModalOpen(false);
                setIsCategoryModalOpen(true);
              }}
            >
              <ArrowLeft />
            </Button>
            <DialogTitle>Search your location</DialogTitle>
          </DialogHeader>
          <SearchDropdown
            placeholder="Search City, Area..."
            value={locationSearch}
            onChange={setLocationSearch}
            onSelect={handleLocationSelect}
            fetchData={async (query) => {
              const response = await userGetRequest(
                query.trim() !== ""
                  ? `search-city-area?location=${encodeURIComponent(query)}`
                  : `search-city-area?popular=true`
              );
              
              if (response?.results) {
                let sortedResults = response.results;
                if (query && query.trim() !== "") {
                  sortedResults = sortedResults.sort((a, b) => {
                    const aText = locatioPreviews(a).toLowerCase();
                    const bText = locatioPreviews(b).toLowerCase();
                    const searchTerm = query.toLowerCase();
                    
                    const aExact = aText === searchTerm ? 1 : 0;
                    const bExact = bText === searchTerm ? 1 : 0;
                    if (aExact !== bExact) return bExact - aExact;
                    
                    const aStarts = aText.startsWith(searchTerm) ? 1 : 0;
                    const bStarts = bText.startsWith(searchTerm) ? 1 : 0;
                    if (aStarts !== bStarts) return bStarts - aStarts;
                    
                    const aContains = aText.includes(searchTerm) ? 1 : 0;
                    const bContains = bText.includes(searchTerm) ? 1 : 0;
                    if (aContains !== bContains) return bContains - aContains;
                    
                    return 0; 
                  });
                }
                
                return sortedResults;
              }
              return [];
            }}
            renderItemText={locatioPreviews}
            icon={MapPin}
            emptyMessage="No locations found"
            loadingMessage="Searching locations..."
            minQueryLength={0}
            showOnFocus={true}
            hideOnSelect={true}
            className="border-gray-200 rounded-xl"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}