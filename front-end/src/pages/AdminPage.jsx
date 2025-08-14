import React, { useEffect, useState } from "react";
import ManageProducts from "../components/ManageProducts";
import AddProduct from "../components/AddProduct";
import { useProductStore } from "../stores/useProductStore";

const AdminPage = () => {
  const { fetchAllProducts } = useProductStore();
  const [activeTab, setActiveTab] = useState("addProduct");
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow text-center w-full max-w-2xl">
        <h1 className="text-2xl font-semibold mb-6">Admin Panel</h1>
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setActiveTab("addProduct")}
            className={`px-5 py-2 rounded-full transition font-medium ${
              activeTab === "addProduct"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Add Product
          </button>
          <button
            onClick={() => setActiveTab("manageProducts")}
            className={`px-5 py-2 rounded-full transition font-medium ${
              activeTab === "manageProducts"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Manage Products
          </button>
        </div>
      </div>

      <div className="mt-10 w-full max-w-4xl">
        {activeTab === "manageProducts" ? <ManageProducts /> : <AddProduct />}
      </div>
    </div>
  );
};

export default AdminPage;
