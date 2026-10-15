const cats = ["Electronics", "Fashion", "Books", "Home"];

function SearchBar({ search, category, onSearchChange, onCategoryChange }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        {cats.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SearchBar;
