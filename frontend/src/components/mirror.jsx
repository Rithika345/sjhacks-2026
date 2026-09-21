// Mirror — Live creative health from backend
import { useState, useEffect } from "react";
import { ViewHeader, PaperCard } from "./atoms.jsx";
import { API_BASE_URL } from "../config.js";

export const MirrorView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(API_BASE_URL + "/api/mirror", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.error) { setError(d.error); } else { setData(d); } setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="view-enter" style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 56px 80px" }}>
      <ViewHeader eyebrow="MIRROR · Creative health" title="Reading your vitals…" sub="Crunching your data through the analysis pipeline." />
      <PaperCard style={{ padding: 48, textAlign: "center" }}>
        <div className="serif" style={{ fontSize: 18, color: "var(--ink-mute)", fontStyle: "italic" }}>Running linear regression on engagement trends…</div>
      </PaperCard>
    </div>
  );

  if (error) return (
    <div className="view-enter" style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 56px 80px" }}>
      <PaperCard style={{ padding: 28 }}><div className="serif" style={{ color: "var(--red)" }}>Error: {error}. Make sure you're logged in.</div></PaperCard>
    </div>
  );

  const interp = data.interpretation;
  const burnout = data.metrics.burnout_score;
  const slope = data.metrics.engagement_slope;
  const weekly = data.metrics.weekly_data;
  const viral = data.viral;

  const healthColor = interp.health_label === "Critical" ? "var(--red)" : interp.health_label === "Warning" ? "var(--amber)" : "var(--green)";

  // Simple chart using divs
  const maxUploads = Math.max(...weekly.map(w => w.uploads));
  const maxEng = Math.max(...weekly.map(w => w.avg_engagement));

  return (
    <div className="view-enter" style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 56px 80px" }}>
      <ViewHeader
        eyebrow="MIRROR · Creative health"
        title="The curve you can't see from inside it"
        sub="Computed from your upload cadence and engagement trajectory. Interpreted, not prescribed."
      />

      {/* Health score + stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <PaperCard style={{ padding: 28, textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Health Status</div>
          <div className="num serif" style={{ fontSize: 48, color: healthColor, lineHeight: 1 }}>{interp.health_label}</div>
        </PaperCard>
        <PaperCard style={{ padding: 28, textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Burnout Score</div>
          <div className="num serif" style={{ fontSize: 48, color: healthColor, lineHeight: 1 }}>{burnout}<span style={{ fontSize: 18, color: "var(--ink-mute)" }}>/100</span></div>
        </PaperCard>
        <PaperCard style={{ padding: 28, textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Engagement Slope</div>
          <div className="num serif" style={{ fontSize: 36, color: slope < 0 ? "var(--red)" : "var(--green)", lineHeight: 1 }}>{slope > 0 ? "+" : ""}{slope}</div>
          <div className="serif" style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 6, fontStyle: "italic" }}>Linear regression</div>
        </PaperCard>
        <PaperCard style={{ padding: 28, textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Best Time to Post</div>
          <div className="serif" style={{ fontSize: 24, color: "var(--ink)", lineHeight: 1.2 }}>{viral.best_day}</div>
          <div className="serif" style={{ fontSize: 16, color: "var(--ink-soft)" }}>{viral.best_hour}</div>
        </PaperCard>
      </div>

      {/* Upload vs Engagement chart */}
      <PaperCard style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
          <h3 className="serif">Upload frequency vs. engagement rate</h3>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, background: "var(--red)", borderRadius: 2 }}></span><span className="sans" style={{ fontSize: 11, color: "var(--ink-mute)" }}>Uploads</span></span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 4, background: "var(--green)", borderRadius: 2 }}></span><span className="sans" style={{ fontSize: 11, color: "var(--ink-mute)" }}>Engagement %</span></span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 200 }}>
          {weekly.map((w, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", height: "100%" }}>
              {/* Engagement line dot */}
              <div style={{
                position: "absolute",
                bottom: `${(w.avg_engagement / maxEng) * 180}px`,
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--green)",
                border: "1px solid var(--paper)",
                zIndex: 2,
              }}></div>
              {/* Upload bar */}
              <div style={{
                position: "absolute", bottom: 0,
                width: "60%",
                height: `${(w.uploads / maxUploads) * 140}px`,
                background: "var(--red)",
                borderRadius: "2px 2px 0 0",
                opacity: 0.7,
              }}></div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span className="sans" style={{ fontSize: 10, color: "var(--ink-faint)" }}>{weekly[0]?.week}</span>
          <span className="sans" style={{ fontSize: 10, color: "var(--ink-faint)" }}>{weekly[weekly.length-1]?.week}</span>
        </div>
      </PaperCard>

      {/* Claude interpretation */}
      <PaperCard accent style={{ padding: "32px 36px", background: "linear-gradient(180deg, var(--cream-2), var(--cream-3))" }}>
        <div className="eyebrow" style={{ color: "var(--red)", marginBottom: 14 }}>Analysis · computed by pipeline, interpreted by AI</div>
        <div className="serif" style={{ fontSize: 18, lineHeight: 1.6, color: "var(--ink)", marginBottom: 16 }}>{interp.pattern}</div>
        <div className="serif" style={{ fontSize: 16, lineHeight: 1.5, color: "var(--ink-soft)", marginBottom: 16 }}>{interp.interpretation}</div>
        <div style={{ padding: 16, background: "var(--paper)", border: "1px solid var(--rule-soft)", borderRadius: 4, marginBottom: 12 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Recommendation</div>
          <div className="serif" style={{ fontSize: 15, color: "var(--ink)" }}>{interp.recommendation}</div>
        </div>
        <div style={{ padding: 16, background: "var(--paper)", border: "1px solid var(--rule-soft)", borderRadius: 4 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Viral Insight</div>
          <div className="serif" style={{ fontSize: 15, color: "var(--ink)" }}>{interp.viral_insight}</div>
        </div>
      </PaperCard>

      {/* Day breakdown */}
      <PaperCard style={{ padding: 28, marginTop: 20 }}>
        <h3 className="serif" style={{ marginBottom: 18 }}>Engagement by day of week</h3>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 160, gap: 12 }}>
          {Object.entries(viral.day_breakdown).map(([day, eng]) => {
            const maxDayEng = Math.max(...Object.values(viral.day_breakdown));
            const isBest = day === viral.best_day;
            return (
              <div key={day} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 6 }}>
                <div className="num sans" style={{ fontSize: 11, color: isBest ? "var(--red)" : "var(--ink-mute)" }}>{eng}%</div>
                <div style={{
                  width: "70%",
                  height: `${(eng / maxDayEng) * 120}px`,
                  background: isBest ? "var(--red)" : "var(--ink-faint)",
                  borderRadius: "2px 2px 0 0",
                  border: isBest ? "1px solid var(--red-deep)" : "none",
                }}></div>
                <div className="sans" style={{ fontSize: 12, color: isBest ? "var(--red)" : "var(--ink-soft)", fontWeight: isBest ? 600 : 400 }}>{day.slice(0,3)}</div>
              </div>
            );
          })}
        </div>
      </PaperCard>
    </div>
  );
};
