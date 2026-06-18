"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
interface BrandRecord {
  id: string;
  generic: string;
  brand: string;
  strength: string;
  form: string;
  manufacturer: string;
  status: "active" | "removed";
  source: "dataset" | "admin-add";
  note?: string;
  addedAt?: string;
  removedAt?: string;
}

interface AdminLog {
  id: string;
  action: "add" | "remove" | "restore" | "edit";
  brand: string;
  generic: string;
  manufacturer: string;
  reason: string;
  timestamp: string;
}

// Shape returned by the database/API layer
interface DbOverride {
  id: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  status: string;
  note?: string | null;
  addedAt: string;
  removedAt?: string | null;
}
interface DbLogEntry {
  id: string;
  action: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  reason: string;
  timestamp: string;
}

function fromDb(o: DbOverride): BrandRecord {
  return {
    id: o.id,
    generic: o.genericName,
    brand: o.brandName,
    strength: o.strength,
    form: o.dosageForm,
    manufacturer: o.manufacturer,
    status: o.status === "removed" ? "removed" : "active",
    source: "admin-add",
    note: o.note ?? undefined,
    addedAt: o.addedAt,
    removedAt: o.removedAt ?? undefined,
  };
}
function logFromDb(l: DbLogEntry): AdminLog {
  return {
    id: l.id,
    action: l.action as AdminLog["action"],
    brand: l.brandName,
    generic: l.genericName,
    manufacturer: l.manufacturer,
    reason: l.reason,
    timestamp: l.timestamp,
  };
}

const ADMIN_PASSWORD = "pharmalens2025";

