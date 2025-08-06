import React, { useEffect } from 'react'
import { useProductStore } from '../stores/useProductStore';
import Card from '../components/Card';
import { useParams } from 'react-router-dom';

const CategoryPage = () => {
    const {fetchProductByCategory , categoryProducts, isLoading} = useProductStore();
    const { category } = useParams();
    useEffect(()=>{
        fetchProductByCategory(category);
    },[fetchProductByCategory, category])

    return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{category.toUpperCase()}</h1>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Filter:</label>
            <select className="px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none">
              <option>Availability</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Sort by:</label>
            <select className="px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none">
              <option>Alphabetically, A-Z</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {categoryProducts.length} product{categoryProducts.length !== 1 && "s"}
          </div>
        </div>
      </div>
      {isLoading ? (
        <div
          id="preloader"
          className="fixed inset-0 flex items-center justify-center bg-white z-50"
        >
          <div className="loader"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryProducts.length > 0 ? (
            categoryProducts.map((product) => (
            <div key={product._id || product.id}>
              <Card product={product} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            <h2 className="text-lg font-semibold">No products found</h2>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

export default CategoryPage
