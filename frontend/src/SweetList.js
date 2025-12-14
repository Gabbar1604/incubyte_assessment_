import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

function SweetList() {
  const [sweets, setSweets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const { token, user } = useAuth();

  // Fetch sweets from backend
  const fetchSweets = () => {
    let url = "http://127.0.0.1:8000/api/sweets";
    
    // Add search parameters
    const params = new URLSearchParams();
    if (searchTerm) params.append("name", searchTerm);
    if (categoryFilter) params.append("category", categoryFilter);
    if (priceRange.min) params.append("min_price", priceRange.min);
    if (priceRange.max) params.append("max_price", priceRange.max);
    
    if (params.toString()) {
      url = `http://127.0.0.1:8000/api/sweets/search?${params.toString()}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => setSweets(data))
      .catch((err) => console.error("Error fetching sweets:", err));
  };

  useEffect(() => {
    fetchSweets();
  }, [searchTerm, categoryFilter, priceRange]);

  // Purchase sweet
  const purchaseSweet = (sweetId) => {
    if (!token) {
      alert("Please login to purchase");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/sweets/${sweetId}/purchase`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Out of stock");
        }
        return res.json();
      })
      .then(() => {
        // Refresh sweets list
        fetchSweets();
        alert("Purchase successful!");
      })
      .catch(() => alert("Out of stock or purchase failed"));
  };

  // Get unique categories
  const categories = [...new Set(sweets.map((s) => s.category))];

  return (
    <div>
      {/* Search and Filter Section */}
      <div
        style={{
          background: "white",
          borderRadius: "15px",
          padding: "25px",
          marginBottom: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#667eea",
          }}
        >
          🔍 Search & Filter
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Search by Name
            </label>
            <input
              type="text"
              placeholder="e.g., Kaju Katli"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "2px solid #e0e0e0",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "2px solid #e0e0e0",
                boxSizing: "border-box",
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Min Price
            </label>
            <input
              type="number"
              placeholder="₹0"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "2px solid #e0e0e0",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Max Price
            </label>
            <input
              type="number"
              placeholder="₹1000"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "2px solid #e0e0e0",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {(searchTerm || categoryFilter || priceRange.min || priceRange.max) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("");
              setPriceRange({ min: "", max: "" });
            }}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: "#f56565",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Sweets Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          padding: "20px",
        }}
      >
        {sweets.map((sweet) => (
          <div
            key={sweet.id}
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "25px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
            }}
          >
            <h3
              style={{
                fontSize: "1.8rem",
                marginBottom: "15px",
                color: "#667eea",
                borderBottom: "2px solid #f0f0f0",
                paddingBottom: "10px",
              }}
            >
              {sweet.name}
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "#666",
                  marginBottom: "12px",
                  fontStyle: "italic",
                  minHeight: "40px",
                }}
              >
                {sweet.description || "Delicious traditional sweet"}
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#888",
                  marginBottom: "10px",
                }}
              >
                📂 {sweet.category}
              </p>
              <p
                style={{
                  fontSize: "1.3rem",
                  color: "#2d3748",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                💰 Price: ₹{sweet.price}
              </p>
              <p
                style={{
                  fontSize: "1.1rem",
                  color: sweet.quantity > 0 ? "#48bb78" : "#f56565",
                  fontWeight: "600",
                }}
              >
                📦 Available: {sweet.quantity}{" "}
                {sweet.quantity === 0 && "(Out of Stock)"}
              </p>
            </div>

            <button
              onClick={() => purchaseSweet(sweet.id)}
              disabled={sweet.quantity === 0 || !token}
              style={{
                width: "100%",
                padding: "12px 20px",
                fontSize: "1.1rem",
                fontWeight: "bold",
                borderRadius: "8px",
                border: "none",
                background:
                  sweet.quantity === 0 || !token
                    ? "#cbd5e0"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                cursor:
                  sweet.quantity === 0 || !token ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow:
                  sweet.quantity === 0 || !token
                    ? "none"
                    : "0 4px 15px rgba(102, 126, 234, 0.4)",
              }}
              onMouseEnter={(e) => {
                if (sweet.quantity > 0 && token) {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(102, 126, 234, 0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (sweet.quantity > 0 && token) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px rgba(102, 126, 234, 0.4)";
                }
              }}
            >
              {!token
                ? "🔒 Login to Purchase"
                : sweet.quantity === 0
                ? "❌ Out of Stock"
                : "🛒 Purchase Now"}
            </button>
          </div>
        ))}
      </div>

      {sweets.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "white",
            fontSize: "1.5rem",
            padding: "40px",
          }}
        >
          No sweets found. Try different filters!
        </div>
      )}
    </div>
  );
}

export default SweetList;
