import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../contexts/ProductsContext";
import Layout from "./Layout";
import SearchFilterSidebar from "./SearchFilterSidebar"; // Import the reusable sidebar
import "./Home.css";

const Favorites = () => {
  const { collections, setCollections, updateBreadcrumbs } = useProducts();
  const navigate = useNavigate();
  const [showCreateCollectionModal, setShowCreateCollectionModal] =
    useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [priceFilter, setPriceFilter] = useState({
    minPrice: null,
    maxPrice: null,
  });

  const allItemsCollection =
    collections.find((c) => c.name === "All Items")?.items || [];

  // Set breadcrumbs for the Favorites page
  useEffect(() => {
    updateBreadcrumbs([{ name: "Home", path: "/" }, { name: "Favorites", path: "/favorites" }]);
  }, [updateBreadcrumbs]);

  // Filter items based on search query and price filter
  const filteredItems = allItemsCollection.filter((item) => {
    const matchesQuery = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPrice =
      !priceFilter.minPrice && !priceFilter.maxPrice
        ? true
        : item.sites.some(
            (site) =>
              (!priceFilter.minPrice || site.price >= priceFilter.minPrice) &&
              (!priceFilter.maxPrice || site.price <= priceFilter.maxPrice)
          );
    return matchesQuery && matchesPrice;
  });

  const handleCreateCollection = () => {
    if (newCollectionName.trim() !== "") {
      const newCollection = { name: newCollectionName, items: [] };
      setCollections([...collections, newCollection]);
      setNewCollectionName("");
      setShowCreateCollectionModal(false);
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setShowSearchResults(query.trim() !== "");
  };

  const handleExitSearch = () => {
    setSearchQuery(""); // Clear the search query state
    setShowSearchResults(false); // Hide the search results
    setPriceFilter({ minPrice: null, maxPrice: null }); // Clear price filter
  };

  return (
    <Layout
      showSearch={true}
      searchPlaceholder="Search Your Favorites. . ."
      searchValue={searchQuery} // Pass searchQuery to control the input value
      onSearchChange={handleSearchChange}
    >
      <div className="container">
        {/* Page Title with Exit Search Button */}
        <div className="second-header">
          <h2>Favorites</h2>
        </div>

        {/* Sidebar and Search Results */}
        {showSearchResults && (
          <div className="favorites-with-sidebar">
            <SearchFilterSidebar setPriceFilter={setPriceFilter} />
            <div className="search-results-container">
              {filteredItems.length === 0 ? (
                <div className="no-matches">
                  <p>No matches found. Expand your search</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="product-card"
                      onClick={() => navigate(`/product/${item.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <h2>{item.name}</h2>
                      <div className="image-container">
                        <img
                          src={process.env.PUBLIC_URL + item.image}
                          alt={item.name}
                          className="product-image"
                        />
                      </div>
                      <p>{item.description || "No description available"}</p>
                      <p className="price">
                        $
                        {item.sites && item.sites.length > 0
                          ? item.sites[0].price
                          : "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collections when not in Search Mode */}
        {!showSearchResults && (
          <div className="collections-container">
            {/* All Items Collection Card */}
            <div
              className="collection-card"
              onClick={() => navigate("/collections/All Items")}
            >
              <div className="image-container">
                {/* Main image */}
                <div className="main-image">
                  {allItemsCollection[0] ? (
                    <img
                      src={process.env.PUBLIC_URL + allItemsCollection[0].image}
                      alt={allItemsCollection[0].name}
                    />
                  ) : (
                    <div className="placeholder"></div>
                  )}
                </div>

                {/* Stacked images */}
                <div className="stacked-images">
                  {allItemsCollection[1] ? (
                    <img
                      src={process.env.PUBLIC_URL + allItemsCollection[1].image}
                      alt={allItemsCollection[1].name}
                    />
                  ) : (
                    <div className="placeholder"></div>
                  )}
                  {allItemsCollection[2] ? (
                    <img
                      src={process.env.PUBLIC_URL + allItemsCollection[2].image}
                      alt={allItemsCollection[2].name}
                    />
                  ) : (
                    <div className="placeholder"></div>
                  )}
                </div>
              </div>
              <h3>All Items</h3>
              <p>{allItemsCollection.length} items</p>
            </div>

            {/* Create Collection Card */}
            <div
              className="collection-card"
              onClick={() => setShowCreateCollectionModal(true)}
              style={{ cursor: "pointer" }}
            >
              <h3>Create Collection</h3>
            </div>

            {/* Other Collections */}
            {collections
              .filter((collection) => collection.name !== "All Items")
              .map((collection, index) => (
                <div
                  key={index}
                  className="collection-card"
                  onClick={() => navigate(`/collections/${collection.name}`)}
                >
                  <div className="image-container">
                    {/* Main image */}
                    <div className="main-image">
                      {collection.items[0] ? (
                        <img
                          src={
                            process.env.PUBLIC_URL + collection.items[0].image
                          }
                          alt={collection.items[0].name}
                        />
                      ) : (
                        <div className="placeholder"></div> /* Placeholder content */
                      )}
                    </div>

                    {/* Stacked images */}
                    <div className="stacked-images">
                      {collection.items[1] ? (
                        <img
                          src={
                            process.env.PUBLIC_URL + collection.items[1].image
                          }
                          alt={collection.items[1].name}
                        />
                      ) : (
                        <div className="placeholder"></div>
                      )}
                      {collection.items[2] ? (
                        <img
                          src={
                            process.env.PUBLIC_URL + collection.items[2].image
                          }
                          alt={collection.items[2].name}
                        />
                      ) : (
                        <div className="placeholder"></div>
                      )}
                    </div>
                  </div>
                  <h3>{collection.name}</h3>
                  <p>{collection.items.length} items</p>
                </div>
              ))}
          </div>
        )}

        {/* Create Collection Modal */}
        {showCreateCollectionModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h4>Enter Collection Name</h4>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection Name"
              />
              <button onClick={handleCreateCollection}>Create</button>
              <button onClick={() => setShowCreateCollectionModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
