// "use client";

// import React, { useEffect, useState } from "react";

// import Link from "next/link";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// import {
//   Plus,
//   Upload,
//   ArrowRight,
//   Trash2,
//   Import,
//   FileDown,
//   Loader2,
// } from "lucide-react";

// import {
//   getRequest,
//   postRequest,
//   fileDownloadRequest,
// } from "@/service/viewService";
// import { toast } from "sonner";
// import { ProductImportModal } from "@/components/common/importDialog";
// import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
// import { Button } from "@/components/ui/button"; // Assuming you use Shadcn's Button
// import { Card } from "@/components/ui/card";
// import ExportButton from "@/components/common/exportbutton";

// const SortingJobCategory = () => {
//   const [loader, setLoader] = useState(false);
//   const [exportLoader, setExportLoader] = useState(false);
//   const [buttonLoader, setButtonLoader] = useState(false);

//   const [sortingList, setSortingList] = useState([]);

//   const [deleteDialog, setDeleteDialog] = useState({ open: false, ids: [] });

//   const [isImportModalOpen, setIsImportModalOpen] = useState(false);

//   const fetchList = async () => {
//     setLoader(true);

//     const formData = new FormData();
//     formData.append("type", "1");
//     try {
//       const res = await postRequest("sort-job-category-list", formData);
//       setSortingList(res.data);
//     } catch (err) {
//       toast.error(
//         err.response?.data?.message ||
//           err.message ||
//           "Failed to fetch categories."
//       );
//     } finally {
//       setLoader(false);
//     }
//   };

//   useEffect(() => {
//     fetchList();
//   }, []);

//   const onDragEnd = (result) => {
//     if (!result.destination) return;
//     const updated = Array.from(sortingList);
//     const [moved] = updated.splice(result.source.index, 1);
//     updated.splice(result.destination.index, 0, moved);
//     setSortingList(updated);
//     updateSortingOrder(updated);
//   };

//   const updateSortingOrder = async (array) => {
//     setLoader(true);
//     const formData = new FormData();
//     array.forEach((el) => formData.append("category_ids[]", el._id));
//     formData.append("type", "2");
//     try {
//       const res = await postRequest("sort-job-category-list", formData);
//       toast.success(res.message);

//       fetchList();
//     } catch (err) {
//       toast.error(
//         err.response?.data?.message ||
//           err.message ||
//           "Failed to update sorting order."
//       );
//     } finally {
//       setLoader(false);
//     }
//   };

//   const handleDeleteOpen = (id) => {
//     setDeleteDialog({ open: true, ids: [id] });
//   };

//   const confirmDelete = async () => {
//     setButtonLoader(true);
//     const formData = new FormData();

//     formData.append("category_id", deleteDialog.ids[0]);
//     formData.append("type", "0");

//     try {
//       const res = await postRequest("job-category-action", formData);
//       toast.success(res.message);
//       fetchList();
//       setDeleteDialog({ open: false, ids: [] });
//     } catch (err) {
//       toast.error(
//         err.response?.data?.error?.message || err.message || "Deletion failed."
//       );
//     } finally {
//       setButtonLoader(false);
//     }
//   };


//   return (
//     <>
//       <div className="p-6 bg-gray-50 min-h-screen">
//         <Card className="p-6 shadow-sm">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//             <div className="flex items-center gap-2 mb-4 md:mb-0">
//               <h1 className="text-2xl font-semibold">Sort Category</h1>
//               <span className="text-muted-foreground text-xs">
//                 Home &raquo; Sort Category
//               </span>
//             </div>
//           </div>

//           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
//             <div className="flex flex-wrap gap-2">
//               <Link href="/dashboard/job-sorting/add-job-sorting">
//                 <Button className="bg-purple-600 hover:bg-purple-700 text-white">
//                   <Plus className="mr-2 h-4 w-4" />
//                   Add new
//                 </Button>
//               </Link>
//             </div>
//           </div>
//           <div className="w-full h-100 grow overflow-auto pr-2">
//             {loader ? (
//               <div className="text-center py-10">
//                 <Loader2 className="w-10 h-10 mx-auto animate-spin text-primaryBlue" />
//               </div>
//             ) : (
//               <DragDropContext onDragEnd={onDragEnd}>
//                 <Droppable droppableId="list">
//                   {(provided) => (
//                     <ul
//                       className="list-none p-0.5 m-0 flex flex-col gap-4"
//                       ref={provided.innerRef}
//                       {...provided.droppableProps}
//                     >
//                       {(sortingList.length ? sortingList : []).map(
//                         (item, idx) => (
//                           <Draggable
//                             key={item._id}
//                             draggableId={item._id}
//                             index={idx}
//                           >
//                             {(prov) => (
//                               <li
//                                 className="flex items-center justify-between bg-white rounded-xl py-2 px-3 2xl:p-3 shadow"
//                                 ref={prov.innerRef}
//                                 {...prov.draggableProps}
//                                 {...prov.dragHandleProps}
//                               >
//                                 <div className="flex items-center gap-3 w-3/4 grow">
//                                   <ArrowRight className="text-[#7367f0] w-4 h-4" />
//                                   <div className="text-base font-medium text-[#7367f0]">
//                                     {item.name}
//                                   </div>
//                                 </div>
//                                 <Button
//                                   size="sm"
//                                   variant="destructive"
//                                   onClick={() => handleDeleteOpen(item._id)}
//                                 >
//                                   <Trash2 className="w-4 h-4" />
//                                   <span className="sr-only">Delete</span>
//                                 </Button>
//                               </li>
//                             )}
//                           </Draggable>
//                         )
//                       )}
//                       {provided.placeholder}
//                     </ul>
//                   )}
//                 </Droppable>
//               </DragDropContext>
//             )}
//           </div>
//         </Card>
//       </div>

