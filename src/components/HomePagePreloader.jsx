"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { handleCategory, handlePageloader } from "@/redux/settingReducer/settinReducer";
import { userPostRequest } from "@/service/viewService";

export default function HomePagePreloader() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Immediately call home-page API on mount, don't wait for other data
    const loadHomePage = async () => {
      try {
        const formData = new FormData();
        const sessionLocationData = sessionStorage.getItem("location_data");
        const locationData = sessionLocationData ? JSON.parse(sessionLocationData) : null;
        
        formData.append("current_location_id", locationData?.current_location_id || "");
        
        const resHome = await userPostRequest("home-page", formData);
        
        if (resHome?.data?.home_page_category) {
          dispatch(handleCategory(resHome.data.home_page_category));
        }
        
        // Store location data if not exists
        if (!sessionLocationData && resHome?.data?.current_location) {
          if (Object.keys(resHome.data.current_location).length > 0) {
            sessionStorage.setItem("location_data", JSON.stringify(resHome.data.current_location));
          }
        }
      } catch (error) {
        console.error("Error preloading homepage:", error);
      } finally {
        // Always turn off loader after API call
        dispatch(handlePageloader(false));
      }
    };

    loadHomePage();
  }, [dispatch]);

  return null; // This component doesn't render anything
}