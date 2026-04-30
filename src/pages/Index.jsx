import { useEffect, useMemo, useState } from "react";
import { theme, T, getStatusColor } from "@/lib/scrapTheme";
import {
  fetchMaterials,
  fetchCollectors,
  fetchPickups,
  createPickup,
  computeAnalytics,
} from "@/api/scrapApi";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    truck: (<><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>),
    chart: (<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>),
    users: (<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>),
    settings: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>),
    tag: (<><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>),
    calendar: (<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>),
    check: <polyline points="20 6 9 17 4 12" />,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    mappin: (<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>),
    bell: (<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    mic: (<><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>),
    wifioff: (<><line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A10.94 10.94 0 0119 12.55" /><path d="M5 12.55a10.94 10.94 0 015.17-2.39" /><path d="M10.71 5.05A16 16 0 0122.56 9" /><path d="M1.42 9a15.91 15.91 0 014.7-2.88" /><path d="M8.53 16.11a6 6 0 016.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></>),
    receipt: (<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>),
    alert: (<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>),
    trending: (<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>),
    phone: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 7.18a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 12a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />,
    edit: (<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>),
    refresh: (<><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></>),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ─── Reusable bits ────────────────────────────────────────────────────────────
const Badge = ({ type, label }) => {
  const styles = {
    verified: { bg: "#DBEAFE", text: "#1D4ED8" },
    top: { bg: "#FEF3C7", text: "#B45309" },
    completed: { bg: "#DCFCE7", text: "#15803D" },
    accepted: { bg: "#FEF3C7", text: "#B45309" },
    requested: { bg: "#EDE9FE", text: "#5B21B6" },
  };
  const s = styles[type] || { bg: "#F3F4F6", text: "#6B7280" };
  return (
    <span style={{ background: s.bg, color: s.text, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
};

const Stars = ({ rating }) => (
  <span style={{ display: "inline-flex", gap: 1, alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= Math.floor(rating) ? "#F59E0B" : "#D1D5DB"}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
    <span style={{ fontSize: 12, color: "#6B7280", marginLeft: 3 }}>{rating}</span>
  </span>
);

// Animated counter for stats
const Counter = ({ value, duration = 900, format = (v) => v }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let start = null;
    const target = Number(value) || 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [value, duration]);
  return <>{format(v)}</>;
};

const StatusTimeline = ({ status, t }) => {
  const steps = ["requested", "accepted", "collected", "completed"];
  const labels = { requested: t.statusRequested, accepted: t.statusAccepted, collected: t.statusCollected, completed: t.statusCompleted };
  const idx = steps.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "center", margin: "12px 0" }}>
      {steps.map((s, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div className={active ? "ss-pulse-ring" : ""} style={{
                width: 28, height: 28, borderRadius: "50%",
                background: done ? theme.colors.primary : "#E5E7EB",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: active ? `3px solid ${theme.colors.primaryLight}` : "none",
                transition: "background 0.4s ease",
              }}>
                {done && <Icon name="check" size={14} color="#fff" />}
              </div>
              <span style={{ fontSize: 9, color: done ? theme.colors.primary : "#9CA3AF", whiteSpace: "nowrap", fontWeight: done ? 600 : 400 }}>
                {labels[s]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: "#E5E7EB", margin: "0 4px", marginBottom: 18, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: theme.colors.primary, transform: `scaleX(${i < idx ? 1 : 0})`, transformOrigin: "left", transition: "transform 0.5s ease" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Pickup Card ──────────────────────────────────────────────────────────────
const PickupCard = ({ pickup, t, lang, materials }) => {
  const getMaterial = (id) => materials.find((m) => m.id === id) || {};
  return (
    <div className="ss-hover-lift" style={{ background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.colors.text }}>#{pickup.id}</span>
          <span style={{ fontSize: 12, color: theme.colors.textMuted, marginLeft: 8 }}>{pickup.date}</span>
        </div>
        <Badge type={pickup.status} label={t[`status${pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}`]} />
      </div>
      <StatusTimeline status={pickup.status} t={t} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0" }}>
        {pickup.materials.map((m) => {
          const mat = getMaterial(m.id);
          return (
            <span key={m.id} style={{ fontSize: 12, background: "#F9FAFB", border: `1px solid ${theme.colors.border}`, borderRadius: 20, padding: "2px 10px" }}>
              {mat.icon} {lang === "ta" ? mat.nameTA : mat.name} {m.weight}kg
            </span>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: `1px solid ${theme.colors.border}` }}>
        <div style={{ fontSize: 13, color: theme.colors.textMuted }}>
          <Icon name="mappin" size={12} color={theme.colors.textMuted} /> {pickup.address}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: theme.colors.primary }}>₹{pickup.amount.toFixed(0)}</div>
      </div>
      {pickup.collector && (
        <div style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 4 }}>
          <Icon name="users" size={12} color={theme.colors.textMuted} /> {pickup.collector}
        </div>
      )}
    </div>
  );
};

// ─── Confetti burst ───────────────────────────────────────────────────────────
const Confetti = () => {
  const colors = ["#1B5E3B", "#D4860A", "#3498DB", "#E67E22", "#7C3AED", "#EF4444"];
  const pieces = Array.from({ length: 28 });
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
      {pieces.map((_, i) => {
        const tx = (Math.random() - 0.5) * 320 + "px";
        const ty = Math.random() * -260 - 60 + "px";
        const tr = Math.random() * 720 + "deg";
        const c = colors[i % colors.length];
        return (
          <span key={i} className="ss-confetti-piece" style={{
            left: "50%", top: "50%", background: c,
            ["--tx"]: tx, ["--ty"]: ty, ["--tr"]: tr,
            animationDelay: (i % 6) * 0.04 + "s",
          }} />
        );
      })}
    </div>
  );
};

// ─── Schedule Pickup ──────────────────────────────────────────────────────────
const SchedulePickup = ({ t, lang, materials, collectors, onScheduled }) => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState({});
  const [weights, setWeights] = useState({});
  const [address, setAddress] = useState("");
  const [time, setTime] = useState("morning");
  const [listening, setListening] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getMaterial = (id) => materials.find((m) => m.id === id) || {};

  const total = Object.entries(selected)
    .filter(([, v]) => v)
    .reduce((acc, [id]) => {
      const mat = getMaterial(id);
      const w = parseFloat(weights[id] || 0);
      return acc + (mat.price || 0) * w;
    }, 0);

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const topCollector = collectors[0];

  const handleVoice = () => {
    setListening(true);
    setTimeout(() => {
      setAddress("12, Kovai Road, Pollachi - 642 001");
      setListening(false);
    }, 1600);
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const matPayload = Object.entries(selected)
        .filter(([, v]) => v)
        .map(([id]) => ({ id, weight: parseFloat(weights[id] || 0) }));
      await createPickup({ materials: matPayload, address, time, amount: total });
      setScheduled(true);
      onScheduled && onScheduled();
    } catch (e) {
      setError(e.message || "Could not save pickup");
    } finally {
      setSubmitting(false);
    }
  };

  if (scheduled) {
    return (
      <div className="ss-fade-in" style={{ position: "relative", textAlign: "center", padding: "40px 20px" }}>
        <Confetti />
        <div className="ss-pop" style={{ width: 84, height: 84, borderRadius: "50%", background: theme.colors.primaryPale, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="check" size={42} color={theme.colors.primary} />
        </div>
        <h2 style={{ color: theme.colors.primary, marginBottom: 8 }}>Pickup Confirmed!</h2>
        <p style={{ color: theme.colors.textMuted, fontSize: 14 }}>Saved to your account. We'll notify you when a collector accepts.</p>
        <div className="ss-scale-in" style={{ background: theme.colors.primaryPale, borderRadius: 12, padding: 16, margin: "20px 0", textAlign: "left" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: theme.colors.primary }}>{t.estimatedAmount}</p>
          <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: theme.colors.primary }}>
            ₹<Counter value={total} format={(v) => Math.round(v)} />
          </p>
        </div>
        <button className="ss-press" onClick={() => { setScheduled(false); setStep(1); setSelected({}); setWeights({}); setAddress(""); }}
          style={{ background: theme.colors.primary, color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
          Schedule Another
        </button>
      </div>
    );
  }

  return (
    <div className="ss-fade-in" style={{ padding: "0 4px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: "#E5E7EB", overflow: "hidden" }}>
            <div style={{ height: "100%", background: theme.colors.primary, transform: `scaleX(${s <= step ? 1 : 0})`, transformOrigin: "left", transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)" }} />
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="ss-fade-in">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: theme.colors.text }}>{t.selectMaterials}</h3>
          <p style={{ fontSize: 13, color: theme.colors.textMuted, marginBottom: 16 }}>Select what you want to sell</p>
          <div className="ss-stagger" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {materials.map((mat) => (
              <div key={mat.id} className="ss-press"
                onClick={() => setSelected((p) => ({ ...p, [mat.id]: !p[mat.id] }))}
                style={{
                  border: `2px solid ${selected[mat.id] ? theme.colors.primary : theme.colors.border}`,
                  borderRadius: 12, padding: 14, cursor: "pointer",
                  background: selected[mat.id] ? theme.colors.primaryPale : "#fff",
                  transition: "all 0.25s ease",
                  transform: selected[mat.id] ? "translateY(-2px)" : "none",
                  boxShadow: selected[mat.id] ? "0 6px 16px rgba(27,94,59,0.18)" : "none",
                }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{mat.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.colors.text }}>{lang === "ta" ? mat.nameTA : mat.name}</div>
                <div style={{ fontSize: 12, color: theme.colors.primary, fontWeight: 700 }}>₹{mat.price}/{t.pricePerKg}</div>
                {selected[mat.id] && (
                  <input className="ss-fade-in"
                    type="number" placeholder="kg" min="0" step="0.1"
                    value={weights[mat.id] || ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setWeights((p) => ({ ...p, [mat.id]: e.target.value }))}
                    style={{ width: "100%", marginTop: 8, padding: "6px 8px", border: `1px solid ${theme.colors.primary}`, borderRadius: 8, fontSize: 13, background: "#fff" }} />
                )}
              </div>
            ))}
          </div>
          {total > 0 && (
            <div className="ss-fade-in-down" style={{ background: theme.colors.accentPale, borderRadius: 12, padding: "12px 16px", margin: "16px 0", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: theme.colors.warning }}>{t.estimatedAmount}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: theme.colors.warning }}>
                ₹<Counter value={total} format={(v) => Math.round(v)} />
              </span>
            </div>
          )}
          <button className="ss-press" disabled={selectedCount === 0} onClick={() => setStep(2)}
            style={{ width: "100%", padding: "14px", background: selectedCount > 0 ? theme.colors.primary : "#D1D5DB", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: selectedCount > 0 ? "pointer" : "not-allowed", marginTop: 8, transition: "background 0.25s" }}>
            Continue ({selectedCount} selected)
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="ss-slide-in-right">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{t.enterAddress}</h3>
          <p style={{ fontSize: 13, color: theme.colors.textMuted, marginBottom: 16 }}>Where should we pick up?</p>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="12, Kovai Road, Pollachi..."
              rows={3} style={{ width: "100%", padding: "12px", border: `1px solid ${theme.colors.border}`, borderRadius: 12, fontSize: 14, resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            <button onClick={handleVoice} className={listening ? "ss-mic-pulse" : "ss-press"}
              style={{ position: "absolute", bottom: 10, right: 10, background: listening ? theme.colors.danger : theme.colors.primary, border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Icon name="mic" size={16} color="#fff" />
            </button>
          </div>
          {listening && <p className="ss-fade-in" style={{ fontSize: 13, color: theme.colors.danger, textAlign: "center" }}>🎙 Listening...</p>}

          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{t.chooseTime}</p>
          <div className="ss-stagger">
            {[["morning", t.morning], ["afternoon", t.afternoon], ["evening", t.evening]].map(([val, label]) => (
              <div key={val} onClick={() => setTime(val)} className="ss-press"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px", border: `2px solid ${time === val ? theme.colors.primary : theme.colors.border}`, borderRadius: 12, marginBottom: 10, cursor: "pointer", background: time === val ? theme.colors.primaryPale : "#fff", transition: "all 0.2s" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${time === val ? theme.colors.primary : theme.colors.border}`, background: time === val ? theme.colors.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                  {time === val && <div className="ss-scale-in" style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="ss-press" onClick={() => setStep(1)} style={{ flex: 1, padding: "14px", background: "#F3F4F6", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>{t.cancel}</button>
            <button className="ss-press" disabled={!address} onClick={() => setStep(3)} style={{ flex: 2, padding: "14px", background: address ? theme.colors.primary : "#D1D5DB", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: address ? "pointer" : "not-allowed" }}>Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="ss-slide-in-right">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Review & Confirm</h3>
          <p style={{ fontSize: 13, color: theme.colors.textMuted, marginBottom: 16 }}>Check details before confirming</p>

          {topCollector && (
            <div className="ss-scale-in" style={{ background: theme.colors.primaryPale, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: theme.colors.primary, fontWeight: 600, margin: "0 0 8px" }}>{t.nearestCollector}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: theme.colors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 700 }}>{topCollector.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{topCollector.name}</p>
                  <Stars rating={topCollector.rating} />
                  <p style={{ margin: 0, fontSize: 12, color: theme.colors.textMuted }}>{topCollector.distance} away · {topCollector.pickups} pickups</p>
                </div>
                <Badge type={topCollector.badge} label={topCollector.badge === "top" ? t.topRated : t.verified} />
              </div>
            </div>
          )}

          <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 14, marginBottom: 16 }}>
            {Object.entries(selected).filter(([, v]) => v).map(([id]) => {
              const mat = getMaterial(id);
              const w = parseFloat(weights[id] || 0);
              return (
                <div key={id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14 }}>
                  <span>{mat.icon} {lang === "ta" ? mat.nameTA : mat.name} · {w}kg</span>
                  <span style={{ fontWeight: 600 }}>₹{((mat.price || 0) * w).toFixed(0)}</span>
                </div>
              );
            })}
            <div style={{ borderTop: `1px solid ${theme.colors.border}`, marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: theme.colors.primary }}>₹{total.toFixed(0)}</span>
            </div>
          </div>

          <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, color: theme.colors.textMuted }}>
            <div><Icon name="mappin" size={13} color={theme.colors.textMuted} /> {address}</div>
            <div style={{ marginTop: 4 }}><Icon name="calendar" size={13} color={theme.colors.textMuted} /> Today · {time === "morning" ? t.morning : time === "afternoon" ? t.afternoon : t.evening}</div>
          </div>

          {error && <p style={{ color: theme.colors.danger, fontSize: 13, textAlign: "center" }}>{error}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="ss-press" onClick={() => setStep(2)} style={{ flex: 1, padding: "14px", background: "#F3F4F6", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>{t.cancel}</button>
            <button className="ss-press" onClick={handleSubmit} disabled={submitting} style={{ flex: 2, padding: "14px", background: theme.colors.primary, color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Saving..." : t.confirm}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Price List ───────────────────────────────────────────────────────────────
const PriceList = ({ t, lang, materials }) => {
  const [search, setSearch] = useState("");
  const filtered = materials.filter((m) => (lang === "ta" ? m.nameTA : m.name).toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="ss-fade-in">
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search material..."
        style={{ width: "100%", padding: "12px 14px", border: `1px solid ${theme.colors.border}`, borderRadius: 12, fontSize: 14, marginBottom: 16, boxSizing: "border-box" }} />
      <div className="ss-fade-in-down" style={{ background: theme.colors.accentPale, borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: theme.colors.warning }}>
        <Icon name="trending" size={14} color={theme.colors.warning} /> Copper prices up 8% this week
      </div>
      <div className="ss-stagger">
        {filtered.map((mat) => (
          <div key={mat.id} className="ss-hover-lift" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{mat.icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{lang === "ta" ? mat.nameTA : mat.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: theme.colors.textMuted }}>Updated today</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: theme.colors.primary }}>₹{mat.price}</p>
              <p style={{ margin: 0, fontSize: 11, color: theme.colors.textMuted }}>{t.pricePerKg}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── My Pickups ───────────────────────────────────────────────────────────────
const MyPickups = ({ t, lang, pickups, materials }) => {
  const [filter, setFilter] = useState("all");
  const [dispute, setDispute] = useState(null);
  const [disputeText, setDisputeText] = useState("");
  const statuses = ["all", "requested", "accepted", "completed"];
  const filtered = filter === "all" ? pickups : pickups.filter((p) => p.status === filter);
  return (
    <div className="ss-fade-in">
      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className="ss-press"
            style={{ padding: "8px 14px", border: "none", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", background: filter === s ? theme.colors.primary : "#F3F4F6", color: filter === s ? "#fff" : theme.colors.textMuted, transition: "all 0.2s" }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div className="ss-stagger" key={filter}>
        {filtered.map((pickup) => (
          <div key={pickup.id}>
            <PickupCard pickup={pickup} t={t} lang={lang} materials={materials} />
            {pickup.status === "completed" && (
              <div style={{ display: "flex", gap: 8, marginTop: -4, marginBottom: 16 }}>
                <button onClick={() => setDispute(pickup.id)} className="ss-press" style={{ flex: 1, padding: "8px", background: "#FEF2F2", color: theme.colors.danger, border: `1px solid #FCA5A5`, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Icon name="alert" size={12} color={theme.colors.danger} /> {t.raiseDispute}
                </button>
                <button className="ss-press" style={{ flex: 1, padding: "8px", background: theme.colors.primaryPale, color: theme.colors.primary, border: `1px solid #86EFAC`, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Icon name="receipt" size={12} color={theme.colors.primary} /> {t.viewReceipt}
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p style={{ textAlign: "center", color: theme.colors.textMuted, marginTop: 24 }}>No pickups yet</p>}
      </div>

      {dispute && (
        <div className="ss-fade-in" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", zIndex: 100 }}>
          <div className="ss-slide-up" style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 600, margin: "0 auto" }}>
            <h3 style={{ margin: "0 0 16px" }}>{t.raiseDispute}</h3>
            <textarea value={disputeText} onChange={(e) => setDisputeText(e.target.value)} placeholder={t.disputeDesc} rows={4}
              style={{ width: "100%", padding: 12, border: `1px solid ${theme.colors.border}`, borderRadius: 12, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", resize: "none" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setDispute(null)} className="ss-press" style={{ flex: 1, padding: "13px", background: "#F3F4F6", border: "none", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>{t.cancel}</button>
              <button onClick={() => setDispute(null)} className="ss-press" style={{ flex: 2, padding: "13px", background: theme.colors.danger, color: "#fff", border: "none", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>{t.submit}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Collectors ───────────────────────────────────────────────────────────────
const Collectors = ({ t, collectors }) => (
  <div className="ss-fade-in ss-stagger">
    {collectors.map((c) => (
      <div key={c.id} className="ss-hover-lift" style={{ background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: theme.colors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", fontWeight: 700 }}>
            {c.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</span>
              <Badge type={c.badge} label={c.badge === "top" ? t.topRated : t.verified} />
            </div>
            <Stars rating={c.rating} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
          {[
            { label: t.rating, value: c.rating },
            { label: t.pickups, value: c.pickups },
            { label: "Distance", value: c.distance },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center", background: "#F9FAFB", borderRadius: 10, padding: 10 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.colors.primary }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: theme.colors.textMuted }}>{stat.label}</p>
            </div>
          ))}
        </div>
        <button className="ss-press" style={{ width: "100%", marginTop: 12, padding: "10px", background: theme.colors.primaryPale, border: `1px solid #86EFAC`, borderRadius: 10, color: theme.colors.primary, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          <Icon name="phone" size={13} color={theme.colors.primary} /> Contact
        </button>
      </div>
    ))}
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ t, role, materials, collectors, analytics }) => {
  const getMaterial = (id) => materials.find((m) => m.id === id) || {};
  const [adminPrices, setAdminPrices] = useState({});
  const [editingPrices, setEditingPrices] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAdminPrices(Object.fromEntries(materials.map((m) => [m.id, m.price])));
  }, [materials]);

  const handleSave = () => {
    setSaved(true);
    setEditingPrices(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const StatCard = ({ icon, label, value, unit, color }) => (
    <div className="ss-hover-lift ss-scale-in" style={{ background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: 14, padding: 16, flex: 1, minWidth: 0 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <Icon name={icon} size={18} color={color} />
      </div>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{value}</p>
      <p style={{ margin: 0, fontSize: 12, color: theme.colors.textMuted }}>{label}{unit ? ` (${unit})` : ""}</p>
    </div>
  );

  return (
    <div className="ss-fade-in">
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <StatCard icon="trending" label={t.totalEarnings} value={<>₹<Counter value={analytics.totalEarnings} format={(v) => Math.round(v).toLocaleString()} /></>} color={theme.colors.primary} />
        <StatCard icon="truck" label={t.totalCollected} value={<><Counter value={analytics.totalCollected} format={(v) => v.toFixed(1)} /></>} color={theme.colors.accent} />
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <StatCard icon="calendar" label={t.monthlyPickups} value={<Counter value={analytics.monthlyPickups} format={(v) => Math.round(v)} />} color="#7C3AED" />
        <StatCard icon="users" label={t.activeCollectors} value={<Counter value={analytics.activeCollectors} format={(v) => Math.round(v)} />} color="#0891B2" />
      </div>

      <div className="ss-fade-in" style={{ background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>{t.materialBreakdown}</h3>
        {analytics.materialBreakdown.length === 0 && <p style={{ fontSize: 13, color: theme.colors.textMuted }}>No data yet</p>}
        {analytics.materialBreakdown.map((item, i) => {
          const mat = getMaterial(item.id);
          const total = analytics.totalCollected || 1;
          const pct = Math.max(2, Math.round((item.kg / total) * 100));
          return (
            <div key={item.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                <span>{mat.icon} {mat.name}</span>
                <span style={{ fontWeight: 600, color: theme.colors.primary }}>₹{item.earnings.toLocaleString()}</span>
              </div>
              <div style={{ height: 8, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
                <div className="ss-bar-grow" style={{ width: `${pct}%`, height: "100%", background: mat.color || theme.colors.primary, borderRadius: 4, animationDelay: `${i * 0.08}s` }} />
              </div>
              <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 2 }}>{item.kg.toLocaleString()} kg · {pct}%</div>
            </div>
          );
        })}
      </div>

      {role === "admin" && (
        <div className="ss-fade-in" style={{ background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{t.updatePrices}</h3>
            <button onClick={() => setEditingPrices(!editingPrices)} className="ss-press" style={{ background: theme.colors.primaryPale, color: theme.colors.primary, border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Icon name="edit" size={12} color={theme.colors.primary} /> {editingPrices ? "Cancel" : "Edit"}
            </button>
          </div>
          {materials.map((mat) => (
            <div key={mat.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.colors.border}` }}>
              <span style={{ fontSize: 14 }}>{mat.icon} {mat.name}</span>
              {editingPrices ? (
                <input type="number" value={adminPrices[mat.id] ?? ""} onChange={(e) => setAdminPrices((p) => ({ ...p, [mat.id]: e.target.value }))}
                  style={{ width: 80, padding: "4px 8px", border: `1px solid ${theme.colors.primary}`, borderRadius: 8, fontSize: 14, textAlign: "right" }} />
              ) : (
                <span style={{ fontWeight: 700, color: theme.colors.primary }}>₹{adminPrices[mat.id]}/kg</span>
              )}
            </div>
          ))}
          {editingPrices && (
            <button onClick={handleSave} className="ss-press" style={{ width: "100%", marginTop: 12, padding: "12px", background: theme.colors.primary, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              {t.save} Prices
            </button>
          )}
          {saved && <p className="ss-pop" style={{ textAlign: "center", color: theme.colors.success, fontWeight: 600, marginTop: 8 }}>✓ Prices updated successfully!</p>}
        </div>
      )}

      <div className="ss-fade-in" style={{ background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: 14, padding: 16 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>{t.collectorPerformance}</h3>
        {collectors.map((c, i) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.colors.textMuted, width: 18 }}>#{i + 1}</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: theme.colors.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>{c.name[0]}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{c.name}</p>
              <Stars rating={c.rating} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.colors.primary }}>{c.pickups} pickups</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Settings ─────────────────────────────────────────────────────────────────
const Settings = ({ t, lang, setLang, role, setRole, offline, setOffline }) => {
  const roles = [["household", t.householdUser], ["collector", t.scrapCollector], ["admin", t.shopAdmin]];
  return (
    <div className="ss-fade-in ss-stagger">
      <div style={{ background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>{t.selectLang}</h3>
        <div style={{ display: "flex", gap: 10 }}>
          {[["en", "English"], ["ta", "தமிழ்"]].map(([code, label]) => (
            <button key={code} onClick={() => setLang(code)} className="ss-press"
              style={{ flex: 1, padding: "12px", border: `2px solid ${lang === code ? theme.colors.primary : theme.colors.border}`, background: lang === code ? theme.colors.primaryPale : "#fff", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", color: lang === code ? theme.colors.primary : theme.colors.text, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>User Role</h3>
        {roles.map(([r, label]) => (
          <div key={r} onClick={() => setRole(r)} className="ss-press"
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: `2px solid ${role === r ? theme.colors.primary : theme.colors.border}`, borderRadius: 12, marginBottom: 8, cursor: "pointer", background: role === r ? theme.colors.primaryPale : "#fff", transition: "all 0.2s" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${role === r ? theme.colors.primary : theme.colors.border}`, background: role === r ? theme.colors.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {role === r && <div className="ss-scale-in" style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
            </div>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{t.offlineMode}</p>
            <p style={{ margin: 0, fontSize: 12, color: theme.colors.textMuted }}>Save data locally & sync later</p>
          </div>
          <div onClick={() => setOffline(!offline)} style={{ width: 48, height: 28, borderRadius: 14, background: offline ? theme.colors.primary : "#D1D5DB", cursor: "pointer", position: "relative", transition: "background 0.25s" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: offline ? 23 : 3, transition: "left 0.25s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
          </div>
        </div>
      </div>

      {offline && (
        <button className="ss-fade-in-down ss-press" style={{ width: "100%", padding: "14px", background: theme.colors.accent, color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="refresh" size={16} color="#fff" /> {t.syncData}
        </button>
      )}

      <div style={{ background: theme.colors.primaryPale, borderRadius: 14, padding: 16, marginTop: 14, textAlign: "center" }}>
        <div className="ss-bounce-soft" style={{ width: 48, height: 48, borderRadius: "50%", background: theme.colors.primary, margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="shield" size={22} color="#fff" />
        </div>
        <p style={{ margin: 0, fontWeight: 700, color: theme.colors.primary }}>Data Protected</p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: theme.colors.textMuted }}>Connected securely to Lovable Cloud</p>
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Index() {
  const [lang, setLang] = useState("en");
  const [role, setRole] = useState("household");
  const [activeTab, setActiveTab] = useState("schedule");
  const [offline, setOffline] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const [materials, setMaterials] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = T[lang];

  const loadAll = async () => {
    const [m, c, p] = await Promise.all([fetchMaterials(), fetchCollectors(), fetchPickups()]);
    setMaterials(m);
    setCollectors(c);
    setPickups(p);
    setLoading(false);
  };

  useEffect(() => { loadAll().catch(() => setLoading(false)); }, []);

  const analytics = useMemo(() => computeAnalytics(pickups, materials), [pickups, materials]);

  const tabs = [
    { id: "schedule", icon: "calendar", label: t.schedule },
    { id: "prices", icon: "tag", label: t.prices },
    { id: "pickups", icon: "truck", label: t.myPickups },
    { id: "dashboard", icon: "chart", label: t.dashboard },
    { id: "settings", icon: "settings", label: t.settings },
  ];

  const roleColors = { household: "#1B5E3B", collector: "#0C4A6E", admin: "#4C1D95" };
  const roleColor = roleColors[role] || theme.colors.primary;

  const notifications = [
    { id: 1, text: "Balu accepted your pickup request!", time: "5 min ago", read: false },
    { id: 2, text: "Copper prices increased by 8%", time: "2 hrs ago", read: false },
    { id: 3, text: "Pickup #P001 completed. ₹170 received.", time: "Yesterday", read: true },
  ];
  const notifCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: theme.colors.surface, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", position: "relative" }}>
      <header style={{ background: roleColor, padding: "14px 20px", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,0.15)", transition: "background 0.4s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="ss-fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="ss-bounce-soft" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>♻</div>
              <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 20, letterSpacing: -0.5, margin: 0 }}>{t.appName}</h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, margin: "2px 0 0" }}>
              {offline && <><Icon name="wifioff" size={10} color="rgba(255,255,255,0.75)" /> Offline · </>}
              {role === "household" ? t.householdUser : role === "collector" ? t.scrapCollector : t.shopAdmin}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowNotifs(!showNotifs)} className="ss-press" style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Icon name="bell" size={18} color="#fff" />
              </button>
              {notifCount > 0 && <div className="ss-pop" style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{notifCount}</div>}
            </div>
          </div>
        </div>

        {showNotifs && (
          <div className="ss-scale-in" style={{ position: "absolute", top: 70, right: 16, width: 280, background: "#fff", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 100, overflow: "hidden", transformOrigin: "top right" }}>
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.colors.border}`, fontWeight: 700, fontSize: 14, color: theme.colors.text }}>{t.notifications}</div>
            {notifications.map((n) => (
              <div key={n.id} style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.colors.border}`, background: n.read ? "#fff" : "#F0FDF4" }}>
                <p style={{ margin: 0, fontSize: 13, color: theme.colors.text }}>{n.text}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: theme.colors.textMuted }}>{n.time}</p>
              </div>
            ))}
            <button onClick={() => setShowNotifs(false)} style={{ width: "100%", padding: "10px", background: "#F9FAFB", border: "none", fontSize: 13, color: theme.colors.textMuted, cursor: "pointer" }}>Close</button>
          </div>
        )}
      </header>

      <main style={{ padding: "16px 16px 90px" }}>
        {loading ? (
          <div className="ss-stagger">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ss-shimmer" style={{ height: 72, borderRadius: 14, marginBottom: 12 }} />
            ))}
          </div>
        ) : (
          <div key={activeTab}>
            {activeTab === "schedule" && <SchedulePickup t={t} lang={lang} materials={materials} collectors={collectors} onScheduled={loadAll} />}
            {activeTab === "prices" && <PriceList t={t} lang={lang} materials={materials} />}
            {activeTab === "pickups" && <MyPickups t={t} lang={lang} pickups={pickups} materials={materials} />}
            {activeTab === "dashboard" && <Dashboard t={t} role={role} materials={materials} collectors={collectors} analytics={analytics} />}
            {activeTab === "settings" && <Settings t={t} lang={lang} setLang={setLang} role={role} setRole={setRole} offline={offline} setOffline={setOffline} />}
          </div>
        )}
      </main>

      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#fff", borderTop: `1px solid ${theme.colors.border}`, padding: "8px 0 env(safe-area-inset-bottom)", zIndex: 50, boxShadow: "0 -2px 12px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="ss-press"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 12px", background: "none", border: "none", cursor: "pointer", flex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: active ? roleColor + "22" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s", transform: active ? "translateY(-2px)" : "none" }}>
                  <Icon name={tab.icon} size={20} color={active ? roleColor : "#9CA3AF"} />
                </div>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? roleColor : "#9CA3AF", whiteSpace: "nowrap" }}>{tab.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
