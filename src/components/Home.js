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
  } = useProducts();

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState({
    minPrice: null,
    maxPrice: null,
  });

  const [showTooltip, setShowTooltip] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false); // State for the remove confirmation modal
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
  }, [products.length, setProducts]);

  const handleCreateCollection = (newCollectionName) => {
    createCollection(newCollectionName);
  };

  const handleFavoriteToggle = (product) => {
    if (favorites.has(product.id)) {
      setSelectedProduct(product);
      setShowRemoveModal(true); // Show the confirmation modal
    } else {
      setSelectedProduct(product);
      setShowCollectionModal(true);
    }
  };

  const confirmRemoveFromFavorites = () => {
    // Identify the collections the selected product belongs to
    const productCollections = collections
      .filter((collection) =>
        collection.items.some((item) => item.id === selectedProduct.id)
      )
      .map((collection) => collection.name);

    // Remove the product from the favorites
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      newFavorites.delete(selectedProduct.id);
      sessionStorage.setItem("favorites", JSON.stringify([...newFavorites]));
      return newFavorites;
    });

    // Remove the product from all collections
    setCollections((prevCollections) =>
      prevCollections.map((collection) => ({
        ...collection,
        items: collection.items.filter(
          (item) => item.id !== selectedProduct.id
        ),
      }))
    );

    // Store removed collections and product for Undo functionality
    setRemovedCollections(productCollections); // Store the collection names
    setRemovedProduct(selectedProduct); // Store the removed product
    setShowUndoButton(true); // Show Undo button

    // Hide Undo button after 5 seconds
    setTimeout(() => {
      setShowUndoButton(false);
      setRemovedProduct(null); // Clear the removed product
      setRemovedCollections([]); // Clear the collection names
    }, 5000);

    // Close the confirmation modal and reset selected product
    setShowRemoveModal(false);
    setSelectedProduct(null);
  };

  const handleUndo = () => {
    if (removedProduct) {
      // Restore product to specific collections
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

      // Restore product to favorites
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        newFavorites.add(removedProduct.id);
        sessionStorage.setItem("favorites", JSON.stringify([...newFavorites]));
        return newFavorites;
      });

      // Clear Undo state
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

  const handleViewDetails = (id) => {
    navigate(`/product/${id}`);
  };

  const filterProducts = () => {
    return products.filter((product) => {
      const matchesSearch = searchQuery
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesPrice =
        priceFilter.minPrice !== null && priceFilter.maxPrice !== null
          ? product.sites.some(
              (site) =>
                Number(site.price) >= Number(priceFilter.minPrice) &&
                Number(site.price) <= Number(priceFilter.maxPrice)
            )
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
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => handleViewDetails(product.id)}
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
            {product.sites && product.sites.length > 0 && (
              <h5>${product.sites[0].price}</h5>
            )}
          </div>
        ))}
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
