import React, { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import Card from "../components/Card";
import { useLocation } from "react-router-dom";

const AllProducts = () => {
  const { products, fetchAllProducts, getSearchResult, searchResult, loading } =
    useProductStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search");
  const displayProducts = searchResult.length > 0 ? searchResult : products;

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);
  useEffect(() => {
    if (searchQuery) {
      getSearchResult(searchQuery);
    }
  }, [getSearchResult, searchQuery]);
  if (loading) {
    return (
      <div
        id="preloader"
        className="fixed inset-0 flex items-center justify-center bg-white z-50"
      >
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {searchResult.length > 0 ? "SEARCH RESULT" : "ALL PRODUCTS"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {displayProducts?.length > 0 ? (
          displayProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition"
            >
              <Card product={product} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 text-lg font-semibold py-12">
            🛒 No products found. Try a different search or category.
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProducts;
