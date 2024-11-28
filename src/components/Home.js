import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import "./Home.css";
import { useProducts } from "../contexts/ProductsContext";
import CollectionModal from "./CollectionModal";
import SearchFilterSidebar from "./SearchFilterSidebar";

function Home() {
  const {
    products,
    setProducts,
    favorites,
    setFavorites,
    addToCollection,
    setCollections,
    selectedCollections,
    collections,
    createCollection,
    getLowestPriceForCurrentMonth,
    updateBreadcrumbs, // Function to update breadcrumbs
  } = useProducts();

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState({
    minPrice: null,
    maxPrice: null,
  });

  const [showTooltip, setShowTooltip] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showHeartTooltip, setShowHeartTooltip] = useState(null);
  const [showUndoButton, setShowUndoButton] = useState(false);
  const [removedProduct, setRemovedProduct] = useState(null);
  const [removedCollections, setRemovedCollections] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/store.json`);
        const productsData = await response.json();
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    if (products.length === 0) {
      fetchProducts();
    }

    // Initialize breadcrumbs for the home page
    updateBreadcrumbs([{ name: "Home", path: "/" }]);
  }, [products.length, setProducts, updateBreadcrumbs]);

  const handleCreateCollection = (newCollectionName) => {
    createCollection(newCollectionName);
  };

  const handleFavoriteToggle = (product) => {
    if (favorites.has(product.id)) {
      setSelectedProduct(product);
      setShowRemoveModal(true);
    } else {
      setSelectedProduct(product);
      setShowCollectionModal(true);
    }
  };

  const confirmRemoveFromFavorites = () => {
    const productCollections = collections
      .filter((collection) =>
        collection.items.some((item) => item.id === selectedProduct.id)
      )
      .map((collection) => collection.name);

    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      newFavorites.delete(selectedProduct.id);
      sessionStorage.setItem("favorites", JSON.stringify([...newFavorites]));
      return newFavorites;
    });

    setCollections((prevCollections) =>
      prevCollections.map((collection) => ({
        ...collection,
        items: collection.items.filter(
          (item) => item.id !== selectedProduct.id
        ),
      }))
    );

    setRemovedCollections(productCollections);
    setRemovedProduct(selectedProduct);
    setShowUndoButton(true);

    setTimeout(() => {
      setShowUndoButton(false);
      setRemovedProduct(null);
      setRemovedCollections([]);
    }, 5000);

    setShowRemoveModal(false);
    setSelectedProduct(null);
  };

  const handleUndo = () => {
    if (removedProduct) {
      setCollections((prevCollections) =>
        prevCollections.map((collection) => {
          if (removedCollections.includes(collection.name)) {
            return {
              ...collection,
              items: [...collection.items, removedProduct],
            };
          }
          return collection;
        })
      );

      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        newFavorites.add(removedProduct.id);
        sessionStorage.setItem("favorites", JSON.stringify([...newFavorites]));
        return newFavorites;
      });

      setShowUndoButton(false);
      setRemovedProduct(null);
      setRemovedCollections([]);
    }
  };

  const handleAddToCollection = (selectedCollections) => {
    selectedCollections.forEach((collectionName) => {
      addToCollection(collectionName, selectedProduct);
    });

    setFavorites((prev) => new Set(prev.add(selectedProduct.id)));
    sessionStorage.setItem(
      "favorites",
      JSON.stringify([...favorites, selectedProduct.id])
    );
    setShowCollectionModal(false);
  };

  const handleViewDetails = (id, name) => {
    // Reset breadcrumbs for the product view
    updateBreadcrumbs([
      { name: "Home", path: "/" },
      { name: name, path: `/product/${id}` },
    ]);
  
    // Navigate to the product details page
    navigate(`/product/${id}`, { state: { from: "Home", productName: name } });
  };
  const filterProducts = () => {
    return products.filter((product) => {
      const matchesSearch = searchQuery
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const lowestPrice = getLowestPriceForCurrentMonth(product.sites);

      const matchesPrice =
        priceFilter.minPrice !== null && priceFilter.maxPrice !== null
          ? lowestPrice !== null &&
            lowestPrice >= Number(priceFilter.minPrice) &&
            lowestPrice <= Number(priceFilter.maxPrice)
          : true;

      return matchesSearch && matchesPrice;
    });
  };

  const renderProducts = () => {
    const filteredProducts = filterProducts();

    if (filteredProducts.length === 0) {
      return (
        <div className="no-matches">
          <p>No matches found. Expand your search</p>
        </div>
      );
    }

    return (
      <div className="products-grid">
        {filteredProducts.map((product) => {
          const lowestPrice = getLowestPriceForCurrentMonth(product.sites);

          return (
            <div
              key={product.id}
              className="product-card"
              onClick={() => handleViewDetails(product.id, product.name)}
              style={{ cursor: "pointer" }}
            >
              <h2>{product.name}</h2>
              <div className="image-container">
                <img
                  src={process.env.PUBLIC_URL + product.image}
                  alt={product.name}
                  className="product-image"
                />
                <button
                  className="favorite-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteToggle(product);
                  }}
                  onMouseEnter={() => setShowHeartTooltip(product.id)}
                  onMouseLeave={() => setShowHeartTooltip(null)}
                  aria-label="Toggle favorite"
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "none",
                    border: "none",
                    fontSize: "32px",
                    cursor: "pointer",
                    color: favorites.has(product.id) ? "red" : "gray",
                    lineHeight: "1.1",
                    transition: "color 0.3s",
                  }}
                >
                  {favorites.has(product.id) ? "♥" : "♡"}
                  {showHeartTooltip === product.id && (
                    <span className="heart-tooltip">Add to Favorites</span>
                  )}
                </button>
              </div>
              <p>{product.information}</p>
              {lowestPrice !== null ? (
                <h5>${lowestPrice}</h5>
              ) : (
                <h5>Price not available</h5>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Layout
      showSearch={true}
      searchPlaceholder="Search for Any Product or Brand. . ."
      searchValue={searchQuery}
      onSearchChange={(query) => setSearchQuery(query)}
    >
      <div className="container">
        <SearchFilterSidebar setPriceFilter={setPriceFilter} />
        <div className="second-header">
          <h2>
            Available Products
            <span className="tooltip-container">
              <span
                className="info-icon"
                onClick={() => setShowTooltip((prev) => !prev)}
              >
                i
              </span>
              {showTooltip && (
                <div className="tooltip-box">
                  <span className="tooltip-content">
                    Explore how Savr works:
                    <span
                      className="read-more-link"
                      onClick={() => {
                        setShowTooltip(false);
                        updateBreadcrumbs((prevBreadcrumbs) => [
                          ...prevBreadcrumbs,
                          { name: "How Savr Works", path: "/learn-more" },
                        ]);
                        navigate("/learn-more");
                      }}
                    >
                      Read more
                    </span>
                  </span>
                  <span
                    className="tooltip-close"
                    onClick={() => setShowTooltip(false)}
                  >
                    ✖
                  </span>
                </div>
              )}
            </span>
          </h2>
          {showUndoButton && (
            <button className="undo-button" onClick={handleUndo}>
              Undo
            </button>
          )}
        </div>

        <div className="products-list">{renderProducts()}</div>
        {showCollectionModal && (
          <CollectionModal
            show={showCollectionModal}
            collections={collections}
            onSelect={handleAddToCollection}
            onClose={() => setShowCollectionModal(false)}
            onCreateCollection={handleCreateCollection}
            selectedCollections={selectedCollections}
          />
        )}
        {showRemoveModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <p>
                This will remove the product from all favorited collections. Are
                you sure you want to proceed?
              </p>
              <div>
                <button
                  onClick={confirmRemoveFromFavorites}
                  className="modal-buttons"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowRemoveModal(false)}
                  className="modal-buttons"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Home;
