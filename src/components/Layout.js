import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css"; // Import your main CSS file for styling
import SearchFilterSidebar from "./SearchFilterSidebar";

// Mapping of URL segments to user-friendly names
const pathNameMap = {
  "": "Home",
  favorites: "Favorites",
  "contact-us": "Contact",
  product: "Product Details",
  "learn-more": "How Savr works",
  "All%20Items": "All Items",
  // Add other paths as needed
};

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const handleBreadcrumbClick = (name, routeTo) => {
    if (name === "collections") {
      navigate("/favorites");
    } else {
      navigate(routeTo);
    }
  };

  return (
    <div className="breadcrumb">
      <span onClick={() => navigate("/")} className="breadcrumb-link">
        Home
      </span>
      {pathnames.map((name, index) => {
        const displayName =
          name === "collections" ? "Favorites" : pathNameMap[name] || name;
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <span key={name}>
            <span
              onClick={() => !isLast && handleBreadcrumbClick(name, routeTo)}
              className={isLast ? "breadcrumb-current" : "breadcrumb-link"}
            >
              {displayName}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Layout Component
const Layout = ({
  children,
  showSearch,
  searchPlaceholder,
  onSearchChange,
  searchValue,
}) => {
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    navigate("/"); // Assuming '/' is your home route
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout-container">
      {/* Common Header */}
      <header className="app-header">
        <div className="header-logo">
          <h1
            className="logo-text"
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          >
            Savr
          </h1>
          <p className="tagline">Your trusted price tracking site</p>
        </div>

        {showSearch && (
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="search-bar"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        <div className="header-right-buttons">
          <button
            className={`help-button ${isActive("/") ? "active-button" : ""}`}
            onClick={() => navigate("/")}
          >
            Home
          </button>

          <button
            className={`help-button ${
              isActive("/favorites") ? "active-button" : ""
            }`}
            onClick={() => navigate("/favorites")}
          >
            Favorites
          </button>

          <div
            className="help-button-container"
            onMouseEnter={() => setShowHelpDropdown(true)}
            onMouseLeave={() => setShowHelpDropdown(false)}
          >
            <button
              className={`help-button ${
                isActive("/contact-us") || isActive("/learn-more")
                  ? "active-button"
                  : ""
              }`}
            >
              Help
            </button>
            {showHelpDropdown && (
              <div className="help-dropdown">
                <span
                  className="dropdown-item"
                  onClick={() => {
                    setShowHelpDropdown(false);
                    navigate("/contact-us");
                  }}
                >
                  Contact Support
                </span>
                <span
                  className="dropdown-item"
                  onClick={() => {
                    setShowHelpDropdown(false);
                    navigate("/learn-more");
                  }}
                >
                  How Savr Works
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb component */}
      <Breadcrumb />

      {/* Search Filter Sidebar */}
      {showSearch && searchValue && (
        <SearchFilterSidebar /> // Independent component, not inside <main>
      )}

      {/* Render page-specific content below the header */}
      <main>{children}</main>

      {/* Footer component */}
      <footer className="app-footer">
        <div className="footer-container">
          {/* Buttons Div */}
          <div className="footer-buttons">
            <span
              onClick={() => navigate("/contact-us")}
              className="footer-link"
            >
              Contact Us
            </span>
            <span
              onClick={() => navigate("/learn-more")}
              className="footer-link"
            >
              How Savr Works
            </span>
          </div>

          {/* Centered Text */}
          <p className="footer-text">
            &copy; {new Date().getFullYear()} Savr. All rights reserved.
          </p>

          {/* Social Media Icons Div */}
          <div className="social-media">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
