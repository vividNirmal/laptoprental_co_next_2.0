import ViewproductDetails from "@/components/page/productModule/viewproductDetails";

async function viewProduct({ params }) {
  return <ViewproductDetails id={params.id} />;
}

export default viewProduct;
