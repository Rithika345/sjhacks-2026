// Sample data for Maya's Kitchen (fallback)
const MAYA = {
  name: "Maya's Kitchen",
  handle: "@mayaskitchen",
  subscribers: 45200,
  joined: "Apr 2024",
  tenure: "2 yr",
  burnoutWeek: 26,
};

const SIX_MONTHS = {
  views: 1284000,
  viewsTrend: +12,
  likes: 86400,
  likesTrend: -8,
  comments: 9120,
  commentsTrend: -22,
};

const TOP_VIDEOS = [
  { rank: 1, title: "One-Pot Tuscan Bean Stew (Lazy Sunday Edition)", views: 142300, days: 24, kind: "Recipe", color: "#C7855B" },
  { rank: 2, title: "I Tried Cooking In Lisbon For A Week — Honest Take", views: 118900, days: 41, kind: "Travel", color: "#8AA17A" },
  { rank: 3, title: "Why Your Sourdough Keeps Failing (5 Real Reasons)", views: 96400, days: 12, kind: "Tips", color: "#B8543F" },
  { rank: 4, title: "30-Min Weeknight Curry — No Fancy Ingredients", views: 84200, days: 58, kind: "Recipe", color: "#C7855B" },
  { rank: 5, title: "My Honest Kitchen Tour (It's a Mess)", views: 71800, days: 73, kind: "Vlog", color: "#A98ABF" },
];

const CATEGORIES = [
  { name: "Recipes", pct: 62, color: "#C7855B" },
  { name: "Vlogs", pct: 18, color: "#A98ABF" },
  { name: "Kitchen Tips", pct: 12, color: "#B8543F" },
  { name: "Travel", pct: 8, color: "#8AA17A" },
];

const WEEKLY = (() => {
  const arr = [];
  for (let i = 0; i < 26; i++) {
    const ramp = i / 25;
    const uploads = Math.max(1, Math.round(2 + ramp * 4 + (Math.sin(i * 1.7) * 0.6)));
    const baseEng = 6.4 - ramp * 2.8 + Math.cos(i * 0.9) * 0.5;
    arr.push({
      week: i,
      uploads,
      engagement: Math.max(2.1, +baseEng.toFixed(2)),
      subs: 30000 + Math.round(ramp * 15200 + Math.sin(i * 0.6) * 400),
    });
  }
  return arr;
})();

const HEATMAP = [
  { time: "6–10a",  vals: [3.1, 2.8, 4.2, 3.9, 5.1, 6.4, 7.2] },
  { time: "10a–2p", vals: [2.4, 2.1, 3.0, 2.8, 4.0, 5.2, 5.8] },
  { time: "2–6p",  vals: [4.8, 4.2, 5.1, 4.9, 6.2, 7.4, 8.1] },
  { time: "6–10p", vals: [5.9, 5.4, 6.3, 6.0, 7.1, 8.6, 9.4] },
];

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const VAULTED = [
  {
    id: "v-001",
    title: "Quiet Kitchen — A Series About Cooking Alone",
    body: "A long-form series exploring solo cooking as meditation. No music, no voiceover for first 4 minutes. Just sound design and the act of cooking. 8-episode arc tied to seasons.",
    hash: "9f3a2b71c8d4e6f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
    lockedAt: "Apr 18, 2026",
    daysLeft: 53,
    state: "fresh",
  },
  {
    id: "v-002",
    title: "Pantry Math — Cost-per-Calorie Recipe Card Format",
    body: "Reusable on-screen card format showing cost per serving, time, and a shelf-life rating. Standardized across all weeknight recipes as a brand signature.",
    hash: "2a4b6c8d0e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e0f1a3b5c7d9e2f4a6b",
    lockedAt: "Mar 02, 2026",
    daysLeft: 21,
    state: "aging",
  },
  {
    id: "v-003",
    title: "Lisbon Field Notes — Travel Cooking Pilot",
    body: "Pilot episode for travel-cooking format. Single city, single dish per episode, learned from a local. Lisbon as proof-of-concept.",
    hash: "4c6d8e0f2a4b6c8d0e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e0f1a3b5c7d",
    lockedAt: "Feb 14, 2026",
    daysLeft: 5,
    state: "expiring",
  },
];

