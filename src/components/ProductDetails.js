import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./Home.css"; // Ensure the path is correct
import { useProducts } from "../contexts/ProductsContext";
import Layout from "./Layout"; // Import Layout component
import { Line } from "react-chartjs-2"; // Import Line chart
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ProductDetails() {
  const { id } = useParams();
  const location = useLocation();
  const {
    products,
    setProducts,
    getCurrentMonthPriceForVendor,
    getVendorPriceData,
    updateBreadcrumbs,
  } = useProducts();
  const [product, setProduct] = useState(null);
  const [chartData, setChartData] = useState(null);

  // Predefined distinct colors for the chart
  const colorPalette = [
    "#B33F24", "#249E3A", "#243A9E", "#9E2471",
    "#249E9E", "#9E9E24", "#6F249E", "#9E5A24",
    "#24719E", "#5A249E",
  ];

  // Fetch product data
  useEffect(() => {
    const foundProduct = products.find((p) => p.id === parseInt(id));
    if (foundProduct) {
      // Initialize product data
      if (!foundProduct.selectedSites) {
        foundProduct.selectedSites = [foundProduct.sites[0]];
        setProducts(
          products.map((p) => (p.id === foundProduct.id ? foundProduct : p))
        );
      }
      setProduct(foundProduct);

      // Prepare chart data
      const vendorData = getVendorPriceData(foundProduct.sites);
      setChartData({
        labels: vendorData[0]?.prices.map((price) => price.month), // Months as labels
        datasets: vendorData.map((vendor, index) => ({
          label: vendor.vendor, // Vendor name as dataset label
          data: vendor.prices.map((price) => price.price), // Prices as data
          fill: false,
          borderColor: colorPalette[index % colorPalette.length], // Predefined color
          tension: 0.3,
        })),
      });
    }
  }, [products, id, setProducts, getVendorPriceData]);

  // Update breadcrumbs after the product is set
  useEffect(() => {
    if (!product) return;

    const from = location.state?.from || "Home";
    const collectionName = location.state?.collectionName || null;

    if (from === "Favorites" && collectionName) {
      updateBreadcrumbs([
        { name: "Home", path: "/" },
        { name: "Favorites", path: "/favorites" },
        { name: collectionName, path: `/collections/${collectionName}` },
        { name: product.name, path: `/product/${id}` },
      ]);
    } else {
      updateBreadcrumbs([
        { name: "Home", path: "/" },
        { name: product.name, path: `/product/${id}` },
      ]);
    }
  }, [product, location.state, updateBreadcrumbs, id]);

  return (
    <Layout>
      <div className="container">
        {!product ? (
          <p>Loading or Product not found...</p>
        ) : (
          <>
            <div className="second-header">
              <h2>{product.name}</h2>
            </div>
            {/* Display product image below the product name */}
            <div className="image-container">
              <img
                src={process.env.PUBLIC_URL + product.image}
                alt={product.name}
                className="product-image"
              />
            </div>

            {/* Display product information under the product image */}
            <p>{product.information}</p>

            {/* Display vendor prices */}
            {product.sites &&
              product.sites.length > 0 &&
              product.sites.map((site, index) => {
                const currentMonthPrice = getCurrentMonthPriceForVendor(site);
                return (
                  <div className="item" key={index}>
                    <label>
                      {`${site.site}: `}
                      <span style={{ color: "#1b5da8", fontWeight: "bold" }}>
                        ${currentMonthPrice || "N/A"}
                      </span>
                    </label>
                  </div>
                );
              })}

            {/* Render the chart if data is available */}
            {chartData && (
              <div style={{ marginTop: "25px", position: "center" }}>
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    animation: false, // Fully disable animations
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          font: {
                            size: 14,
                          },
                        },
                      },
                      title: {
                        display: true,
                        text: "Price Trends",
                        font: {
                          size: 18,
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default ProductDetails;
