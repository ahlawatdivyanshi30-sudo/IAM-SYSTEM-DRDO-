import React, { useEffect, useState } from "react";
import { getToken, getUserRoles } from "../auth";

const API = "http://localhost:4003/api/assets";
const CONDITIONS = ["Good", "Fair", "Poor", "Under Repair"];

const CONDITION_COLORS = {
  Good: { bg: "rgba(95,184,122,0.15)", text: "#2e7d4f" },
  Fair: { bg: "rgba(232,162,61,0.15)", text: "#6b1e35" },
  Poor: { bg: "rgba(217,83,79,0.15)", text: "#b3261e" },
  "Under Repair": { bg: "rgba(217,83,79,0.15)", text: "#b3261e" },
};

export default function AssetPage() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", asset_tag: "", category: "", location: "", condition: "Good", assigned_to: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const roles = getUserRoles();
  const hasAccess = roles.includes("asset-access");

  useEffect(() => {
    if (hasAccess) fetchAssets();
    // eslint-disable-next-line
  }, []);

  async function fetchAssets() {
    const res = await fetch(API, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) setAssets(await res.json());
  }

  function resetForm() {
    setForm({ name: "", asset_tag: "", category: "", location: "", condition: "Good", assigned_to: "" });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.asset_tag || !form.category || !form.location) {
      setError("Name, tag, category, and location are required.");
      return;
    }

    const url = editingId ? `${API}/${editingId}` : API;
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      resetForm();
      fetchAssets();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save asset.");
    }
  }

  function handleEdit(asset) {
    setForm({
      name: asset.name, asset_tag: asset.asset_tag, category: asset.category,
      location: asset.location, condition: asset.condition, assigned_to: asset.assigned_to || "",
    });
    setEditingId(asset.id);
  }

  async function handleDelete(id) {
    await fetch(`${API}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    setConfirmDeleteId(null);
    fetchAssets();
  }

  if (!hasAccess) {
    return <div style={styles.deniedBox}>🚫 You do not have access to the Asset Tracker module.</div>;
  }

  const filtered = assets.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.asset_tag.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Asset Tracker</h2>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input style={styles.input} placeholder="Asset name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input style={styles.input} placeholder="Asset tag" value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} />
        <input style={styles.input} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input style={styles.input} placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <select style={styles.input} value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input style={styles.input} placeholder="Assigned to" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
        <button type="submit" style={styles.addBtn}>{editingId ? "Update" : "Register"}</button>
        {editingId && <button type="button" style={styles.cancelEditBtn} onClick={resetForm}>Cancel</button>}
      </form>

      <input
        style={{ ...styles.input, marginBottom: "16px", width: "100%" }}
        placeholder="Search by name, tag, or location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Tag</th>
            <th style={styles.th}>Category</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Condition</th>
            <th style={styles.th}>Assigned To</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a) => {
            const colors = CONDITION_COLORS[a.condition];
            return (
              <tr key={a.id}>
                <td style={styles.td}>{a.name}</td>
                <td style={styles.td} className="mono">{a.asset_tag}</td>
                <td style={styles.td}>{a.category}</td>
                <td style={styles.td}>{a.location}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: colors.bg, color: colors.text }}>
                    {a.condition}
                  </span>
                </td>
                <td style={styles.td}>{a.assigned_to}</td>
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => handleEdit(a)}>Edit</button>
                  {confirmDeleteId === a.id ? (
                    <>
                      <button style={styles.confirmBtn} onClick={() => handleDelete(a.id)}>Confirm</button>
                      <button style={styles.cancelBtn} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button style={styles.deleteBtn} onClick={() => setConfirmDeleteId(a.id)}>Delete</button>
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
  container: { padding: "28px", maxWidth: "1050px", margin: "0 auto" },
  heading: { marginBottom: "20px" },
  form: { display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" },
  input: {
    flex: 1, minWidth: "130px", background: "#faf8f5", border: "1px solid #e4ddd3",
    borderRadius: "6px", padding: "10px 12px", color: "#2b2620", fontSize: "14px", outline: "none",
  },
  addBtn: {
    background: "#6b1e35", border: "none", borderRadius: "6px",
    padding: "10px 18px", color: "#faf8f5", fontWeight: "600",
  },
  cancelEditBtn: {
    background: "transparent", border: "1px solid #e4ddd3", borderRadius: "6px",
    padding: "10px 18px", color: "#6e655c",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", padding: "10px", borderBottom: "1px solid #e4ddd3",
    color: "#6e655c", fontSize: "12px", textTransform: "uppercase",
  },
  td: { padding: "10px", borderBottom: "1px solid #e4ddd3", fontSize: "14px" },
  badge: {
    padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600",
  },
  editBtn: {
    background: "transparent", border: "1px solid #6b1e35", color: "#6b1e35",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px", marginRight: "6px",
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
  errorBox: {
    background: "rgba(217,83,79,0.12)", border: "1px solid #b3261e", color: "#b3261e",
    padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "12px",
  },
  deniedBox: { padding: "60px", textAlign: "center", color: "#b3261e", fontSize: "16px" },
};