//       <DeleteConfirmationDialog
//         isOpen={deleteDialog.open}
//         onClose={() => setDeleteDialog({ open: false, ids: [] })}
//         onConfirm={confirmDelete}
//         title="Delete Category"
//         description="Are you sure you want to delete this job category? This action cannot be undone."
//         loading={buttonLoader}
//       />
//     </>
//   );
// };

// export default SortingJobCategory;


"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Plus, ArrowRight, Trash2, Loader2 } from "lucide-react"
import { postRequest } from "@/service/viewService"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog"
import { Button } from "@/components/ui/button" // Assuming you use Shadcn's Button
import { Card } from "@/components/ui/card"

const SortingJobCategory = () => {
  const [loader, setLoader] = useState(false)
  const [exportLoader, setExportLoader] = useState(false)
  const [buttonLoader, setButtonLoader] = useState(false)
  const [sortingList, setSortingList] = useState([])
  const [deleteDialog, setDeleteDialog] = useState({ open: false, ids: [] })
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const fetchList = async () => {
    setLoader(true)
    const formData = new FormData()
    formData.append("type", "1")
    try {
      const res = await postRequest("sort-job-category-list", formData)
      setSortingList(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to fetch categories.")
    } finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const onDragEnd = (result) => {
    if (!result.destination) return

    // If sortingList is empty, we are dragging dummy items.
    // Perform local reorder for visual feedback, but do not call API.
    if (sortingList.length === 0) {
      // For dummy items, we don't need to update a state, as they are just visual.
      // The drag-and-drop library will handle the visual reordering temporarily.
      return
    }

    // If real data exists, proceed with actual sorting and API call
    const updated = Array.from(sortingList)
    const [moved] = updated.splice(result.source.index, 1)
    updated.splice(result.destination.index, 0, moved)
    setSortingList(updated)
    updateSortingOrder(updated)
  }

  const updateSortingOrder = async (array) => {
    setLoader(true)
    const formData = new FormData()
    array.forEach((el) => formData.append("category_ids[]", el._id))
    formData.append("type", "2")
    try {
      const res = await postRequest("sort-job-category-list", formData)
      toast.success(res.message)
      fetchList()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update sorting order.")
    } finally {
      setLoader(false)
    }
  }

  const handleDeleteOpen = (id) => {
    setDeleteDialog({ open: true, ids: [id] })
  }

  const confirmDelete = async () => {
    setButtonLoader(true)
    const formData = new FormData()
    formData.append("category_id", deleteDialog.ids[0])
    formData.append("type", "0")
    try {
      const res = await postRequest("job-category-action", formData)
      toast.success(res.message)
      fetchList()
      setDeleteDialog({ open: false, ids: [] })
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.message || "Deletion failed.")
    } finally {
      setButtonLoader(false)
    }
  }

  // Determine which list to render: real data or dummy placeholders
  const itemsToRender =
    sortingList.length === 0
      ? [
          { _id: "dummy-1", name: "." },
          { _id: "dummy-2", name: "." },
        ]
      : sortingList

  return (
    <>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/job-sorting/add-job-sorting">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add new
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full h-100 grow overflow-auto pr-2">
            {loader ? (
              <div className="text-center py-10">
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-primaryBlue" />
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="list">
                  {(provided) => (
                    <ul
                      className="list-none p-0.5 m-0 flex flex-col gap-4"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {itemsToRender.map((item, idx) => (
                        <Draggable key={item._id} draggableId={item._id} index={idx}>
                          {(prov) => (
                            <li
                              className="flex items-center justify-between bg-white rounded-xl py-2 px-3 2xl:p-3 shadow"
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                            >
                              <div className="flex items-center gap-3 w-3/4 grow">
                                <ArrowRight className="text-primary w-4 h-4" />
                                <div className="text-base font-medium text-primary">{item.name}</div>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteOpen(item._id)}
                                disabled={item._id.startsWith("dummy-")} // Disable delete for dummy items
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
      <DeleteConfirmationDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, ids: [] })}
        onConfirm={confirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this job category? This action cannot be undone."
        loading={buttonLoader}
      />
    </>
  )
}

export default SortingJobCategory