// ── Helpers ──────────────────────────────────────────────────────────────────
function genId() {
  return `adm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const [tab, setTab] = useState<"overrides" | "add" | "log">("overrides");
  const [overrides, setOverrides] = useState<BrandRecord[]>([]);
  const [log, setLog] = useState<AdminLog[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "removed">("all");
  const [filterSource, setFilterSource] = useState<"all" | "dataset" | "admin-add">("all");
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Add form state
  const [form, setForm] = useState({
    generic: "", brand: "", strength: "", dosageForm: "", manufacturer: "", note: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Remove modal state
  const [removeTarget, setRemoveTarget] = useState<BrandRecord | null>(null);
  const [removeReason, setRemoveReason] = useState("");

  // Edit modal
  const [editTarget, setEditTarget] = useState<BrandRecord | null>(null);
  const [editForm, setEditForm] = useState({ generic: "", brand: "", strength: "", dosageForm: "", manufacturer: "", note: "" });

  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, logRes] = await Promise.all([
        fetch("/api/admin/overrides"),
        fetch("/api/admin/log"),
      ]);
      const ovData = await ovRes.json();
      const logData = await logRes.json();
      setOverrides((ovData.overrides ?? []).map(fromDb));
      setLog((logData.log ?? []).map(logFromDb));
      setDbConnected(ovData.dbConnected !== false);
    } catch {
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load from shared database on login — every admin sees the same data
  // regardless of browser, device, or which Google account they used.
  useEffect(() => {
    if (!authed) return;
    refreshAll();
  }, [authed, refreshAll]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  function login() {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    }
  }

  // ── Add Brand ──────────────────────────────────────────────────────────────
  function validateForm() {
    const errs: Record<string, string> = {};
    if (!form.generic.trim()) errs.generic = "Required";
    if (!form.brand.trim()) errs.brand = "Required";
    if (!form.strength.trim()) errs.strength = "Required";
    if (!form.dosageForm.trim()) errs.dosageForm = "Required";
    if (!form.manufacturer.trim()) errs.manufacturer = "Required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function addBrand() {
    if (!validateForm()) return;
    try {
      const res = await fetch("/api/admin/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genericName: form.generic.trim(),
          brandName: form.brand.trim(),
          strength: form.strength.trim(),
          dosageForm: form.dosageForm.trim(),
          manufacturer: form.manufacturer.trim(),
          note: form.note.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(`✗ Failed to add: ${err.error ?? "unknown error"}`);
        return;
      }
      await refreshAll();
      setForm({ generic: "", brand: "", strength: "", dosageForm: "", manufacturer: "", note: "" });
      setFormErrors({});
      showToast(`✓ "${form.brand}" added — visible to all admins now`);
      setTab("overrides");
    } catch {
      showToast("✗ Network error — could not add brand");
    }
  }

  // ── Remove Brand ───────────────────────────────────────────────────────────
  async function confirmRemove() {
    if (!removeTarget) return;
    try {
      const res = await fetch("/api/admin/overrides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: removeTarget.id, action: "remove", reason: removeReason || "No reason given" }),
      });
      if (!res.ok) {
        showToast("✗ Failed to remove brand");
        return;
      }
      await refreshAll();
      setRemoveTarget(null);
      setRemoveReason("");
      showToast(`✓ "${removeTarget.brand}" marked as removed`);
    } catch {
      showToast("✗ Network error");
    }
  }

  async function restoreBrand(id: string) {
    const target = overrides.find(r => r.id === id);
    if (!target) return;
    try {
      const res = await fetch("/api/admin/overrides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "restore" }),
      });
      if (!res.ok) {
        showToast("✗ Failed to restore brand");
        return;
      }
      await refreshAll();
      showToast(`✓ "${target.brand}" restored`);
    } catch {
      showToast("✗ Network error");
    }
  }

  async function permanentDelete(id: string) {
    const target = overrides.find(r => r.id === id);
    if (!target) return;
    try {
      const res = await fetch(`/api/admin/overrides?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("✗ Failed to delete brand");
        return;
      }
      await refreshAll();
      setConfirmDelete(null);
      showToast(`✓ "${target.brand}" permanently deleted`);
    } catch {
      showToast("✗ Network error");
    }
  }

  // ── Edit Brand ─────────────────────────────────────────────────────────────
  function startEdit(r: BrandRecord) {
    setEditTarget(r);
    setEditForm({ generic: r.generic, brand: r.brand, strength: r.strength, dosageForm: r.form, manufacturer: r.manufacturer, note: r.note || "" });
  }

  async function saveEdit() {
    if (!editTarget) return;
    try {
      const res = await fetch("/api/admin/overrides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editTarget.id,
          action: "edit",
          fields: {
            genericName: editForm.generic,
            brandName: editForm.brand,
            strength: editForm.strength,
            dosageForm: editForm.dosageForm,
            manufacturer: editForm.manufacturer,
            note: editForm.note || null,
          },
        }),
      });
      if (!res.ok) {
        showToast("✗ Failed to update brand");
        return;
      }
      await refreshAll();
      setEditTarget(null);
      showToast(`✓ "${editForm.brand}" updated`);
    } catch {
      showToast("✗ Network error");
    }
  }

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = overrides.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.brand.toLowerCase().includes(q) || r.generic.toLowerCase().includes(q) || r.manufacturer.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchSource = filterSource === "all" || r.source === filterSource;
    return matchSearch && matchStatus && matchSource;
  });

  // ── CSS helpers ────────────────────────────────────────────────────────────
  const css = {
    card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px" },
    input: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none" },
    inputError: { border: "1px solid #f87171" },
    btn: (variant: "cyan" | "red" | "ghost" | "green") => ({
      padding: variant === "ghost" ? "6px 12px" : "10px 18px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      border: "none",
      ...(variant === "cyan" ? { background: "#22d3ee", color: "#0b0f1a" } :
        variant === "red" ? { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" } :
        variant === "green" ? { background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" } :
        { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }),
    }),
    label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#64748b", textTransform: "uppercase" as const, marginBottom: 6, display: "block" },
    badge: (s: "active" | "removed") => ({
      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
      ...(s === "active" ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" } : { background: "rgba(239,68,68,0.12)", color: "#f87171" })
    }),
    sourceBadge: (s: "dataset" | "admin-add") => ({
      fontSize: 11, padding: "3px 8px", borderRadius: 6,
      ...(s === "admin-add" ? { background: "rgba(168,85,247,0.15)", color: "#c084fc" } : { background: "rgba(255,255,255,0.06)", color: "#64748b" })
    }),
    overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
    modal: { background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 480 },
  };

  // ── Login Screen ───────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#070c14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ ...css.card, width: 360, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>Admin Access</div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>PharmaLens Data Management</div>
          <input
            type="password"
            placeholder="Enter admin password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            style={{ ...css.input, textAlign: "center", marginBottom: 12, ...(pwError ? { border: "1px solid #f87171", animation: "shake 0.3s" } : {}) }}
            autoFocus
          />
          {pwError && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 10 }}>Incorrect password</div>}
          <button onClick={login} style={{ ...css.btn("cyan"), width: "100%", padding: "12px" }}>
            Sign In
          </button>
        </div>
        <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>
      </div>
    );
  }

  // ── Admin Panel ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#070c14", fontFamily: "system-ui, sans-serif", color: "#e2e8f0" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ color: "#22d3ee", textDecoration: "none", fontSize: 13 }}>← Back to PharmaLens</a>
          <span style={{ color: "#334155" }}>|</span>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Admin Panel</span>
          <span style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>RESTRICTED</span>
        </div>
        <div style={{ fontSize: 13, color: "#64748b" }}>
          {overrides.filter(r => r.status === "active").length} active overrides · {overrides.filter(r => r.status === "removed").length} removed
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* Info banner */}
        {dbConnected ? (
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#4ade80" }}>
            ✓ Connected to the shared database. Additions, edits, and removals made here are visible to <strong>every admin and every visitor</strong>, on any browser or device — no more per-browser data drift.
          </div>
        ) : (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#f87171" }}>
            ⚠️ Could not reach the database (<code>DATABASE_URL</code> may not be set in this environment). Changes made now cannot be saved centrally. Set up your database connection in Vercel environment variables to enable shared admin overrides.
          </div>
        )}
        {loading && (
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Loading…</div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 12, width: "fit-content" }}>
          {(["overrides", "add", "log"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === t ? "#22d3ee" : "transparent", color: tab === t ? "#0b0f1a" : "#64748b", transition: "all 0.15s" }}>
              {t === "overrides" ? `Overrides (${overrides.length})` : t === "add" ? "+ Add Brand" : `Audit Log (${log.length})`}
            </button>
          ))}
        </div>

        {/* ── OVERRIDES TAB ───────────────────────────────────────── */}
        {tab === "overrides" && (
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <input placeholder="Search brand, generic, manufacturer…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...css.input, maxWidth: 320 }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                style={{ ...css.input, maxWidth: 140 }}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="removed">Removed</option>
              </select>
              <select value={filterSource} onChange={e => setFilterSource(e.target.value as any)}
                style={{ ...css.input, maxWidth: 160 }}>
                <option value="all">All Sources</option>
                <option value="dataset">Dataset</option>
                <option value="admin-add">Admin Added</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <div style={{ fontSize: 16, marginBottom: 4 }}>No overrides yet</div>
                <div style={{ fontSize: 13 }}>Use "Add Brand" to add new entries, or flag existing dataset entries here.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map(r => (
                  <div key={r.id} style={{ ...css.card, display: "flex", alignItems: "center", gap: 16, opacity: r.status === "removed" ? 0.6 : 1 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: r.status === "removed" ? "#94a3b8" : "#22d3ee", textDecoration: r.status === "removed" ? "line-through" : "none" }}>{r.brand}</span>
                        <span style={css.badge(r.status)}>{r.status}</span>
                        <span style={css.sourceBadge(r.source)}>{r.source === "admin-add" ? "Admin Added" : "Dataset"}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#94a3b8" }}>
                        {r.generic} · <strong style={{ color: "#e2e8f0" }}>{r.strength}</strong> · {r.form} · <em>{r.manufacturer}</em>
                      </div>
                      {r.note && <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Note: {r.note}</div>}
                      {r.addedAt && <div style={{ fontSize: 11, color: "#334155", marginTop: 2 }}>Added: {new Date(r.addedAt).toLocaleDateString()}</div>}
                      {r.removedAt && <div style={{ fontSize: 11, color: "#7f1d1d", marginTop: 2 }}>Removed: {new Date(r.removedAt).toLocaleDateString()}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      {r.status === "active" && (
                        <>
                          <button onClick={() => startEdit(r)} style={css.btn("ghost")}>Edit</button>
                          <button onClick={() => setRemoveTarget(r)} style={css.btn("red")}>Remove</button>
                        </>
                      )}
                      {r.status === "removed" && (
                        <>
                          <button onClick={() => restoreBrand(r.id)} style={css.btn("green")}>Restore</button>
                          <button onClick={() => setConfirmDelete(r.id)} style={css.btn("red")}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADD BRAND TAB ────────────────────────────────────────── */}
        {tab === "add" && (
          <div style={{ maxWidth: 560 }}>
            <div style={{ ...css.card }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#e2e8f0" }}>Add New Brand Entry</div>
              <div style={{ display: "grid", gap: 14 }}>
                {[
                  { key: "generic", label: "Generic Name", placeholder: "e.g. Diclofenac Sodium" },
                  { key: "brand", label: "Brand Name", placeholder: "e.g. Voltral" },
                  { key: "strength", label: "Strength", placeholder: "e.g. 50 mg" },
                  { key: "dosageForm", label: "Dosage Form", placeholder: "e.g. Tablet, Capsule, Syrup…" },
                  { key: "manufacturer", label: "Manufacturer", placeholder: "e.g. Novartis" },
                  { key: "note", label: "Admin Note (optional)", placeholder: "Reason for adding, source…" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={css.label}>{label}</label>
                    <input
                      placeholder={placeholder}
                      value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ ...css.input, ...((formErrors as any)[key] ? css.inputError : {}) }}
                    />
                    {(formErrors as any)[key] && <div style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{(formErrors as any)[key]}</div>}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={addBrand} style={{ ...css.btn("cyan"), flex: 1 }}>Add Brand</button>
                <button onClick={() => { setForm({ generic: "", brand: "", strength: "", dosageForm: "", manufacturer: "", note: "" }); setFormErrors({}); }} style={css.btn("ghost")}>Clear</button>
              </div>
            </div>

            {/* Quick corrections section */}
            <div style={{ ...css.card, marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 12 }}>⚡ Quick Fixes Applied This Session</div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>
                <div>✓ <strong style={{ color: "#4ade80" }}>Voltaren</strong> removed — not marketed in Pakistan (correct brand is Voltral)</div>
                <div>✓ <strong style={{ color: "#4ade80" }}>Dicloran</strong> moved from Martin Dow → Sami Pharmaceuticals</div>
                <div>✓ <strong style={{ color: "#4ade80" }}>Voltral</strong> added under Novartis (correct Pakistan brand)</div>
                <div>✓ Martin Dow Marker brands added from <a href="https://martindowmarker.com" target="_blank" rel="noreferrer" style={{ color: "#22d3ee" }}>martindowmarker.com</a></div>
              </div>
            </div>
          </div>
        )}

        {/* ── AUDIT LOG TAB ─────────────────────────────────────────── */}
        {tab === "log" && (
          <div>
            {log.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
                <div style={{ fontSize: 15 }}>No actions logged yet</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {log.map(entry => (
                  <div key={entry.id} style={{ ...css.card, display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ fontSize: 18, flexShrink: 0 }}>
                      {entry.action === "add" ? "➕" : entry.action === "remove" ? "🚫" : entry.action === "restore" ? "✅" : "✏️"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        <span style={{ color: entry.action === "add" ? "#4ade80" : entry.action === "remove" ? "#f87171" : entry.action === "restore" ? "#34d399" : "#22d3ee" }}>
                          {entry.action.toUpperCase()}
                        </span>
                        {" "}{entry.brand}
                      </div>
                      <div style={{ fontSize: 13, color: "#94a3b8" }}>{entry.generic} · {entry.manufacturer}</div>
                      {entry.reason !== "—" && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Reason: {entry.reason}</div>}
                    </div>
                    <div style={{ fontSize: 11, color: "#334155", whiteSpace: "nowrap" }}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
                <button onClick={async () => {
                  if (!confirm("Clear all log entries?")) return;
                  try {
                    await fetch("/api/admin/log", { method: "DELETE" });
                    await refreshAll();
                    showToast("✓ Log cleared");
                  } catch {
                    showToast("✗ Failed to clear log");
                  }
                }} style={{ ...css.btn("ghost"), marginTop: 8, alignSelf: "flex-start" }}>
                  Clear Log
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Remove Modal ───────────────────────────────────────────── */}
      {removeTarget && (
        <div style={css.overlay} onClick={() => setRemoveTarget(null)}>
          <div style={css.modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Remove Brand</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
              Mark <strong style={{ color: "#f87171" }}>{removeTarget.brand}</strong> ({removeTarget.generic}, {removeTarget.manufacturer}) as removed?
            </div>
            <label style={css.label}>Reason</label>
            <input placeholder="e.g. Wrong manufacturer, not marketed in Pakistan…" value={removeReason} onChange={e => setRemoveReason(e.target.value)}
              style={{ ...css.input, marginBottom: 20 }} autoFocus />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={confirmRemove} style={{ ...css.btn("red"), flex: 1 }}>Confirm Remove</button>
              <button onClick={() => { setRemoveTarget(null); setRemoveReason(""); }} style={css.btn("ghost")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────────── */}
      {editTarget && (
        <div style={css.overlay} onClick={() => setEditTarget(null)}>
          <div style={{ ...css.modal, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Edit Brand</div>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { key: "generic", label: "Generic Name" },
                { key: "brand", label: "Brand Name" },
                { key: "strength", label: "Strength" },
                { key: "dosageForm", label: "Dosage Form" },
                { key: "manufacturer", label: "Manufacturer" },
                { key: "note", label: "Admin Note" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={css.label}>{label}</label>
                  <input value={(editForm as any)[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} style={css.input} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={saveEdit} style={{ ...css.btn("cyan"), flex: 1 }}>Save Changes</button>
              <button onClick={() => setEditTarget(null)} style={css.btn("ghost")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ───────────────────────────────────── */}
      {confirmDelete && (
        <div style={css.overlay} onClick={() => setConfirmDelete(null)}>
          <div style={css.modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#f87171" }}>Permanent Delete</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>
              This will permanently delete this override entry. This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => permanentDelete(confirmDelete)} style={{ ...css.btn("red"), flex: 1 }}>Delete Permanently</button>
              <button onClick={() => setConfirmDelete(null)} style={css.btn("ghost")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ──────────────────────────────────────────────────── */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#0f172a", border: "1px solid rgba(34,211,238,0.3)", borderRadius: 12, padding: "12px 20px", color: "#22d3ee", fontSize: 14, fontWeight: 600, zIndex: 100, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
