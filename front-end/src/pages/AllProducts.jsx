import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import { useLocation } from "react-router-dom";
import {
  fetchAllProducts,
  getSearchResult,
} from "../store/slices/productSlice";

const AllProducts = () => {
  const dispatch = useDispatch();
  const { products, searchResult, loading } = useSelector(
    (state) => state.products,
  );
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search");
  const displayProducts = searchResult.length > 0 ? searchResult : products;

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);
  useEffect(() => {
    if (searchQuery) {
      dispatch(getSearchResult(searchQuery));
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        {searchResult.length > 0 ? "SEARCH RESULT" : "ALL PRODUCTS"}
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
        {displayProducts?.length > 0 ? (
          displayProducts.map((product) => (
            <div
              key={product._id}
              className="w-full min-w-0 bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition"
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