const FOOTPRINT_TOTALS = {
  hoursOnline: 1184,
  hoursTrend: +6,
  platformsTouched: 23,
  itemsConsumed: 8412,
  itemsTrend: +14,
  topPlatformShare: 41,
};

const FOOTPRINT_PLATFORMS = [
  { name: "YouTube",      hours: 312, pct: 26.4, kind: "video",   color: "#B8543F" },
  { name: "Instagram",    hours: 198, pct: 16.7, kind: "social",  color: "#C7855B" },
  { name: "Spotify",      hours: 176, pct: 14.9, kind: "audio",   color: "#8AA17A" },
  { name: "Substack",     hours: 112, pct:  9.5, kind: "reading", color: "#A98ABF" },
  { name: "Reddit",       hours:  94, pct:  7.9, kind: "social",  color: "#C8924A" },
  { name: "NYT Cooking",  hours:  68, pct:  5.7, kind: "reading", color: "#6F8F5C" },
  { name: "TikTok",       hours:  52, pct:  4.4, kind: "video",   color: "#9C4434" },
  { name: "Other (16)",   hours: 172, pct: 14.5, kind: "mixed",   color: "#8A7868" },
];

const FOOTPRINT_TOP_ITEMS = [
  { rank: 1, kind: "Article",  title: "The Slow Death of the Foodie Internet",      source: "Eater · long read",    minutes: 28, color: "#A98ABF" },
  { rank: 2, kind: "Podcast",  title: "Samin Nosrat on losing the appetite to make", source: "On Being · 1h 12m",   minutes: 72, color: "#8AA17A" },
  { rank: 3, kind: "Video",    title: "Why every recipe channel sounds the same",    source: "YouTube · 18m",       minutes: 18, color: "#B8543F" },
  { rank: 4, kind: "Album",    title: "A Light for Attracting Attention",            source: "The Smile · played 14×", minutes: 53, color: "#C8924A" },
  { rank: 5, kind: "Newsletter", title: "Dense Discovery — Issue 318",               source: "Substack · weekly",    minutes: 11, color: "#6F8F5C" },
];

const FOOTPRINT_THEMES = [
  { theme: "Burnout & creative recovery", count: 47, color: "#B8543F" },
  { theme: "Food media criticism",        count: 31, color: "#C7855B" },
  { theme: "Slow living / quiet content", count: 28, color: "#8AA17A" },
  { theme: "Travel writing",              count: 19, color: "#A98ABF" },
  { theme: "Indie publishing economics",  count: 14, color: "#C8924A" },
];

const FOOTPRINT_RHYTHM = [
  { day: "Mon", hours: 5.2 },
  { day: "Tue", hours: 4.8 },
  { day: "Wed", hours: 5.6 },
  { day: "Thu", hours: 5.1 },
  { day: "Fri", hours: 6.4 },
  { day: "Sat", hours: 7.8 },
  { day: "Sun", hours: 8.4 },
];

window.FOOTPRINT_TOTALS = FOOTPRINT_TOTALS;
window.FOOTPRINT_PLATFORMS = FOOTPRINT_PLATFORMS;
window.FOOTPRINT_TOP_ITEMS = FOOTPRINT_TOP_ITEMS;
window.FOOTPRINT_THEMES = FOOTPRINT_THEMES;
window.FOOTPRINT_RHYTHM = FOOTPRINT_RHYTHM;

const PERCEIVED_IDENTITY = {
  topLabels: [
    { label: "Cozy weeknight cook",   strength: 0.92, source: "comments + thumbnails saved" },
    { label: "The honest one",        strength: 0.81, source: "retention spikes on candid moments" },
    { label: "Anti-aesthetic",        strength: 0.64, source: "comments praising 'messy kitchen'" },
    { label: "Budget-conscious",      strength: 0.58, source: "shares on Pantry Math posts" },
  ],
  notLabels: [
    "Aspirational chef",
    "Trend chaser",
    "Travel vlogger",
    "Wellness creator",
  ],
};

