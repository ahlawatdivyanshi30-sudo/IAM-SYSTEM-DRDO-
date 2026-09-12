import React, { useEffect, useState } from "react";
import { getToken, getUserRoles } from "../auth";

const API = "http://localhost:4002/api/items";
const LOW_STOCK_THRESHOLD = 10;

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const roles = getUserRoles();
  const hasAccess = roles.includes("inventory-access");

  useEffect(() => {
    if (hasAccess) fetchItems();
    // eslint-disable-next-line
  }, []);

  async function fetchItems() {
    const res = await fetch(API, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) setItems(await res.json());
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!name || quantity === "" || !category) {
      setError("Name, quantity, and category are required.");
      return;
    }
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ name, quantity: Number(quantity), category }),
    });
    if (res.ok) {
      setName(""); setQuantity(""); setCategory("");
      fetchItems();
    } else {
      setError("Failed to add item.");
    }
  }

  async function handleQuantitySave(id) {
    await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ quantity: Number(editValue) }),
    });
    setEditingId(null);
    fetchItems();
  }

  async function handleDelete(id) {
    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setConfirmDeleteId(null);
    fetchItems();
  }

  if (!hasAccess) {
    return <div style={styles.deniedBox}>🚫 You do not have access to the Inventory module.</div>;
  }

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );
  const lowStockCount = items.filter((i) => i.quantity < LOW_STOCK_THRESHOLD).length;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Inventory</h2>

      {lowStockCount > 0 && (
        <div style={styles.warningBanner}>
          ⚠ {lowStockCount} item{lowStockCount > 1 ? "s" : ""} running low on stock
        </div>
      )}
      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleAdd} style={styles.form}>
        <input style={styles.input} placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={styles.input} placeholder="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <input style={styles.input} placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <button type="submit" style={styles.addBtn}>Add Item</button>
      </form>

      <input
        style={{ ...styles.input, marginBottom: "16px" }}
        placeholder="Search items by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Quantity</th>
            <th style={styles.th}>Category</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => {
            const isLow = item.quantity < LOW_STOCK_THRESHOLD;
            return (
              <tr key={item.id} style={isLow ? styles.lowRow : {}}>
                <td style={styles.td}>{item.name}</td>
                <td style={styles.td}>
                  {editingId === item.id ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        style={{ ...styles.input, width: "70px", padding: "4px 8px" }}
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <button style={styles.saveBtn} onClick={() => handleQuantitySave(item.id)}>Save</button>
                    </div>
                  ) : (
                    <span onClick={() => { setEditingId(item.id); setEditValue(item.quantity); }} style={{ cursor: "pointer" }}>
                      {item.quantity} {isLow && <span style={styles.lowBadge}>LOW</span>}
                    </span>
                  )}
                </td>
                <td style={styles.td}>{item.category}</td>
                <td style={styles.td}>
                  {confirmDeleteId === item.id ? (
                    <>
                      <button style={styles.confirmBtn} onClick={() => handleDelete(item.id)}>Confirm</button>
                      <button style={styles.cancelBtn} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button style={styles.deleteBtn} onClick={() => setConfirmDeleteId(item.id)}>Delete</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { padding: "28px", maxWidth: "900px", margin: "0 auto" },
  heading: { marginBottom: "20px" },
  form: { display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" },
  input: {
    flex: 1, minWidth: "140px", background: "#faf8f5", border: "1px solid #e4ddd3",
    borderRadius: "6px", padding: "10px 12px", color: "#2b2620", fontSize: "14px", outline: "none",
  },
  addBtn: {
    background: "#6b1e35", border: "none", borderRadius: "6px",
    padding: "10px 18px", color: "#faf8f5", fontWeight: "600",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", padding: "10px", borderBottom: "1px solid #e4ddd3",
    color: "#6e655c", fontSize: "12px", textTransform: "uppercase",
  },
  td: { padding: "10px", borderBottom: "1px solid #e4ddd3", fontSize: "14px" },
  lowRow: { background: "rgba(217,83,79,0.08)" },
  lowBadge: {
    background: "#b3261e", color: "#fff", fontSize: "10px", fontWeight: "700",
    padding: "2px 6px", borderRadius: "4px", marginLeft: "8px",
  },
  saveBtn: {
    background: "#2e7d4f", border: "none", color: "#fff",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
  },
  deleteBtn: {
    background: "transparent", border: "1px solid #b3261e", color: "#b3261e",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
  },
  confirmBtn: {
    background: "#b3261e", border: "none", color: "#fff",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px", marginRight: "6px",
  },
  cancelBtn: {
    background: "transparent", border: "1px solid #e4ddd3", color: "#6e655c",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
  },
  warningBanner: {
    background: "rgba(217,83,79,0.12)", border: "1px solid #b3261e", color: "#b3261e",
    padding: "10px 14px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px",
  },
  errorBox: {
    background: "rgba(217,83,79,0.12)", border: "1px solid #b3261e", color: "#b3261e",
    padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "12px",
  },
  deniedBox: { padding: "60px", textAlign: "center", color: "#b3261e", fontSize: "16px" },
};