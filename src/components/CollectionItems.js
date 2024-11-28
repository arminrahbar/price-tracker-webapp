import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../contexts/ProductsContext";
import Layout from "./Layout";
import "./Home.css";

const CollectionItem = () => {
  const { collectionName } = useParams();
  const {
    collections,
    setCollections,
    setFavorites,
    removeFromCollection,
    getLowestPriceForCurrentMonth,
    updateBreadcrumbs,
  } = useProducts();
  const navigate = useNavigate();
  const [showUndoButton, setShowUndoButton] = useState(false);
  const [removedProduct, setRemovedProduct] = useState(null);
  const [removedCollectionName, setRemovedCollectionName] = useState(null);

  const sortedCollections = collections.sort((a, b) => {
    if (a.name === "All Items") return -1;
    if (b.name === "All Items") return 1;
    if (a.name === "Create Collection") return -1;
    if (b.name === "Create Collection") return 1;
    return a.name.localeCompare(b.name); // Sort other collections alphabetically
  });

  const collection = sortedCollections.find((c) => c.name === collectionName);

  useEffect(() => {
    if (collection) {
      // Initialize breadcrumbs with Home, Favorites, and Collection
      updateBreadcrumbs([
        { name: "Home", path: "/" },
        { name: "Favorites", path: "/favorites" },
        { name: collection.name, path: `/favorites/${collection.name}` },
      ]);
    }
  }, [collection, updateBreadcrumbs]);
  
  // Function to handle product click and update breadcrumbs dynamically
  const handleItemClick = (productId, productName) => {
    // Append product name to breadcrumbs
    updateBreadcrumbs((prevBreadcrumbs) => [
      ...prevBreadcrumbs,
      { name: productName, path: `/product/${productId}` },
    ]);
  
    // Navigate to product details page
    navigate(`/product/${productId}`, {
      state: {
        from: "Favorites",
        collectionName: collection.name,
        productName: productName,
      },
    });
  };
  

  const handleRemove = (item) => {
    const productId = item.id;

    if (collection.name === "All Items") {
      setCollections((prevCollections) =>
        prevCollections.map((col) => ({
          ...col,
          items: col.items.filter((product) => product.id !== productId),
        }))
      );

      setFavorites((prev) => {
        const updatedFavorites = new Set(prev);
        updatedFavorites.delete(productId);
        sessionStorage.setItem(
          "favorites",
          JSON.stringify([...updatedFavorites])
        );
        return updatedFavorites;
      });
    } else {
      removeFromCollection(collection.name, productId);

      const existsInOtherCollections = collections
        .filter((col) => col.name !== collection.name)
        .some((col) => col.items.some((product) => product.id === productId));

      if (!existsInOtherCollections) {
        removeFromCollection("All Items", productId);

        setFavorites((prev) => {
          const updatedFavorites = new Set(prev);
          updatedFavorites.delete(productId);
          sessionStorage.setItem(
            "favorites",
            JSON.stringify([...updatedFavorites])
          );
          return updatedFavorites;
        });
      }
    }

    setRemovedProduct(item);
    setRemovedCollectionName(collection.name);
    setShowUndoButton(true);

    setTimeout(() => {
      setShowUndoButton(false);
      setRemovedProduct(null);
      setRemovedCollectionName(null);
    }, 5000);
  };

  const handleUndo = () => {
    if (removedProduct) {
      setCollections((prevCollections) =>
        prevCollections.map((col) => {
          if (col.name === removedCollectionName) {
            return {
              ...col,
              items: [...col.items, removedProduct],
            };
          }
          if (col.name === "All Items") {
            return {
              ...col,
              items: col.items.some((item) => item.id === removedProduct.id)
                ? col.items
                : [...col.items, removedProduct],
            };
          }
          return col;
        })
      );

      setFavorites((prev) => new Set(prev).add(removedProduct.id));

      setShowUndoButton(false);
      setRemovedProduct(null);
      setRemovedCollectionName(null);
    }
  };

  return (
    <Layout>
      <div className="container">
        <div className="second-header">
          <h2>{collection.name} Collection</h2>
          {showUndoButton && (
            <button className="undo-button" onClick={handleUndo}>
              Undo
            </button>
          )}
        </div>
        <div className="products-grid">
          {collection.items.map((item) => {
            const lowestPrice =
              item.sites && item.sites.length > 0
                ? getLowestPriceForCurrentMonth(item.sites)
                : null;

            return (
              <div
                key={item.id}
                className="product-card"
                onClick={() => handleItemClick(item.id, item.name)}
                style={{ cursor: "pointer", position: "relative" }}
              >
                <h2>{item.name}</h2>
                <div className="image-container">
                  <img
                    src={process.env.PUBLIC_URL + item.image}
                    alt={item.name}
                    className="product-image"
                  />
                </div>
                <p>{item.information || "No description available"}</p>
                {lowestPrice !== null ? (
                  <h5 className="price">${lowestPrice}</h5>
                ) : (
                  <h5 className="price">Price not available</h5>
                )}
                <button
                  className="remove-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item);
                  }}
                  style={{
                    position: "absolute",
                    top: "30px",
                    right: "10px",
                    transform: "translateY(-50%)",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: "24px", height: "24px" }}
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <rect x="5" y="6" width="14" height="14" rx="2" ry="2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default CollectionItem;