const OVERTON_TOPICS = [
  { id: 1, name: "One-pot weeknight recipes",        accept: 0.94, novelty: 0.05, band: "safe",  evidence: "Top 4 of 5 most-shared videos" },
  { id: 2, name: "'Lazy' / low-effort framing",      accept: 0.91, novelty: 0.10, band: "safe",  evidence: "Spikes retention by +18%" },
  { id: 3, name: "Honest mistakes on camera",        accept: 0.88, novelty: 0.15, band: "safe",  evidence: "Comment sentiment +0.42" },
  { id: 4, name: "Pantry-math / cost callouts",      accept: 0.86, novelty: 0.18, band: "safe",  evidence: "Highest save-to-view ratio" },
  { id: 5, name: "Solo travel content",              accept: 0.34, novelty: 0.55, band: "edge",  evidence: "Lisbon video: +1.4K subs / -890 unsubs" },
  { id: 6, name: "Talking about burnout openly",     accept: 0.28, novelty: 0.62, band: "edge",  evidence: "Comments split 58/42; longest avg watch time" },
  { id: 7, name: "Long-form (>20m) episodes",        accept: 0.22, novelty: 0.50, band: "edge",  evidence: "Drop-off at 7m, but stickier completers" },
  { id: 8, name: "Politics-adjacent food (labor, cost-of-living)", accept: 0.05, novelty: 0.70, band: "edge",  evidence: "8% of comments hostile; 12% deeply loyal" },
  { id: 9, name: "Sponsored / branded content",      accept: -0.42, novelty: 0.45, band: "shock", evidence: "'Don't sell out' is the #2 sub-off reason" },
  { id: 10, name: "Aesthetic / styled food shots",   accept: -0.38, novelty: 0.78, band: "shock", evidence: "Audience signed up for 'real kitchen' explicitly" },
  { id: 11, name: "Wellness / clean-eating angle",   accept: -0.55, novelty: 0.82, band: "shock", evidence: "Direct contradiction to top label 'anti-aesthetic'" },
  { id: 12, name: "Charging for content / paywall",  accept: -0.61, novelty: 0.88, band: "shock", evidence: "Free-content covenant in 31% of top comments" },
];

const AUDIENCE_SEGMENTS = [
  { segment: "Tired weeknight cooks (25–40)", pct: 47, sentiment: 0.68, color: "#B8543F" },
  { segment: "Budget-aware students",          pct: 23, sentiment: 0.61, color: "#C7855B" },
  { segment: "Anti-aesthetic / authenticity-seekers", pct: 18, sentiment: 0.74, color: "#8AA17A" },
  { segment: "Aspirational home chefs",        pct:  8, sentiment: 0.21, color: "#A98ABF" },
  { segment: "Drive-by recipe seekers",        pct:  4, sentiment: 0.05, color: "#8A7868" },
];

window.PERCEIVED_IDENTITY = PERCEIVED_IDENTITY;
window.OVERTON_TOPICS = OVERTON_TOPICS;
window.AUDIENCE_SEGMENTS = AUDIENCE_SEGMENTS;

window.MAYA = MAYA;
window.SIX_MONTHS = SIX_MONTHS;
window.TOP_VIDEOS = TOP_VIDEOS;
window.CATEGORIES = CATEGORIES;
window.WEEKLY = WEEKLY;
window.HEATMAP = HEATMAP;
window.DAYS = DAYS;
window.VAULTED = VAULTED;

// ═══════════════════════════════════════════════════════════
// LIVE API LAYER — fetches from backend, overwrites globals
// ═══════════════════════════════════════════════════════════
const DATA_API = window.API_BASE_URL;

window._currentProfile = "maya";
window._profiles = { maya: "Maya's Kitchen", gamerz: "GamerzHub", techtara: "TechTara" };
window._liveData = null;
window._onProfileChange = null; // app.jsx sets this

