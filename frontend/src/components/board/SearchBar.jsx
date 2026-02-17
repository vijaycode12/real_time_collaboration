import React, { useState } from "react";
import api from "../../api/client";

const SearchBar = ({ boardId, onResults }) => {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      onResults?.([]);
      return;
    }

    setSearching(true);
    try {
      const res = await api.get("http:localhost:4000/api/v1/search", {
        params: { q: query, boardId, type: "all" }
      });
      onResults?.(res.data?.data || []);
    } catch (err) {
      console.error("Search failed:", err);
      onResults?.([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <form className="position-relative mb-4" onSubmit={handleSearch}>
      <div className="input-group input-group-lg">
        <span className="input-group-text bg-white border-end-0">
          <i className="bi bi-search text-muted"></i>
        </span>
        <input
          className="form-control form-control-lg border-start-0 ps-0 shadow-none"
          type="search"
          placeholder="Search tasks, lists, members..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          className="btn btn-outline-secondary" 
          type="submit"
          disabled={searching || !query.trim()}
        >
          {searching ? (
            <span className="spinner-border spinner-border-sm" role="status"></span>
          ) : (
            <i className="bi bi-arrow-right-short"></i>
          )}
        </button>
      </div>
      {query && (
        <small className="form-text text-muted position-absolute bottom-100 start-0 translate-middle-x">
          Searching in this board...
        </small>
      )}
    </form>
  );
};

export default SearchBar;
