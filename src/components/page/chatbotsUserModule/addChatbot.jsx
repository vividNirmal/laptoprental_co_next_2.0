"use client"

import { useEffect, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getRequest, postRequest } from "@/service/viewService"
import { CustomCombobox } from "@/components/common/customcombox"

import { useFormik } from "formik"
import * as Yup from "yup"

// Validation schema for the form
const validationSchema = Yup.object({
  city_id: Yup.string().nullable().required("City is required"),
})

export default function AddChatbot({ id }) {
  const router = useRouter()
  const [pageloader, setPageloader] = useState(true)
  const [searchAvailable, setSearchAvailable] = useState("")
  const [searchSelected, setSearchSelected] = useState("")
  const [availableListings, setAvailableListings] = useState([])
  const [selectedListings, setSelectedListings] = useState([])
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragSource, setDragSource] = useState(null)
  const [dragOverTarget, setDragOverTarget] = useState(null)

  // State for City selection (now managed by Formik)
  const [cityList, setCityList] = useState([])
   // Use the prop for ID to simulate edit mode

  const formik = useFormik({
    initialValues: {
      city_id: null ,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (!values.city_id) {
        toast.error("Please select a city.")
        return
      }
      if (selectedListings.length === 0) {
        toast.error("Please select at least one chatbot.")
        return
      }

      
      try {
        const formData = new FormData() // Use FormData as in Angular code

        const isAllCitySelected = values.city_id === "Select All"
        if (isAllCitySelected) {
          formData.append("is_city_select_all", "true")
        } else {
          formData.append("is_city_select_all", "false")
          formData.append("city_id", values.city_id)
        }

        selectedListings.forEach((element) => {
          // Use listing_unique_id if available, otherwise fallback to id
          formData.append("listing_id[]", element.listing_unique_id || element._id)
        })

        if (id) {
          formData.append("chat_boat_id", id)
        }

        // The Angular code uses the same endpoint for add and edit
        const response = await postRequest("add-chatboat-listing", formData)
        toast.success(response.message || "Chatbots added successfully")
        router.push("/dashboard/chatbot-listing") // Simulate navigation
      } catch (err) {
        toast.error(err?.message || "Failed to add chatbots")
      } finally {

      }
    },
  })

  // Fetch initial city list on component mount
  useEffect(() => {
    
    getRequest("get-form-city-list")
      .then((res) => {
        const cities = [{ unique_id: "Select All", name: "Select All" }, ...res.data]
        setCityList(cities)
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to load cities")
      })
      .finally(() => {

      })
  }, [])

  // Handle initial data load for edit mode
  useEffect(() => {
    if (id && cityList.length > 0) {
      
      getRequest(`get-chat-boat-listing-details/${id}`)
        .then((res) => {
          const data = res.data.chatboat_listing
          const selectedCityFromApi = cityList.find(
            (city) => city.unique_id === data.city_id?.unique_id || (data.is_city_select_all && city.unique_id === "Select All"),
          )

          if (selectedCityFromApi) {
            formik.setFieldValue("city_id", selectedCityFromApi?.unique_id)
            // Fetch listings for the pre-selected city, passing initial selected listings
            fetchListingsForCity(selectedCityFromApi.unique_id, data.listing_id || [])
          } else {
            // If city not found or "Select All" not in list yet, just set selected listings
            setSelectedListings(data.listing_id || [])
    
          }
        })
        .catch((err) => {
          toast.error(err?.message || "Failed to load chatbot details")
  
        })
    } else if (!id) {
      // For new entry, ensure loader is off and lists are empty
      setPageloader(false)
      setAvailableListings([])
      setSelectedListings([])
    }
  }, [id, cityList]) // Depend on cityList to ensure it's loaded before setting city_id

  // Function to fetch listings based on selected city
  const fetchListingsForCity = useCallback(
    (cityId, initialSelected = []) => {
      
      getRequest(`get-listing-city-wise?city_id=${cityId}`)
        .then((res) => {
          const fetchedListings = res.data
          const initialSelectedIds = new Set(initialSelected.map((item) => item._id))

          // Separate initial selected from available
          const newAvailable = fetchedListings.filter((item) => !initialSelectedIds.has(item._id))
          const newSelected = fetchedListings.filter((item) => initialSelectedIds.has(item._id))

          setAvailableListings(newAvailable)
          setSelectedListings(newSelected.length > 0 ? newSelected : initialSelected) // Prioritize fetched selected, fallback to initial
        })
        .catch((err) => {
          toast.error(err?.message || "Failed to load listings")
        })
        .finally(() => {
  
        })
    },
    [selectedListings],
  ) // Depend on selectedListings to correctly filter

  // Handle city selection change (now updates Formik state)
  const handleCityChange = useCallback(
    (city) => {
      formik.setFieldValue("city_id", city) // Update Formik state
      setSelectedListings([]) // Clear selected listings when city changes
      if (city) {
        fetchListingsForCity(city)
      } else {
        setAvailableListings([]) // Clear available if no city selected
      }
    },
    [formik, fetchListingsForCity],
  )

  const handleDragStart = (item, source) => {
    setDraggedItem(item)
    setDragSource(source)
  }

  const handleDragOver = (e, target) => {
    e.preventDefault()
    setDragOverTarget(target)
  }

  const handleDrop = (e, target) => {
    e.preventDefault()
    if (!draggedItem || dragSource === target) return

    // Prevent adding duplicate items to the target list
    const isInTarget =
      target === "selected"
        ? selectedListings.some((item) => item._id === draggedItem._id)
        : availableListings.some((item) => item._id === draggedItem._id)

    if (isInTarget) {
      setDraggedItem(null)
      setDragSource(null)
      setDragOverTarget(null)
      return
    }

    if (dragSource === "available" && target === "selected") {
      setSelectedListings((prev) => [...prev, draggedItem])
      setAvailableListings((prev) => prev.filter((i) => i._id !== draggedItem._id))
    } else if (dragSource === "selected" && target === "available") {
      setAvailableListings((prev) => [...prev, draggedItem])
      setSelectedListings((prev) => prev.filter((i) => i._id !== draggedItem._id))
    }

    setDraggedItem(null)
    setDragSource(null)
    setDragOverTarget(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragSource(null)
    setDragOverTarget(null)
  }

  const filteredAvailable = availableListings.filter((item) =>
    item.name.toLowerCase().includes(searchAvailable.toLowerCase()),
  )

  const filteredSelected = selectedListings.filter((item) =>
    item.name.toLowerCase().includes(searchSelected.toLowerCase()),
  )

  return (
    <div>
        <form onSubmit={formik.handleSubmit}>
          <div className="w-full mb-5">
            <label htmlFor="city_select" className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
              City
            </label>
            <CustomCombobox
              name="city_id"
              value={formik.values.city_id}
              onChange={handleCityChange}
              onBlur={() => formik.setFieldTouched("city_id", true)}
              options={cityList}
              valueKey="unique_id"
              labelKey="name"
              placeholder="Select City"
              id="city_select"
            />
            {formik.touched.city_id && formik.errors.city_id && (
              <div className="text-xs text-red-500 mt-1">{formik.errors.city_id}</div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-base 2xl:text-xl font-normal mb-4 text-gray-800">Available Listings</h2>
              <Input
                placeholder="Search available listings..."
                value={searchAvailable}
                onChange={(e) => setSearchAvailable(e.target.value)}
                className="mb-2 w-full p-2 border rounded"
              />
              <div
                onDrop={(e) => handleDrop(e, "available")}
                onDragOver={(e) => handleDragOver(e, "available")}
                onDragLeave={() => setDragOverTarget(null)}
                className={`border border-solid border-gray-300 bg-white p-2 h-96 overflow-y-auto rounded-md ${
                  dragOverTarget === "available" ? "" : ""
                }`}
              >
                {filteredAvailable.length === 0 ? (
                  <div className="text-gray-500 text-xs p-2">No available listings found.</div>
                ) : (
                  filteredAvailable.map((item) => (
                    <div
                      key={item._id}
                      draggable
                      onDragStart={() => handleDragStart(item, "available")}
                      onDragEnd={handleDragEnd}
                      className="bg-white p-2 mb-1 border border-gray-200 rounded shadow-sm cursor-grab text-xs 2xl:text-base text-gray-800"
                    >
                      {item.name}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h2 className="text-base 2xl:text-xl font-normal mb-4 text-gray-800">Selected Listings</h2>
              <Input
                placeholder="Search selected listings..."
                value={searchSelected}
                onChange={(e) => setSearchSelected(e.target.value)}
                className="mb-2 w-full p-2 border rounded"
              />
              <div
                onDrop={(e) => handleDrop(e, "selected")}
                onDragOver={(e) => handleDragOver(e, "selected")}
                onDragLeave={() => setDragOverTarget(null)}
                className={`border border-solid border-gray-300 bg-white p-2 h-96 overflow-y-auto rounded-md ${
                  dragOverTarget === "selected" ? "" : ""
                }`}
              >
                {filteredSelected.length === 0 ? (
                  <div className="text-gray-500 text-xs p-2">No selected listings. Drag items here.</div>
                ) : (
                  filteredSelected.map((item) => (
                    <div
                      key={item._id}
                      draggable
                      onDragStart={() => handleDragStart(item, "selected")}
                      onDragEnd={handleDragEnd}
                      className="bg-white p-2 mb-1 border border-gray-200 rounded shadow-sm cursor-grab text-xs 2xl:text-base text-gray-800"
                    >
                      {item.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="pt-4">
            <Button
              type="submit"
              disabled={!formik.values.city_id || selectedListings.length === 0 || formik.isSubmitting}
              className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit flex items-center gap-2.5 text-xs 2xl:text-base font-base border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] whitespace-nowrap transition-all duration-200 ease-linear mt-3"
            >
              {formik.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
    </div>
  )
}
