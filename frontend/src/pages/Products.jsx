import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { getProducts } from "../services/api";

function Products() {
  const [items, setItems] = useState([]);
  const [searchTxt, setSearchTxt] = useState("");
  const [cat, setCat] = useState("");
  const [isLoad, setIsLoad] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const getData = async () => {
      setIsLoad(true);
      setErr("");

      try {
        // only add the filters that are actually set
        const q = {};
        if (searchTxt) q.search = searchTxt;
        if (cat) q.category = cat;

        const res1 = await getProducts(q);
        console.log("loaded products", res1.data.products?.length);
        setItems(res1.data.products);
      } catch (e) {
        setErr("Something went wrong while loading products.");
        setItems([]);
      } finally {
        setIsLoad(false);
      }
    };

    getData();
  }, [searchTxt, cat]);

  return (
    <div>
      <Navbar />
      <div className="page catalog">
        <h1>Products</h1>
        <SearchBar
          search={searchTxt}
          category={cat}
          onSearchChange={setSearchTxt}
          onCategoryChange={setCat}
        />

        {isLoad && <p className="loading">Loading products...</p>}

        {!isLoad && err && <p className="error">{err}</p>}

        {!isLoad && !err && items.length === 0 && (
          <p className="empty">No products found.</p>
        )}

        {!isLoad && !err && items.length > 0 && (
          <div className="product-grid">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