async function loadProfile(profileId) {
  try {
    await fetch(DATA_API + "/api/profiles/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: profileId }),
    });
    
    const resp = await fetch(DATA_API + "/api/analyze");
    const data = await resp.json();
    if (data.error) { console.warn("API error:", data.error); return false; }
    
    window._currentProfile = profileId;
    window._liveData = data;
    
    // Core identity
    window.MAYA.name = data.channel_name;
    window.MAYA.handle = "@" + data.channel_name.toLowerCase().replace(/[^a-z0-9]/g, "");
    window.MAYA.subscribers = data.footprint.total_views;
    
    // Weekly data for Mirror/Cadence
    window.WEEKLY = data.mirror.weekly_data.map((w, i) => ({
      week: i,
      uploads: w.uploads,
      engagement: w.avg_engagement,
      subs: 30000 + i * 580,
    }));
    
    // Categories
    const catColors = { food_cooking: "#C7855B", lifestyle_personal: "#A98ABF", challenge_entertainment: "#B8543F", tech_review: "#8AA17A", other: "#8A7868" };
    const catNames = { food_cooking: "Recipes", lifestyle_personal: "Vlogs", challenge_entertainment: "Challenges", tech_review: "Tech", other: "Other" };
    window.CATEGORIES = Object.entries(data.footprint.category_breakdown)
      .filter(([k, v]) => v > 0)
      .map(([k, v]) => ({ name: catNames[k] || k, pct: v, color: catColors[k] || "#8A7868" }));
    
    // Top videos
    window.TOP_VIDEOS = data.highlights.top_performers.map((v, i) => ({
      rank: i + 1, title: v.title, views: v.views, days: 30, kind: "Top", color: "#B8543F",
    }));
    
    // Six month stats
    window.SIX_MONTHS.views = data.footprint.total_views;
    window.SIX_MONTHS.likes = Math.round(data.footprint.total_views * 0.08);
    window.SIX_MONTHS.comments = Math.round(data.footprint.total_views * 0.03);
    
    // Footprint themes
    window.FOOTPRINT_THEMES = data.footprint.top_topics.slice(0, 5).map((t, i) => ({
      theme: t,
      count: Math.round(data.footprint.topic_scores[t] || 10),
      color: ["#B8543F", "#C7855B", "#8AA17A", "#A98ABF", "#C8924A"][i],
    }));
    
    // Consumption as platform breakdown
    window.FOOTPRINT_PLATFORMS = data.consumption.subscriptions.slice(0, 7).map((s, i) => ({
      name: s,
      hours: Math.round(300 - i * 35),
      pct: Math.round((300 - i * 35) / 15),
      kind: "subscription",
      color: ["#B8543F", "#C7855B", "#8AA17A", "#A98ABF", "#C8924A", "#6F8F5C", "#9C4434"][i],
    }));
    
    // Vault — clear Maya's entries for other profiles
    if (profileId !== "maya") {
      window.VAULTED = [];
    }
    
    // Heatmap from real day breakdown
    const dayMap = data.viral.day_breakdown;
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    window.HEATMAP = [
      { time: "6–10a",  vals: days.map(d => Math.round((dayMap[d] || 5) * 0.6 * 10) / 10) },
      { time: "10a–2p", vals: days.map(d => Math.round((dayMap[d] || 5) * 0.5 * 10) / 10) },
      { time: "2–6p",   vals: days.map(d => Math.round((dayMap[d] || 5) * 0.9 * 10) / 10) },
      { time: "6–10p",  vals: days.map(d => Math.round((dayMap[d] || 5) * 1.1 * 10) / 10) },
    ];
    
    // Global metrics
    window._burnoutScore = data.mirror.burnout_score;
    window._engagementSlope = data.mirror.engagement_slope;
    window._bestDay = data.viral.best_day;
    window._bestHour = data.viral.best_hour;
    window._concentrationRisk = data.footprint.concentration_risk;
    window._dominantCategory = data.footprint.dominant_category;
    window._consumption = data.consumption;
    
    console.log("✅ Profile loaded:", data.channel_name);
    
    if (window._onProfileChange) window._onProfileChange(profileId);
    
    return true;
  } catch (err) {
    console.warn("Backend not available:", err);
    return false;
  }
}

window.loadProfile = loadProfile;

// Auto-load on page load
loadProfile("maya");