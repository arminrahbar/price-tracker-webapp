import React, { useState } from "react";
import "./Home.css"; // Use the existing CSS
import Layout from "./Layout"; // Import the common layout
import { useNavigate } from "react-router-dom";

function ContactUs() {
  // State to handle form inputs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // State for showing success or error messages
  const [statusMessage, setStatusMessage] = useState("");

  // Navigate hook to redirect to other pages
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      setStatusMessage("Please fill out all fields.");
      return;
    }

    // Mock form submission (Replace this with real API call if necessary)
    setTimeout(() => {
      setStatusMessage(
        "Your message has been sent! We will get back to you soon."
      );
      setFormData({ name: "", email: "", message: "" }); // Clear form after submission
    }, 1000);
  };

  return (
    <Layout>
      <div className="container">
        <div className="second-header">
          <h2>Contact Page</h2>
        </div>
        </div>
        <div className="contact-container">
        <form className="contact-form" onSubmit={handleSubmit}>
          {/* Name Input */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Message Textarea */}
          <div className="form-group">
            <label htmlFor="message" className="form-label">
              Message:
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="form-input"
              rows="5"
              placeholder="Enter your message"
              required
            ></textarea>
          </div>

          {/* Status Message */}
          {statusMessage && <p className="status-message">{statusMessage}</p>}

          {/* Buttons Container with Flexbox */}
          <div className="button-group">
          <button type="submit" className="btn">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
    <path d="M22 2L11 13"></path>
    <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
    <circle cx="11" cy="13" r="1" fill="currentColor"></circle>
  </svg>
  Send Message
</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default ContactUs;
