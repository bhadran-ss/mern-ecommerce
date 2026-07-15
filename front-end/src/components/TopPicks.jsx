import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Card from "./Card";

const TopPicks = () => {
  const navigate = useNavigate();
  const featuredProducts = useSelector(
    (state) => state.products.featuredProducts,
  );
  return (
    <div className="px-6 md:px-20 py-16 bg-white text-center">
      <h1 className="text-3xl md:text-4xl font-semibold mb-10">TOP PICKS</h1>
      <div className="grid gap-3 sm:gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {featuredProducts?.map((product) => (
          <div key={product._id} className="w-full min-w-0">
            <Card product={product} />
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/products")}
        className="mt-10 px-6 py-2 border border-black rounded-full hover:bg-black hover:text-white transition"
      >
        View All
      </button>
    </div>
  );
};

export default TopPicks;
