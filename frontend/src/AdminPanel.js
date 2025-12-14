import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

function AdminPanel() {
  const [sweets, setSweets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
  });
  const { token } = useAuth();

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = () => {
    fetch("http://127.0.0.1:8000/api/sweets")
      .then((res) => res.json())
      .then((data) => setSweets(data))
      .catch((err) => console.error("Error:", err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const url = editingSweet
      ? `http://127.0.0.1:8000/api/sweets/${editingSweet.id}`
      : "http://127.0.0.1:8000/api/sweets";
    
    const method = editingSweet ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(() => {
        fetchSweets();
        setShowForm(false);
        setEditingSweet(null);
        setFormData({ name: "", category: "", price: "", quantity: "" });
        alert(editingSweet ? "Sweet updated!" : "Sweet added!");
      })
      .catch((err) => alert("Error: " + err.message));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this sweet?")) return;

    fetch(`http://127.0.0.1:8000/api/sweets/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        fetchSweets();
        alert("Sweet deleted!");
      })
      .catch((err) => alert("Error: " + err.message));
  };

  const handleRestock = (id) => {
    const quantity = prompt("How many to add to stock?");
    if (!quantity || isNaN(quantity)) return;

    fetch(`http://127.0.0.1:8000/api/sweets/${id}/restock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: parseInt(quantity) }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchSweets();
        alert("Stock updated!");
      })
      .catch((err) => alert("Error: " + err.message));
  };

  const startEdit = (sweet) => {
    setEditingSweet(sweet);
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
      description: sweet.description || "",
    });
    setShowForm(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2 style={{ color: "white", fontSize: "2rem" }}>🔧 Inventory Management Dashboard</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingSweet(null);
            setFormData({ name: "", category: "", price: "", quantity: "", description: "" });
          }}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
            color: "white",
            fontSize: "1.1rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "+ Add New Sweet"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: "white",
            borderRadius: "15px",
            padding: "30px",
            marginBottom: "30px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#667eea" }}>
            {editingSweet ? "Edit Sweet" : "Add New Sweet"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
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
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
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
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
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
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
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
            <div style={{ marginTop: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the sweet..."
                rows="3"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                fontSize: "1.1rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {editingSweet ? "Update Sweet" : "Add Sweet"}
            </button>
          </form>
        </div>
      )}

      {/* Sweets Table */}
      <div
        style={{
          background: "white",
          borderRadius: "15px",
          padding: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f7fafc", borderBottom: "2px solid #e0e0e0" }}>
              <th style={{ padding: "15px", textAlign: "left" }}>ID</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Name</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Category</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Price</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Quantity</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sweets.map((sweet) => (
              <tr key={sweet.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "15px" }}>{sweet.id}</td>
                <td style={{ padding: "15px", fontWeight: "600" }}>{sweet.name}</td>
                <td style={{ padding: "15px" }}>{sweet.category}</td>
                <td style={{ padding: "15px" }}>₹{sweet.price}</td>
                <td style={{ padding: "15px", color: sweet.quantity > 0 ? "#48bb78" : "#f56565", fontWeight: "600" }}>
                  {sweet.quantity}
                </td>
                <td style={{ padding: "15px" }}>
                  <button
                    onClick={() => startEdit(sweet)}
                    style={{
                      marginRight: "10px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#667eea",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRestock(sweet.id)}
                    style={{
                      marginRight: "10px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#48bb78",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Restock
                  </button>
                  <button
                    onClick={() => handleDelete(sweet.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#f56565",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPanel;
