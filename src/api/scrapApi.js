// Backend / data-access layer.
// All Supabase reads & writes for ScrapSmart go through this module.
// UI components import from here — they never touch supabase directly.
import { supabase } from "@/integrations/supabase/client";

// ─── Materials ────────────────────────────────────────────────────────────────
export async function fetchMaterials() {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map((m) => ({
    id: m.id,
    name: m.name,
    nameTA: m.name_ta,
    icon: m.icon,
    price_per_kg: Number(m.price_per_kg ?? m.price ?? 0),
    price: Number(m.price_per_kg ?? m.price ?? 0),
    unit: m.unit,
    color: m.color,
    updatedAt: m.updated_at,
  }));
}

// ─── Collectors ───────────────────────────────────────────────────────────────
export async function fetchCollectors() {
  const { data, error } = await supabase
    .from("collectors")
    .select("*")
    .order("rating", { ascending: false });
  if (error) throw error;
  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    nameTA: c.name_ta,
    rating: Number(c.rating),
    pickups: c.pickups,
    badge: c.badge,
    distance: c.distance,
    phone: c.phone,
  }));
}

// ─── Pickups ──────────────────────────────────────────────────────────────────
export async function fetchPickups() {
  const { data, error } = await supabase
    .from("pickups")
    .select("*, collector:collectors(name, name_ta)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((p) => ({
    id: p.code,
    status: p.status,
    date: new Date(p.pickup_date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    materials: Array.isArray(p.materials) ? p.materials : [],
    collector: p.collector?.name || null,
    amount: Number(p.amount),
    address: p.address,
    preferredTime: p.preferred_time,
  }));
}

export async function createPickup({ materials, address, time, pickupDate, amount }) {
  const code = `P${Date.now().toString().slice(-8)}`;
  const { data, error } = await supabase
    .from("pickups")
    .insert({
      code,
      status: "requested",
      materials,
      address,
      preferred_time: time,
      pickup_date: pickupDate,
      amount,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToScrapChanges(onChange) {
  const channel = supabase
    .channel("scrapsmart-live-data")
    .on("postgres_changes", { event: "*", schema: "public", table: "materials" }, (payload) => onChange({ table: "materials", payload }))
    .on("postgres_changes", { event: "*", schema: "public", table: "collectors" }, (payload) => onChange({ table: "collectors", payload }))
    .on("postgres_changes", { event: "*", schema: "public", table: "pickups" }, (payload) => onChange({ table: "pickups", payload }))
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Analytics (computed client-side from pickups + materials) ────────────────
export function computeAnalytics(pickups, materials, collectors = []) {
  const matMap = Object.fromEntries(materials.map((m) => [m.id, m]));
  let totalCollected = 0;
  let totalEarnings = 0;
  const breakdown = {};
  pickups.forEach((p) => {
    totalEarnings += p.amount || 0;
    (p.materials || []).forEach((m) => {
      const mat = matMap[m.id];
      if (!mat) return;
      const w = Number(m.weight) || 0;
      totalCollected += w;
      if (!breakdown[m.id]) breakdown[m.id] = { id: m.id, kg: 0, earnings: 0 };
      breakdown[m.id].kg += w;
      breakdown[m.id].earnings += w * (mat.price_per_kg || mat.price || 0);
    });
  });
  return {
    totalCollected: Math.round(totalCollected * 1000) / 1000,
    totalEarnings: Math.round(totalEarnings),
    monthlyPickups: pickups.length,
    activeCollectors: collectors.length,
    materialBreakdown: Object.values(breakdown).sort((a, b) => b.earnings - a.earnings),
  };
}
