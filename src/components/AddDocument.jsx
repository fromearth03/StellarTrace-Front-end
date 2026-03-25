import { useState } from "react";
import { apiFetch } from "../config/api";

export default function AddDocument({ onClose }) {
  const [darkMode, setDarkMode] = useState(false);
  const [authors, setAuthors] = useState([{ first: "", last: "" }]);
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    submitter: "",
    categories: "",
    "journal-ref": "",
    doi: "",
    "report-no": "",
    license: "",
    update_date: "",
    comments: ""
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const updateAuthor = (index, field, value) => {
    setAuthors((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  const addAuthor = () => {
    setAuthors([...authors, { first: "", last: "" }]);
  };

  const removeAuthor = (i) => {
    if (authors.length === 1) return;
    setAuthors(authors.filter((_, idx) => idx !== i));
  };

  const handleAddDocument = async () => {
    const title = formData.title.trim();
    const abstract = formData.abstract.trim();

    if (!title || !abstract) {
      alert("Title and Abstract are required.");
      return;
    }

    const validAuthors = authors.filter(
      (a) => a.first.trim() || a.last.trim()
    );

    if (validAuthors.length === 0) {
      alert("At least one author is required.");
      return;
    }

    const authors_parsed = validAuthors.map((a) => [
      a.last.trim(),
      a.first.trim(),
      ""
    ]);

    const authorsString = validAuthors
      .map((a) => {
        const first = a.first.trim();
        const last = a.last.trim();
        return first && last ? `${first} ${last}` : first || last;
      })
      .join(", ");

    const payload = {
      title,
      abstract,
      authors: authorsString,
      authors_parsed,
      submitter: formData.submitter.trim() || null,
      categories: formData.categories.trim() || "",
      "journal-ref": formData["journal-ref"].trim() || null,
      doi: formData.doi.trim() || null,
      "report-no": formData["report-no"].trim() || null,
      license: formData.license.trim() || "",
      update_date: formData.update_date || "",
      comments: formData.comments.trim() || null
    };

    try {
      const res = await apiFetch("/adddoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();

      alert("Document added successfully.");
    } catch {
      alert("Failed to add document.");
    }
  };

  // Theme colors
  const t = darkMode
    ? {
      pageBg: "#0f172a",
      cardBg: "#1e293b",
      cardShadow: "0 2px 10px rgba(0,0,0,0.4)",
      heading: "#e2e8f0",
      subheading: "#cbd5e1",
      label: "#ffffff",
      inputBg: "#0f172a",
      inputBorder: "#334155",
      inputText: "#ffffff",
      required: "#f87171",
      toggleBg: "#334155",
      toggleBorder: "#475569"
    }
    : {
      pageBg: "#f5f6f8",
      cardBg: "white",
      cardShadow: "0 2px 10px rgba(0,0,0,0.08)",
      heading: "#1e293b",
      subheading: "#333",
      label: "#333",
      inputBg: "#fff",
      inputBorder: "#ccc",
      inputText: "#000",
      required: "red",
      toggleBg: "#e2e8f0",
      toggleBorder: "#94a3b8"
    };

  return (
    <div style={{ background: t.pageBg, height: "100vh", overflow: "auto", padding: "40px", transition: "background 0.3s", fontFamily: "'Inter', sans-serif" }}>

      {/* Dark/Light Mode Toggle - Top Right */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: `2px solid ${t.toggleBorder}`,
          background: t.toggleBg,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          transition: "all 0.3s",
          boxShadow: darkMode ? "0 0 12px rgba(250,204,21,0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
          zIndex: 100
        }}
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      {/* Page Heading */}
      <h1 style={{ textAlign: "center", color: t.heading, fontSize: "28px", fontWeight: "700", marginBottom: "30px", transition: "color 0.3s", letterSpacing: "0.1em" }}>
        Add Document
      </h1>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: t.cardBg,
          borderRadius: "8px",
          boxShadow: t.cardShadow,
          padding: "30px",
          marginBottom: "40px",
          transition: "background 0.3s, box-shadow 0.3s"
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "25px", color: t.subheading, transition: "color 0.3s" }}>
          Document Details
        </h2>

        {/* TITLE */}
        <label style={{ color: t.label }}>Title <span style={{ color: t.required }}>*</span></label>
        <input className="adddoc-input" value={formData.title} onChange={handleChange("title")} />

        {/* ABSTRACT */}
        <label style={{ marginTop: "20px", color: t.label }}>
          Abstract <span style={{ color: t.required }}>*</span>
        </label>
        <textarea rows={5} className="adddoc-input" value={formData.abstract} onChange={handleChange("abstract")} />

        {/* AUTHORS */}
        <div style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label style={{ color: t.label }}>
              Authors <span style={{ color: t.required }}>*</span>
            </label>
            <button type="button" onClick={addAuthor} className="link">
              + Add Author
            </button>
          </div>

          {authors.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <input
                placeholder="First Name"
                className="adddoc-input"
                value={a.first}
                onChange={(e) => updateAuthor(i, "first", e.target.value)}
              />
              <input
                placeholder="Last Name"
                className="adddoc-input"
                value={a.last}
                onChange={(e) => updateAuthor(i, "last", e.target.value)}
              />
              {authors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAuthor(i)}
                  className="remove"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* SUBMITTER */}
        <label style={{ marginTop: "20px", color: t.label }}>Submitter</label>
        <input className="adddoc-input" value={formData.submitter} onChange={handleChange("submitter")} />

        {/* CATEGORIES */}
        <label style={{ marginTop: "20px", color: t.label }}>Categories</label>
        <input placeholder="e.g. cs.AI, cs.IR" className="adddoc-input" value={formData.categories} onChange={handleChange("categories")} />

        {/* JOURNAL REFERENCE */}
        <label style={{ marginTop: "20px", color: t.label }}>
          Journal Reference
        </label>
        <input className="adddoc-input" value={formData["journal-ref"]} onChange={handleChange("journal-ref")} />

        {/* DOI */}
        <label style={{ marginTop: "20px", color: t.label }}>
          DOI
        </label>
        <input className="adddoc-input" value={formData.doi} onChange={handleChange("doi")} />

        {/* REPORT NUMBER */}
        <label style={{ marginTop: "20px", color: t.label }}>Report Number</label>
        <input className="adddoc-input" value={formData["report-no"]} onChange={handleChange("report-no")} />

        {/* LICENSE */}
        <label style={{ marginTop: "20px", color: t.label }}>License</label>
        <input className="adddoc-input" value={formData.license} onChange={handleChange("license")} />

        {/* UPDATE DATE */}
        <label style={{ marginTop: "20px", color: t.label }}>Update Date</label>
        <input type="date" className="adddoc-input" value={formData.update_date} onChange={handleChange("update_date")} />

        {/* COMMENTS */}
        <label style={{ marginTop: "20px", color: t.label }}>Comments</label>
        <textarea rows={3} className="adddoc-input" value={formData.comments} onChange={handleChange("comments")} />

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "30px"
          }}
        >
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleAddDocument}>
            Add Document
          </button>
        </div>
      </div>

      {/* INLINE STYLES */}
      <style>{`
        label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          transition: color 0.3s;
        }
        .adddoc-input {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid ${t.inputBorder};
          border-radius: 4px;
          color: ${t.inputText};
          background: ${t.inputBg};
          transition: background 0.3s, border-color 0.3s, color 0.3s;
        }
        .adddoc-input::placeholder {
          color: ${darkMode ? '#64748b' : '#9ca3af'};
        }
        .btn-primary {
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .btn-primary:hover {
          background: #1d4ed8;
        }
        .btn-primary:active {
          background: #1e40af;
          transform: scale(0.97);
        }
        .btn-secondary {
          background: ${darkMode ? '#334155' : '#f1f5f9'};
          border: 1px solid ${darkMode ? '#475569' : '#94a3b8'};
          padding: 8px 16px;
          border-radius: 4px;
          color: ${darkMode ? '#cbd5e1' : '#334155'};
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .btn-secondary:hover {
          background: ${darkMode ? '#475569' : '#e2e8f0'};
        }
        .link {
          background: none;
          border: none;
          color: #2563eb;
          cursor: pointer;
        }
        .remove {
          background: none;
          border: none;
          color: ${darkMode ? '#94a3b8' : '#888'};
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
