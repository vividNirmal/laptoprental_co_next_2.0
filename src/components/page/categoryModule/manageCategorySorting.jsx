"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import {
  Plus,
  Upload,
  ArrowRight,
  Trash2,
  Import,
  FileDown,
  Loader2,
} from "lucide-react";

import {
  getRequest,
  postRequest,
  fileDownloadRequest,
} from "@/service/viewService";
import { toast } from "sonner";
import { ProductImportModal } from "@/components/common/importDialog";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { Button } from "@/components/ui/button"; // Assuming you use Shadcn's Button
import { Card } from "@/components/ui/card";
import ExportButton from "@/components/common/exportbutton";

const SortingCategory = () => {
  const [loader, setLoader] = useState(false);
  const [exportLoader, setExportLoader] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);

  const [sortingList, setSortingList] = useState([]);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, ids: [] });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchList = async () => {
    setLoader(true);

    const formData = new FormData();
    formData.append("type", "1");
    try {
      const res = await postRequest("sort-category-list", formData);
      setSortingList(res.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch categories."
      );
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(sortingList);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setSortingList(updated);
    updateSortingOrder(updated);
  };

  const updateSortingOrder = async (array) => {
    setLoader(true);
    const formData = new FormData();
    array.forEach((el) => formData.append("category_ids[]", el._id));
    formData.append("type", "2");
    try {
      const res = await postRequest("sort-category-list", formData);
      toast.success(res.message);

      fetchList();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update sorting order."
      );
    } finally {
      setLoader(false);
    }
  };

  const handleDeleteOpen = (id) => {
    setDeleteDialog({ open: true, ids: [id] });
  };

  const confirmDelete = async () => {
    setButtonLoader(true);
    const formData = new FormData();

    formData.append("category_id", deleteDialog.ids[0]);
    formData.append("type", "0");

    try {
      const res = await postRequest("category-action", formData);
      toast.success(res.message);
      fetchList();
      setDeleteDialog({ open: false, ids: [] });
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message || err.message || "Deletion failed."
      );
    } finally {
      setButtonLoader(false);
    }
  };

  const handleExport = async () => {
    setExportLoader(true);
    try {
      const res = await fileDownloadRequest("GET", "export-category-soring");
      const blob = new Blob([res], { type: "application/vnd.ms-excel" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Sorting Category.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Category sorting data exported successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message || err.message || "Export failed."
      );
    } finally {
      setExportLoader(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center md:justify-end mb-4 gap-2">
          <Link href="/dashboard/sorting-category/add-sorting">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add new
            </Button>
          </Link>
          <Button onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <ExportButton
            endpoint="export-category-soring"
            fileName="Categories.csv"
          />
      </div>
      <div className="h-96 grow overflow-auto">
        {loader ? (
          <div className="text-center py-10">
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-primaryBlue" />
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="list">
              {(provided) => (
                <ul
                  className="list-none p-0.5 pr-2 m-0 flex flex-col gap-4"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {(sortingList?.length ? sortingList : []).map((item, idx) => (
                    <Draggable
                      key={item._id}
                      draggableId={item._id}
                      index={idx}
                    >
                      {(prov) => (
                        <li
                          className="flex items-center justify-between bg-white rounded-xl py-2 px-3 2xl:p-3 border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)]"
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                        >
                          <div className="flex items-center gap-3 w-3/4 grow">
                            <ArrowRight className="text-primary w-4 h-4" />
                            <div className="text-base font-medium text-primary">
                              {item.name}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteOpen(item._id)}
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
        description="Are you sure you want to delete this category? This action cannot be undone."
        loading={buttonLoader}
      />

      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)} // Close modal
        title="Import Category Sorting"
        apiEndpoint="import-category-sorting"
        refetch={fetchList}
        // onSuccess={() => {
        //   //toast.success("Categories imported successfully!");
        //   fetchList();
        // }}
      />
    </>
  );
};

export default SortingCategory;
