import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import { Search } from "lucide-react";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  categoryProducts: [],
  detailedProduct: null,
  featuredProducts: [],
  searchResult: [],
  setProducts: (products) => set({ products }),
  createProduct: async (product) => {
    set({ loading: true });
    try {
      const response = await axios.post("/products", product);
      set((state) => ({
        products: [...state.products, response.data],
        loading: false,
      }));
      toast.success("Product created successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to create product");
    }
  },
  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products");
      set({ products: response.data.data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to fetch products");
    }
  },
  fetchProduct: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/${id}`);
      set({ detailedProduct: response.data.data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error("Error fetching product details:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch product details"
      );
    }
  },
  getSearchResult: async (searchterm) => {
    console.log("Searching products with term:", searchterm);
    set({ loading: true });
    try {
      const response = await axios.get(`/products/search?name=${searchterm}`);
      console.log("Search results:", response.data.data);
      set({ searchResult: response.data.data, loading: false });
    } catch (error) {
      console.error("Error searching products:", error);
      set({ searchResult: [], loading: false });
    }
  },
  clearSearchResult: () => set({ searchResult: [] }),
  getFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products/featured");
      set({ featuredProducts: response.data.data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data?.message || "Failed to fetch featured products"
      );
    }
  },

  fetchProductByCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/category/${category}`);
      set({ categoryProducts: response.data, loading: false });
    } catch (error) {
      set({ loading: false, categoryProducts: [] });
      console.error(
        `Failed to fetch products for category ${category}:`,
        error
      );
    }
  },
  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete(`/products/${productId}`);
      set((state) => ({
        products: state.products.filter((product) => product._id !== productId),
        loading: false,
      }));
      toast.success("Product deleted successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  },
  toggleFeatured: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${productId}`);
      const updatedIsFeatured = response.data.isFeatured;

      set((state) => {
        const updatedProducts = state.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: updatedIsFeatured }
            : product
        );

        const updatedFeaturedProducts = updatedIsFeatured
          ? [
              ...state.featuredProducts,
              updatedProducts.find((p) => p._id === productId),
            ]
          : state.featuredProducts.filter((p) => p._id !== productId);

        return {
          products: updatedProducts,
          featuredProducts: updatedFeaturedProducts,
          loading: false,
        };
      });

      toast.success("Product featured status updated");
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data?.message || "Failed to update featured status"
      );
    }
  },
}));
