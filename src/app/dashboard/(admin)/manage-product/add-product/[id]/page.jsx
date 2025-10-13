import AddProductForm from "@/components/page/productModule/addproduct";

export default function EditBlogPage({ params }) {        
  return <AddProductForm id={params.id}  />;
}