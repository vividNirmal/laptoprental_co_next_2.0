"use client"

import { useEffect, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getRequest, postRequest } from "@/service/viewService"
import { CustomCombobox } from "@/components/common/customcombox"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

import { useFormik } from "formik"
import * as Yup from "yup"

const validationSchema = Yup.object({
  city_id: Yup.string().nullable().required("City is required"),
})

// Sortable Item Component
function SortableItem({ id, item }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-2 mb-2 border border-gray-200 rounded shadow-sm text-xs 2xl:text-base text-gray-800 flex items-center gap-2"
      data-sortable-id={id}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical size={16} className="text-gray-400" />
      </button>      
      <span>{item.name}</span>
    </div>
  )
}

export default function AddChatbot({ id }) {
  const router = useRouter()
  const [pageloader, setPageloader] = useState(true)
  const [searchAvailable, setSearchAvailable] = useState("")
  const [searchSelected, setSearchSelected] = useState("")
  const [availableListings, setAvailableListings] = useState([])
  const [selectedListings, setSelectedListings] = useState([])

  const [cityList, setCityList] = useState([])    
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const formik = useFormik({
    initialValues: {
      city_id: null,
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
        const formData = new FormData()

        const isAllCitySelected = values.city_id === "Select All"
        if (isAllCitySelected) {
          formData.append("is_city_select_all", "true")
        } else {
          formData.append("is_city_select_all", "false")
          formData.append("city_id", values.city_id)
        }

        if (id) {
          formData.append("chat_boat_id", id)
        }

        const listingsWithOrder = selectedListings.map((element, index) => ({
          id: element.listing_unique_id || element._id,
          order: index,
        }))
        formData.append("listing_id", JSON.stringify(listingsWithOrder))

        const response = await postRequest("add-chatboat-listing", formData)
        toast.success(response.message || "Chatbots added successfully")
        router.push("/dashboard/chatbot-listing")
      } catch (err) {
        toast.error(err?.message || "Failed to add chatbots")
      }
    },
  })

  useEffect(() => {
    getRequest("get-form-city-list")
      .then((res) => {
        const cities = [{ unique_id: "Select All", name: "Select All" }, ...res.data]
        setCityList(cities)
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to load cities")
      })
  }, [])

  useEffect(() => {
    if (id && cityList.length > 0) {
      getRequest(`get-chat-boat-listing-details/${id}`)
        .then((res) => {
          const data = res.data.chatboat_listing
          
          // Sort listings by order field
          const sortedListings = Array.isArray(data.listing_id) 
            ? [...data.listing_id].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
            : []

          const selectedCityFromApi = cityList.find(
            (city) =>
              city.unique_id === data.city_id?.unique_id ||
              (data.is_city_select_all && city.unique_id === "Select All")
          )

          if (selectedCityFromApi) {
            formik.setFieldValue("city_id", selectedCityFromApi?.unique_id)
            fetchListingsForCity(selectedCityFromApi.unique_id, sortedListings)
          } else {
            // If city not found in list, just set the selected listings
            setSelectedListings(sortedListings)
            setPageloader(false)
          }
        })
        .catch((err) => {
          toast.error(err?.message || "Failed to load chatbot details")
          setPageloader(false)
        })
    } else if (!id) {
      setPageloader(false)
      setAvailableListings([])
      setSelectedListings([])
    }
  }, [id, cityList])

  const fetchListingsForCity = useCallback(
    (cityId, initialSelected = []) => {
      getRequest(`get-listing-city-wise?city_id=${cityId}`)
        .then((res) => {
          const fetchedListings = res.data
          
          // Create a set of IDs from initial selected (check both _id and listing_unique_id)
          const initialSelectedIds = new Set(
            initialSelected.map((item) => item._id || item.listing_unique_id)
          )

          const newAvailable = fetchedListings.filter(
            (item) => !initialSelectedIds.has(item._id) && !initialSelectedIds.has(item.listing_unique_id)
          )
          
          // If we have initial selected items with full data, use them
          // Otherwise, filter from fetched listings
          let newSelected = []
          if (initialSelected.length > 0 && initialSelected[0].name) {
            // Initial selected already has full data (from edit mode)
            newSelected = initialSelected
          } else {
            // Need to get full data from fetched listings
            newSelected = fetchedListings.filter((item) =>
              initialSelectedIds.has(item._id) || initialSelectedIds.has(item.listing_unique_id)
            )
          }

          setAvailableListings(newAvailable)
          setSelectedListings(newSelected)
        })
        .catch((err) => {
          toast.error(err?.message || "Failed to load listings")
        })
        .finally(() => {
          setPageloader(false)
        })
    },
    []
  )

  const handleCityChange = useCallback(
    (city) => {
      formik.setFieldValue("city_id", city)
      setSelectedListings([])
      if (city) {
        fetchListingsForCity(city)
      } else {
        setAvailableListings([])
      }
    },
    [formik, fetchListingsForCity]
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    // Only handle reordering within selected listings
    if (active.id.startsWith("selected-") && over.id.startsWith("selected-")) {
      setSelectedListings((items) => {
        const oldIndex = items.findIndex(
          (item) => `selected-${item._id}` === active.id
        )
        const newIndex = items.findIndex(
          (item) => `selected-${item._id}` === over.id
        )

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleDragOverAvailable = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDropAvailable = (e) => {
    e.preventDefault()
    const id = e.dataTransfer.getData("text/plain")

    if (id.startsWith("selected-")) {
      const itemId = id.replace("selected-", "")
      const activeItem = selectedListings.find((item) => item._id === itemId)

      if (activeItem) {
        setAvailableListings((items) => [...items, activeItem])
        setSelectedListings((items) =>
          items.filter((item) => item._id !== activeItem._id)
        )
      }
    }
  }

  const handleDragOverSelected = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDropSelected = (e) => {
    e.preventDefault()
    const id = e.dataTransfer.getData("text/plain")

    if (id.startsWith("available-")) {
      const itemId = id.replace("available-", "")
      const activeItem = availableListings.find((item) => item._id === itemId)

      if (activeItem && !selectedListings.find((item) => item._id === activeItem._id)) {
        setSelectedListings((items) => [...items, activeItem])
        setAvailableListings((items) =>
          items.filter((item) => item._id !== activeItem._id)
        )
      }
    }
  }

  const filteredAvailable = availableListings.filter((item) =>
    item.name?.toLowerCase().includes(searchAvailable.toLowerCase())
  )

  const filteredSelected = selectedListings.filter((item) =>
    item.name?.toLowerCase().includes(searchSelected.toLowerCase())
  )

  if (pageloader) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <div className="w-full mb-5">
          <label
            htmlFor="city_select"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
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
            <div className="text-xs text-red-500 mt-1">
              {formik.errors.city_id}
            </div>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-base 2xl:text-xl font-normal mb-4 text-gray-800">
                Available Listings
              </h2>
              <Input
                placeholder="Search available listings..."
                value={searchAvailable}
                onChange={(e) => setSearchAvailable(e.target.value)}
                className="mb-2 w-full p-2 border rounded"
              />
              <div
                className="border border-solid border-gray-300 bg-white p-2 h-96 overflow-y-auto rounded-md"
                onDragOver={handleDragOverAvailable}
                onDrop={handleDropAvailable}
              >
                {filteredAvailable.length === 0 ? (
                  <div className="text-gray-500 text-xs p-2">
                    No available listings found.
                  </div>
                ) : (
                  filteredAvailable.map((item) => (
                    <div
                      key={item._id}
                      data-sortable-id={`available-${item._id}`}
                      className="bg-white p-2 mb-2 border border-gray-200 rounded shadow-sm cursor-grab active:cursor-grabbing text-xs 2xl:text-base text-gray-800"
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move"
                        e.dataTransfer.setData("text/plain", `available-${item._id}`)
                      }}
                    >
                      {item.name}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="text-base 2xl:text-xl font-normal mb-4 text-gray-800">
                Selected Listings{" "}
                <span className="text-xs text-gray-500">
                  (Drag to reorder)
                </span>
              </h2>
              <Input
                placeholder="Search selected listings..."
                value={searchSelected}
                onChange={(e) => setSearchSelected(e.target.value)}
                className="mb-2 w-full p-2 border rounded"
              />
              <div
                className="border border-solid border-gray-300 bg-white p-2 h-96 overflow-y-auto rounded-md"
                onDragOver={handleDragOverSelected}
                onDrop={handleDropSelected}
              >
                {filteredSelected.length === 0 ? (
                  <div className="text-gray-500 text-xs p-2">
                    No selected listings. Drag items here.
                  </div>
                ) : (
                  <SortableContext
                    items={filteredSelected.map((item) => `selected-${item._id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredSelected.map((item) => (
                      <SortableItem
                        key={item._id}
                        id={`selected-${item._id}`}
                        item={item}
                      />
                    ))}
                  </SortableContext>
                )}
              </div>
            </div>
          </div>
        </DndContext>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={
              !formik.values.city_id ||
              selectedListings.length === 0 ||
              formik.isSubmitting
            }
            className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit flex items-center gap-2.5 text-xs 2xl:text-base font-base border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] whitespace-nowrap transition-all duration-200 ease-linear mt-3"
          >
            {formik.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  )
}