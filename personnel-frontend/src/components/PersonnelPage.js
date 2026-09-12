import React, { useEffect, useState } from "react";
import { getToken, getUserRoles } from "../auth";

const API = "http://localhost:4005/api/staff";

export default function PersonnelPage() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", designation: "", department: "", email: "", phone: "", location: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const roles = getUserRoles();
  const hasAccess = roles.includes("personnel-access");

  useEffect(() => {
    if (hasAccess) fetchStaff();
    // eslint-disable-next-line
  }, []);

  async function fetchStaff() {
    const res = await fetch(API, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) setStaff(await res.json());
  }

  function resetForm() {
    setForm({ name: "", designation: "", department: "", email: "", phone: "", location: "" });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const { name, designation, department, email, phone, location } = form;
    if (!name || !designation || !department || !email || !phone || !location) {
      setError("All fields are required.");
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
      fetchStaff();
    } else {
      setError("Failed to save staff record.");
    }
  }

  function handleEdit(person) {
    setForm({
      name: person.name, designation: person.designation, department: person.department,
      email: person.email, phone: person.phone, location: person.location,
    });
    setEditingId(person.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    await fetch(`${API}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    setConfirmDeleteId(null);
    fetchStaff();
  }

  if (!hasAccess) {
    return <div style={styles.deniedBox}>🚫 You do not have access to the Personnel Directory module.</div>;
  }

  const filtered = staff.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.designation.toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>Personnel Directory</h2>
        <button style={styles.addToggleBtn} onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
          {showForm ? "Cancel" : "+ Add Staff"}
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input style={styles.input} placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          <input style={styles.input} placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <input style={styles.input} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input style={styles.input} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input style={styles.input} placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <button type="submit" style={styles.saveFormBtn}>{editingId ? "Update" : "Add"}</button>
        </form>
      )}

      <input
        style={{ ...styles.input, marginBottom: "20px", width: "100%" }}
        placeholder="Search by name, department, or designation..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={styles.grid}>
        {filtered.map((p) => (
          <div key={p.id} style={styles.card}>
            <div style={styles.avatar}>{p.name.charAt(0).toUpperCase()}</div>
            <h3 style={styles.name}>{p.name}</h3>
            <p style={styles.designation}>{p.designation}</p>
            <p style={styles.department}>{p.department}</p>
            <div style={styles.details}>
              <div className="mono" style={styles.detailLine}>{p.email}</div>
              <div className="mono" style={styles.detailLine}>{p.phone}</div>
              <div style={styles.detailLine}>{p.location}</div>
            </div>
            <div style={styles.cardActions}>
              <button style={styles.editBtn} onClick={() => handleEdit(p)}>Edit</button>
              {confirmDeleteId === p.id ? (
                <>
                  <button style={styles.confirmBtn} onClick={() => handleDelete(p.id)}>Confirm</button>
                  <button style={styles.cancelBtn} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                </>
              ) : (
                <button style={styles.deleteBtn} onClick={() => setConfirmDeleteId(p.id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "28px", maxWidth: "1100px", margin: "0 auto" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  heading: { margin: 0 },
  addToggleBtn: {
    background: "#6b1e35", border: "none", borderRadius: "6px",
    padding: "8px 16px", color: "#faf8f5", fontWeight: "600", fontSize: "13px",
  },
  form: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px",
    marginBottom: "20px", background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e4ddd3",
  },
  input: {
    background: "#faf8f5", border: "1px solid #e4ddd3",
    borderRadius: "6px", padding: "10px 12px", color: "#2b2620", fontSize: "14px", outline: "none",
  },
  saveFormBtn: {
    background: "#2e7d4f", border: "none", borderRadius: "6px",
    padding: "10px 18px", color: "#faf8f5", fontWeight: "600", gridColumn: "span 1",
  },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px",
  },
  card: {
    background: "#ffffff", border: "1px solid #e4ddd3", borderRadius: "10px", padding: "20px", textAlign: "center",
  },
  avatar: {
    width: "56px", height: "56px", borderRadius: "50%", background: "#6b1e35", color: "#faf8f5",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700",
    margin: "0 auto 12px auto",
  },
  name: { margin: "0 0 4px 0", fontSize: "16px" },
  designation: { margin: "0 0 2px 0", color: "#6b1e35", fontSize: "13px" },
  department: { margin: "0 0 12px 0", color: "#6e655c", fontSize: "13px" },
  details: { textAlign: "left", fontSize: "12px", color: "#6e655c", marginBottom: "14px" },
  detailLine: { marginBottom: "3px" },
  cardActions: { display: "flex", gap: "6px", justifyContent: "center" },
  editBtn: {
    background: "transparent", border: "1px solid #6b1e35", color: "#6b1e35",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
  },
  deleteBtn: {
    background: "transparent", border: "1px solid #b3261e", color: "#b3261e",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
  },
  confirmBtn: {
    background: "#b3261e", border: "none", color: "#fff",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
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