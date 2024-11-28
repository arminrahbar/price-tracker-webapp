import React, { useEffect } from "react";
import Layout from "./Layout"; // Import the common Layout component for header and page structure
import "./Home.css"; // Use the same CSS styles for consistency
import { useProducts } from "../contexts/ProductsContext"; // Import breadcrumb context

function LearnMore() {
  const { updateBreadcrumbs } = useProducts(); // Access breadcrumb update function

  // Set breadcrumbs for LearnMore page
  useEffect(() => {
    updateBreadcrumbs([
      { name: "Home", path: "/" },
      { name: "How Savr Works", path: "/learn-more" },
    ]);
  }, [updateBreadcrumbs]);

  return (
    <Layout>
      <div className="container">
        <div className="second-header">
          <h2>How Savr Works</h2>
          <div className="learn-more-container">
            <p>
              It is important to us that you feel safe when you compare prices
              of a product you might be interested to buy or use any of our
              other services. Therefore, we are providing you with certain
              information about how to use Savr.
            </p>

            <h2>How to find the products you are looking for</h2>

            <p>
              On home page, you can see all available products and their lowest
              current price displayed. You can add these products to your
              favorite collections by clicking the heart icon on the top right
              hand corner of each product.
            </p>

            <h2>How to add products to your favorite collections</h2>
            <p>
              Clicking on the heart icon on each provides you with options to
              create a new collection and add your products to any of these
              newly or previously created collections. To see your favorite
              collections, click on the Favorites tab in the header of the
              website.
            </p>

            <h2>How to see product price history from various vendors</h2>
            <p>
              Clicking on each product takes you to the product page where you
              can see details about the product, a list of vendors for that
              product, and their prices. Under the vendors, there is a graph
              displayed that shows price trends over time from various vendors.
            </p>

            <p>
              Thank you for choosing Savr! <br />
              We hope our platform helps you save time and money.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LearnMore;
