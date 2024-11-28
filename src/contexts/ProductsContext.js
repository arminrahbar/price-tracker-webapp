import React, { createContext, useState, useContext, useEffect } from "react";

const ProductsContext = createContext();

export const useProducts = () => useContext(ProductsContext);

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]); // Full list of products
  const [searchQuery, setSearchQuery] = useState(""); // Current search query
  const [filteredProducts, setFilteredProducts] = useState([]); // Displayed products
  const [breadcrumbs, setBreadcrumbs] = useState([{ name: "Home", path: "/" }]);

  const [priceFilter, setPriceFilter] = useState({
    minPrice: null,
    maxPrice: null,
  }); // Price filter state

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/store.json`);
        const data = await response.json();
        setProducts(data); // Store all products
        setFilteredProducts(data); // Initially show all products
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Apply filters (search and price) whenever products, searchQuery, or priceFilter change
  useEffect(() => {
    let updatedProducts = products;

    // Apply search filter
    if (searchQuery) {
      updatedProducts = updatedProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price filter
    if (priceFilter.minPrice !== null && priceFilter.maxPrice !== null) {
      updatedProducts = updatedProducts.filter((product) =>
        product.sites.some(
          (site) =>
            Number(site.price) >= Number(priceFilter.minPrice) &&
            Number(site.price) <= Number(priceFilter.maxPrice)
        )
      );
    }

    setFilteredProducts(updatedProducts);
  }, [products, searchQuery, priceFilter]);


  // Function to update breadcrumbs
  const updateBreadcrumbs = (crumbs) => {
    setBreadcrumbs(crumbs);
  };


    // Function to get price data for all months for each vendor of a product
    const getVendorPriceData = (sites) => {
      return sites.map((site) => ({
        vendor: site.site,
        prices: site.monthlyPrices.map((priceEntry) => ({
          month: priceEntry.monthName,
          price: priceEntry.price,
        })),
      }));
    };

  
  // Utility function to find the lowest price for the current month
  const getLowestPriceForCurrentMonth = (sites) => {
    const currentMonthNumber = new Date().getMonth() + 1; // December = 12
    let lowestPrice = Infinity;

    sites.forEach((site) => {
      const priceForCurrentMonth = site.monthlyPrices.find(
        (priceEntry) => priceEntry.monthNumber === currentMonthNumber
      );
      if (priceForCurrentMonth && priceForCurrentMonth.price < lowestPrice) {
        lowestPrice = priceForCurrentMonth.price;
      }
    });

    return lowestPrice === Infinity ? null : lowestPrice; // Return null if no prices available
  };


  const getCurrentMonthPriceForVendor = (site) => {
    const currentMonthNumber = new Date().getMonth() + 1; // Current month (1-based index)
    const priceForCurrentMonth = site.monthlyPrices.find(
      (priceEntry) => priceEntry.monthNumber === currentMonthNumber
    );
    return priceForCurrentMonth ? priceForCurrentMonth.price : null; // Return null if no price is found
  };

  // Function to handle the price filter
  const filterProductsByPrice = (minPrice, maxPrice) => {
    setPriceFilter({ minPrice, maxPrice });
  };

  // Function to reset price filters
  const resetFilters = () => {
    setPriceFilter({ minPrice: null, maxPrice: null });
  };

  // Function to update the search query
  const updateSearchQuery = (query) => {
    setSearchQuery(query);
  };

  // Favorites and collections logic remains the same
  const [selectedProducts, setSelectedProducts] = useState(() => {
    const savedProducts = localStorage.getItem("selectedProducts");
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  const [favorites, setFavorites] = useState(new Set());

  const [collections, setCollections] = useState([
    { name: "All Items", items: [] },
  ]);

  useEffect(() => {
    sessionStorage.setItem("favorites", JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  useEffect(() => {
    sessionStorage.removeItem("favorites");
  }, []);

  const createCollection = (name) => {
    setCollections((prevCollections) => [
      ...prevCollections,
      { name, items: [] },
    ]);
  };

  const addToCollection = (collectionName, item) => {
    setCollections((prevCollections) => {
      let updatedCollections = prevCollections.map((collection) => {
        if (collection.name === collectionName) {
          const isInCollection = collection.items.some((i) => i.id === item.id);
          return {
            ...collection,
            items: isInCollection
              ? collection.items
              : [...collection.items, item],
          };
        }

        if (collectionName !== "All Items" && collection.name === "All Items") {
          const isInAllItems = collection.items.some((i) => i.id === item.id);
          return {
            ...collection,
            items: isInAllItems
              ? collection.items
              : [...collection.items, item],
          };
        }

        return collection;
      });

      setFavorites((prev) => new Set(prev).add(item.id));

      return updatedCollections;
    });
  };

  const removeFromCollection = (collectionName, productId) => {
    setCollections((prevCollections) => {
      const updatedCollections = prevCollections.map((collection) => {
        if (collection.name === collectionName) {
          return {
            ...collection,
            items: collection.items.filter((item) => item.id !== productId),
          };
        }
        return collection;
      });

      const isInOtherCollections = updatedCollections
        .filter((collection) => collection.name !== "All Items")
        .some((collection) =>
          collection.items.some((item) => item.id === productId)
        );

      const finalCollections = updatedCollections.map((collection) => {
        if (collection.name === "All Items") {
          return {
            ...collection,
            items: isInOtherCollections
              ? collection.items
              : collection.items.filter((item) => item.id !== productId),
          };
        }
        return collection;
      });

      setFavorites((prev) => {
        const updatedFavorites = new Set(prev);
        if (!isInOtherCollections) updatedFavorites.delete(productId);
        return updatedFavorites;
      });

      return finalCollections;
    });
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        filteredProducts, // Updated dynamically with search and price filters
        setProducts,
        filterProductsByPrice,
        resetFilters,
        updateSearchQuery, // Expose search query function
        selectedProducts,
        setSelectedProducts,
        favorites,
        setFavorites,
        collections,
        setCollections,
        createCollection,
        addToCollection,
        removeFromCollection,
        getLowestPriceForCurrentMonth,
        getCurrentMonthPriceForVendor,
        getVendorPriceData,
        breadcrumbs,
        updateBreadcrumbs // Expose the utility function
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};
