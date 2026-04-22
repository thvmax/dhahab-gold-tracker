"use client";

import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generatePriceHistory = (days, basePrice = 577.75) => {
  const data = [];
  let price = basePrice;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    price += (Math.random() - 0.49) * 4.5;
    price = Math.max(520, Math.min(640, price));
    data.push({ date: new Date(now - i * 86400000), price: parseFloat(price.toFixed(2)) });
  }
  data[data.length - 1].price = 577.75;
  return data;
};
const TIMEFRAMES  = [{ label: "1D", days: 1 }, { label: "1W", days: 7 }, { label: "1M", days: 30 }, { label: "1Y", days: 365 }];
const fmtAED      = (n) => `AED ${Math.round(n).toLocaleString("en-AE")}`;
const fmtG        = (n) => `${parseFloat(n).toFixed(2)}g`;
const fmtDate     = (d) => new Date(d).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" });
const LIVE_PRICE  = 577.75;

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(212,175,55,0.2)",
  borderRadius: 10, color: "#e8dcc0",
  padding: "13px 14px", fontSize: 14,
  outline: "none", width: "100%",
  boxSizing: "border-box", colorScheme: "dark",
  fontFamily: "inherit",
};

// ─── Auth Screen ──────────────────────────────────────────────────────────────
const AuthScreen = ({ onAuth }) => {
  const [mode, setMode]       = useState("login"); // "login" | "signup"
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else {
        setSuccess("Account created! You can now log in.");
        setMode("login");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onAuth(data.user);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0b07", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        button:active { transform: scale(0.97); }
      `}</style>

      {/* Background glow */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(212,175,55,0.09) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 400, animation: "fadeUp 0.4s ease both", position: "relative" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#D4AF37,#7a5e18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 14px", boxShadow: "0 0 30px rgba(212,175,55,0.25)" }}>⬡</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#e8dcc0", letterSpacing: "-0.5px" }}>DHAHAB</div>
          <div style={{ color: "#4a3f28", fontSize: 10, letterSpacing: "2.5px", marginTop: 3 }}>UAE 24K GOLD TRACKER</div>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 22, padding: "32px 28px" }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
                flex: 1, padding: "9px 0", border: "none", borderRadius: 9, cursor: "pointer",
                fontWeight: 700, fontSize: 13, transition: "all 0.2s",
                background: mode === m ? "rgba(212,175,55,0.15)" : "transparent",
                color: mode === m ? "#D4AF37" : "#5a5040",
              }}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <p style={{ color: "#6a5a30", fontSize: 10, letterSpacing: "1px", marginBottom: 7 }}>EMAIL</p>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={inputStyle}
              />
            </div>
            <div>
              <p style={{ color: "#6a5a30", fontSize: 10, letterSpacing: "1px", marginBottom: 7 }}>PASSWORD</p>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Error / Success */}
          {error   && <p style={{ color: "#f87171", fontSize: 12, marginTop: 12, lineHeight: 1.5 }}>{error}</p>}
          {success && <p style={{ color: "#4ade80", fontSize: 12, marginTop: 12, lineHeight: 1.5 }}>{success}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              marginTop: 20, width: "100%", padding: 15,
              background: loading ? "rgba(212,175,55,0.3)" : "linear-gradient(135deg,#D4AF37,#b8941f)",
              border: "none", borderRadius: 12, color: "#0d0b07",
              fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </button>

          {/* Divider note */}
          <p style={{ color: "#3a3020", fontSize: 11, textAlign: "center", marginTop: 20, lineHeight: 1.7 }}>
            Your data is private and encrypted.<br />Only you can see your gold logs.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const GoldTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(16,14,8,0.97)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 10, padding: "10px 16px" }}>
      <p style={{ color: "#8a7a50", fontSize: 11, marginBottom: 3 }}>
        {payload[0]?.payload?.date ? fmtDate(payload[0].payload.date) : ""}
      </p>
      <p style={{ color: "#D4AF37", fontSize: 16, fontWeight: 800 }}>
        AED {payload[0]?.value?.toFixed(2)}
        <span style={{ color: "#6a5a30", fontSize: 11, fontWeight: 400 }}>/g · 24K</span>
      </p>
    </div>
  );
};

// ─── Log Modal ────────────────────────────────────────────────────────────────
const LogModal = ({ initial, onSave, onClose, saving }) => {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(
    initial
      ? { date: initial.date, grams: String(initial.grams), purchasePrice: String(initial.purchase_price), fees: String(initial.fees || "") }
      : { date: "", grams: "", purchasePrice: "", fees: "" }
  );
  const [err, setErr] = useState("");

  const costPerGram = form.grams && form.purchasePrice
    ? ((parseFloat(form.purchasePrice) + parseFloat(form.fees || 0)) / parseFloat(form.grams)).toFixed(2)
    : null;

  const handleSave = () => {
    if (!form.date || !form.grams || !form.purchasePrice) { setErr("Date, Grams, and Purchase Price are required."); return; }
    onSave({ date: form.date, grams: parseFloat(form.grams), purchase_price: parseFloat(form.purchasePrice), fees: parseFloat(form.fees) || 0 });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#131009", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "22px 22px 0 0", padding: "28px 22px 44px", width: "100%", maxWidth: 500, animation: "slideUp 0.28s cubic-bezier(0.34,1.4,0.64,1)" }}>
        <style>{`@keyframes slideUp { from { transform:translateY(60px);opacity:0 } to { transform:translateY(0);opacity:1 } }`}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? "Edit Gold Log" : "Add Gold Log"}</p>
            <p style={{ color: "#8a7a50", fontSize: 12, marginTop: 2 }}>24 Karat · UAE Market</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#8a7a50", borderRadius: 8, width: 34, height: 34, cursor: "pointer", fontSize: 20 }}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Purchase Date", key: "date", type: "date", col: "span 2" },
            { label: "Gold Amount (grams)", key: "grams", type: "number", placeholder: "e.g. 10.5" },
            { label: "Purchase Price (AED)", key: "purchasePrice", type: "number", placeholder: "e.g. 6000" },
            { label: "Additional Fees (AED)", key: "fees", type: "number", placeholder: "Optional", col: "span 2" },
          ].map(f => (
            <div key={f.key} style={{ gridColumn: f.col || "span 1" }}>
              <p style={{ color: "#6a5a30", fontSize: 10, letterSpacing: "1px", marginBottom: 7 }}>{f.label.toUpperCase()}</p>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
            </div>
          ))}
        </div>

        {costPerGram && (
          <div style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 12, padding: "13px 16px", marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "#5a5040", fontSize: 10, letterSpacing: "1px" }}>YOUR COST/GRAM</p>
              <p style={{ color: "#D4AF37", fontWeight: 800, fontSize: 16, marginTop: 3 }}>AED {costPerGram}</p>
            </div>
            <div style={{ width: 1, height: 36, background: "rgba(212,175,55,0.1)" }} />
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "#5a5040", fontSize: 10, letterSpacing: "1px" }}>TODAY'S RATE</p>
              <p style={{ color: "#e8dcc0", fontWeight: 800, fontSize: 16, marginTop: 3 }}>AED {LIVE_PRICE}</p>
            </div>
            <div style={{ width: 1, height: 36, background: "rgba(212,175,55,0.1)" }} />
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "#5a5040", fontSize: 10, letterSpacing: "1px" }}>DIFF/GRAM</p>
              {(() => { const d = LIVE_PRICE - parseFloat(costPerGram); const p = d >= 0; return <p style={{ color: p ? "#4ade80" : "#f87171", fontWeight: 800, fontSize: 15, marginTop: 3 }}>{p ? "+" : ""}{d.toFixed(2)}</p>; })()}
            </div>
          </div>
        )}

        {err && <p style={{ color: "#f87171", fontSize: 12, marginTop: 10 }}>{err}</p>}

        <button onClick={handleSave} disabled={saving} style={{ marginTop: 18, width: "100%", padding: 15, background: saving ? "rgba(212,175,55,0.3)" : "linear-gradient(135deg,#D4AF37,#b8941f)", border: "none", borderRadius: 12, color: "#0d0b07", fontWeight: 800, fontSize: 15, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Saving..." : isEdit ? "💾 Save Changes" : "Add Log"}
        </button>
      </div>
    </div>
  );
};

// ─── Log Card ─────────────────────────────────────────────────────────────────
const LogCard = ({ log, currentPrice, onEdit, onDelete, confirmDelete, onCancelDelete }) => {
  const currentValue = log.grams * currentPrice;
  const totalCost    = log.purchase_price + (log.fees || 0);
  const pnl          = currentValue - totalCost;
  const pnlPct       = ((pnl / totalCost) * 100).toFixed(2);
  const pos          = pnl >= 0;

  return (
    <div style={{ background: confirmDelete ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.022)", border: `1px solid ${confirmDelete ? "rgba(239,68,68,0.25)" : "rgba(212,175,55,0.1)"}`, borderRadius: 16, padding: "16px 18px", transition: "all 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ color: "#D4AF37", fontWeight: 800, fontSize: 19 }}>{fmtG(log.grams)}</span>
            <span style={{ background: "rgba(212,175,55,0.1)", color: "#D4AF37", borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700 }}>24K</span>
          </div>
          <p style={{ color: "#6a5a30", fontSize: 12 }}>{fmtDate(log.date)}</p>
          <p style={{ color: "#4a3f28", fontSize: 11, marginTop: 3 }}>Cost {fmtAED(totalCost)} · AED {(totalCost / log.grams).toFixed(2)}/g</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ color: "#6a5a30", fontSize: 11, marginBottom: 3 }}>Now Worth</p>
          <p style={{ color: "#e8dcc0", fontWeight: 800, fontSize: 17 }}>{fmtAED(currentValue)}</p>
          <p style={{ color: pos ? "#4ade80" : "#f87171", fontWeight: 800, fontSize: 13, marginTop: 2 }}>
            {pos ? "▲ +" : "▼ "}{fmtAED(pnl)} <span style={{ fontWeight: 400, fontSize: 11 }}>({pos ? "+" : ""}{pnlPct}%)</span>
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(212,175,55,0.07)" }}>
        <button onClick={onEdit} style={{ flex: 1, padding: "10px 0", background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.13)", borderRadius: 10, color: "#D4AF37", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✎ Edit</button>
        {confirmDelete ? (
          <>
            <button onClick={onDelete} style={{ flex: 1.5, padding: "10px 0", background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 10, color: "#f87171", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>⚠ Confirm Delete</button>
            <button onClick={onCancelDelete} style={{ flex: 0.8, padding: "10px 0", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#6a5a30", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </>
        ) : (
          <button onClick={onDelete} style={{ flex: 1, padding: "10px 0", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.13)", borderRadius: 10, color: "#c87070", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>🗑 Delete</button>
        )}
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = ({ user, onLogout }) => {
  const ALL_HISTORY = useRef(generatePriceHistory(365));
  const [timeframe, setTimeframe]         = useState("1M");
  const [logs, setLogs]                   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [modal, setModal]                 = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gold_logs")
      .select("*")
      .order("date", { ascending: false });
    if (!error) setLogs(data || []);
    setLoading(false);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    if (modal.mode === "add") {
      // user_id is set automatically by Supabase RLS policy
      const { error } = await supabase.from("gold_logs").insert([{ ...formData, user_id: user.id }]);
      if (!error) await fetchLogs();
    } else {
      const { error } = await supabase.from("gold_logs").update(formData).eq("id", modal.log.id);
      if (!error) await fetchLogs();
    }
    setSaving(false);
    setModal(null);
  };

  const handleDeleteClick = async (id) => {
    if (deleteConfirm === id) {
      await supabase.from("gold_logs").delete().eq("id", id);
      setLogs(p => p.filter(l => l.id !== id));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const tf         = TIMEFRAMES.find(t => t.label === timeframe);
  const chartData  = ALL_HISTORY.current.slice(-(tf.days + 1));
  const chartAvg   = chartData.length ? (chartData.reduce((s, d) => s + d.price, 0) / chartData.length).toFixed(2) : null;
  const totalGrams = logs.reduce((s, l) => s + parseFloat(l.grams), 0);
  const totalCost  = logs.reduce((s, l) => s + parseFloat(l.purchase_price) + parseFloat(l.fees || 0), 0);
  const totalValue = totalGrams * LIVE_PRICE;
  const totalPnL   = totalValue - totalCost;
  const pnlPos     = totalPnL >= 0;
  const tick       = { fill: "#4a3f28", fontSize: 10 };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0b07", color: "#e8dcc0", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", paddingBottom: 100 }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.3) sepia(1) saturate(1.5) hue-rotate(10deg); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin   { to { transform: rotate(360deg) } }
        .au { animation: fadeUp 0.4s ease both; }
        button { transition: transform 0.1s; }
        button:active { transform: scale(0.96); }
      `}</style>

      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 70% 28% at 50% 0%, rgba(212,175,55,0.09) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(13,11,7,0.93)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(212,175,55,0.07)", padding: "13px 20px" }}>
        <div style={{ maxWidth: 500, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#D4AF37,#7a5e18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, boxShadow: "0 0 20px rgba(212,175,55,0.2)" }}>⬡</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px" }}>DHAHAB</div>
              <div style={{ color: "#4a3f28", fontSize: 9, letterSpacing: "2px" }}>UAE 24K GOLD TRACKER</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#D4AF37", fontWeight: 800, fontSize: 18 }}>AED {LIVE_PRICE}</div>
              <div style={{ color: "#4a3f28", fontSize: 9, letterSpacing: "1px" }}>{user.email.split("@")[0]}</div>
            </div>
            <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6a5a30", borderRadius: 10, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              Log out
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 500, margin: "0 auto", padding: "0 16px" }}>

        {/* Hero */}
        <div className="au" style={{ marginTop: 24, padding: "24px 22px", background: "linear-gradient(145deg,rgba(212,175,55,0.08),rgba(212,175,55,0.02))", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 22, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.05)", pointerEvents: "none" }} />
          <p style={{ color: "#6a5a30", fontSize: 10, letterSpacing: "2px" }}>TOTAL PORTFOLIO · 24K GOLD</p>
          <p style={{ fontSize: 38, fontWeight: 800, color: "#e8dcc0", letterSpacing: "-1.5px", margin: "7px 0 3px" }}>{fmtAED(totalValue)}</p>
          <p style={{ color: pnlPos ? "#4ade80" : "#f87171", fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
            {pnlPos ? "▲ +" : "▼ "}{fmtAED(totalPnL)}
            <span style={{ fontWeight: 400, fontSize: 12, color: pnlPos ? "#3a9060" : "#b05050" }}>
              {" "}unrealised {pnlPos ? "gain" : "loss"} · {pnlPos ? "+" : ""}{totalCost > 0 ? ((totalPnL / totalCost) * 100).toFixed(1) : "0"}%
            </span>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
            {[
              { label: "TOTAL GOLD", value: fmtG(totalGrams), color: "#D4AF37" },
              { label: "TOTAL COST", value: fmtAED(totalCost), color: "#e8dcc0" },
              { label: "PURCHASES",  value: `${logs.length} log${logs.length !== 1 ? "s" : ""}`, color: "#8a7a50" },
            ].map((item, i) => (
              <div key={i} style={{ paddingLeft: i > 0 ? 14 : 0, borderLeft: i > 0 ? "1px solid rgba(212,175,55,0.08)" : "none", marginLeft: i > 0 ? 14 : 0 }}>
                <p style={{ color: "#3a3020", fontSize: 9, letterSpacing: "1.2px", marginBottom: 5 }}>{item.label}</p>
                <p style={{ color: item.color, fontWeight: 800, fontSize: 14 }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="au" style={{ marginTop: 14, background: "rgba(255,255,255,0.018)", border: "1px solid rgba(212,175,55,0.07)", borderRadius: 20, padding: "20px 4px 12px", animationDelay: "0.08s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px", marginBottom: 14 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>24K Gold — Dubai Retail</p>
              <p style={{ color: "#4a3f28", fontSize: 11, marginTop: 1 }}>AED per gram</p>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {TIMEFRAMES.map(t => (
                <button key={t.label} onClick={() => setTimeframe(t.label)} style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, transition: "all 0.15s", background: timeframe === t.label ? "#D4AF37" : "rgba(212,175,55,0.07)", color: timeframe === t.label ? "#0d0b07" : "#6a5a30" }}>{t.label}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={195}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="gline" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6a4e10" /><stop offset="100%" stopColor="#D4AF37" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(212,175,55,0.04)" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={tick} tickFormatter={d => new Date(d).toLocaleDateString("en-AE", { day: "numeric", month: "short" })} interval="preserveStartEnd" />
              <YAxis tickLine={false} axisLine={false} tick={tick} domain={["auto", "auto"]} />
              <Tooltip content={<GoldTooltip />} />
              {chartAvg && <ReferenceLine y={parseFloat(chartAvg)} stroke="rgba(212,175,55,0.18)" strokeDasharray="4 4" label={{ value: `avg ${chartAvg}`, fill: "#4a3f28", fontSize: 9, position: "insideTopRight" }} />}
              <Line type="monotone" dataKey="price" stroke="url(#gline)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#D4AF37", stroke: "#0d0b07", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Logs */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15 }}>My Gold Logs</p>
              <p style={{ color: "#4a3f28", fontSize: 11, marginTop: 2 }}>
                {loading ? "Loading..." : `${logs.length} purchase${logs.length !== 1 ? "s" : ""} · private to you`}
              </p>
            </div>
            <button onClick={() => { setDeleteConfirm(null); setModal({ mode: "add" }); }} style={{ background: "linear-gradient(135deg,#D4AF37,#b8941f)", border: "none", color: "#0d0b07", padding: "10px 20px", borderRadius: 20, cursor: "pointer", fontWeight: 800, fontSize: 13 }}>
              + Add Log
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#4a3f28" }}>
              <div style={{ width: 26, height: 26, border: "2px solid rgba(212,175,55,0.2)", borderTopColor: "#D4AF37", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
              <p style={{ fontSize: 13 }}>Loading your logs...</p>
            </div>
          )}

          {!loading && logs.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#3a3020", border: "1px dashed rgba(212,175,55,0.09)", borderRadius: 18 }}>
              <p style={{ fontSize: 38, marginBottom: 12 }}>⬡</p>
              <p>No logs yet.</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Tap <strong style={{ color: "#D4AF37" }}>+ Add Log</strong> to record your first purchase.</p>
            </div>
          )}

          {!loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {logs.map((log, i) => (
                <div key={log.id} className="au" style={{ animationDelay: `${0.04 * i}s` }}>
                  <LogCard
                    log={log} currentPrice={LIVE_PRICE}
                    onEdit={() => { setDeleteConfirm(null); setModal({ mode: "edit", log }); }}
                    onDelete={() => handleDeleteClick(log.id)}
                    onCancelDelete={() => setDeleteConfirm(null)}
                    confirmDelete={deleteConfirm === log.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <p style={{ color: "#1e1a10", fontSize: 10, textAlign: "center", marginTop: 32, letterSpacing: "2px" }}>DHAHAB · UAE 24K GOLD TRACKER</p>
      </div>

      {modal && <LogModal initial={modal.mode === "edit" ? modal.log : null} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />}
    </div>
  );
};

// ─── Root – handles auth state ────────────────────────────────────────────────
export default function App() {
  const [user, setUser]       = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setChecking(false);
    });
    // Listen for login / logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0b07", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(212,175,55,0.2)", borderTopColor: "#D4AF37", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!user) return <AuthScreen onAuth={setUser} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
