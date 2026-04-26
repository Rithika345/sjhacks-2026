// Footprint — Live analysis from backend

const { useState: fUseState, useEffect: fUseEffect } = React;
const FP_API = "http://localhost:8000";

const fmt = (n) => {
  if (n >= 1e6) return (n/1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n/1e3).toFixed(1) + "K";
  return n.toLocaleString();
};

const FootprintView = () => {
  const [data, setData] = fUseState(null);
  const [loading, setLoading] = fUseState(true);
  const [error, setError] = fUseState(null);

  fUseEffect(() => {
    setLoading(true);
    fetch(FP_API + "/api/footprint")
      .then(r => r.json())
      .then(d => { if (d.error) { setError(d.error); } else { setData(d); } setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [window._currentProfile]);

  if (loading) return (
    <div className="view-enter" style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 56px 80px" }}>
      <ViewHeader eyebrow="FOOTPRINT · Your Wrapped" title="Reading your digital footprint…" sub="Running view-weighted topic analysis and category clustering." />
      <PaperCard style={{ padding: 48, textAlign: "center" }}>
        <div className="serif" style={{ fontSize: 18, color: "var(--ink-mute)", fontStyle: "italic" }}>Analyzing content across {window.MAYA.name}'s channel…</div>
      </PaperCard>
    </div>
  );

  if (error) return (
    <div className="view-enter" style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 56px 80px" }}>
      <PaperCard style={{ padding: 28 }}><div className="serif" style={{ color: "var(--red)" }}>Error: {error}. Make sure you're logged in.</div></PaperCard>
    </div>
  );

  const metrics = data.metrics;
  const interp = data.interpretation;
  const consumption = data.consumption;
  const highlights = data.highlights;
  const catColors = { food_cooking: "#C7855B", lifestyle_personal: "#A98ABF", challenge_entertainment: "#B8543F", tech_review: "#8AA17A", other: "#8A7868" };

  return (
    <div className="view-enter" style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 56px 80px" }}>
      <ViewHeader
        eyebrow={`FOOTPRINT · ${data.channel_name}`}
        title="The shape you've left behind"
        sub="View-weighted topic analysis, content concentration risk, and consumption gap detection."
        right={
          <div style={{ textAlign: "right" }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Total Views</div>
            <div className="serif" style={{ fontSize: 24, color: "var(--ink-soft)" }}>{fmt(metrics.total_views)}</div>
            <div className="sans" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{metrics.total_videos} videos · {fmt(metrics.avg_views)} avg</div>
          </div>
        }
      />

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <PaperCard style={{ padding: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Concentration Risk</div>
          <div className="num serif" style={{ fontSize: 48, color: metrics.concentration_risk > 70 ? "var(--red)" : metrics.concentration_risk > 40 ? "var(--amber)" : "var(--green)", lineHeight: 1 }}>
            {metrics.concentration_risk}<span style={{ fontSize: 18, color: "var(--ink-mute)" }}>%</span>
          </div>
          <div style={{ height: 6, background: "var(--cream-3)", borderRadius: 999, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${metrics.concentration_risk}%`, height: "100%", background: metrics.concentration_risk > 70 ? "var(--red)" : "var(--amber)", borderRadius: 999 }}></div>
          </div>
          <div className="serif" style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 8, fontStyle: "italic" }}>
            Dominant: {metrics.dominant_category.replace("_", " ")}
          </div>
        </PaperCard>

        <PaperCard style={{ padding: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Content Breakdown</div>
          {Object.entries(metrics.category_breakdown).filter(([k,v]) => v > 0).map(([cat, pct]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: catColors[cat] || "#8A7868" }}></div>
              <span className="serif" style={{ fontSize: 13, color: "var(--ink-soft)", flex: 1 }}>{cat.replace("_", " ")}</span>
              <span className="num serif" style={{ fontSize: 13, color: "var(--ink)" }}>{pct}%</span>
            </div>
          ))}
        </PaperCard>

        <PaperCard style={{ padding: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>What You Consume</div>
          <div className="serif" style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 8 }}>{consumption.liked_video_count} liked videos</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {consumption.liked_topics.map((t, i) => (
              <span key={i} className="chip">{t}</span>
            ))}
          </div>
          <div className="eyebrow" style={{ marginTop: 12, marginBottom: 6 }}>Subscriptions</div>
          <div className="serif" style={{ fontSize: 12, color: "var(--ink-mute)", lineHeight: 1.5 }}>
            {consumption.subscriptions.join(" · ")}
          </div>
        </PaperCard>
      </div>

      {/* Topics */}
      <PaperCard style={{ padding: 28, marginBottom: 20 }}>
        <h3 className="serif" style={{ marginBottom: 18 }}>View-weighted topics</h3>
        <div className="serif" style={{ fontStyle: "italic", fontSize: 13, color: "var(--ink-mute)", marginBottom: 16 }}>
          Topics are weighted by the view count of videos they appear in. A tag on a viral video defines your brand more than a tag on a flop.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {metrics.top_topics.map((topic, i) => {
            const score = metrics.topic_scores[topic] || 0;
            const maxScore = Math.max(...Object.values(metrics.topic_scores));
            return (
              <div key={topic} style={{ display: "grid", gridTemplateColumns: "140px 1fr 60px", gap: 14, alignItems: "center" }}>
                <span className="serif" style={{ fontSize: 15, color: "var(--ink)" }}>{topic}</span>
                <div style={{ height: 14, background: "var(--cream-2)", border: "1px solid var(--rule-soft)", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, right: "auto", width: `${(score / maxScore) * 100}%`, background: i === 0 ? "var(--red)" : "var(--red-soft)" }}></div>
                </div>
                <span className="num serif" style={{ fontSize: 14, color: "var(--ink-soft)", textAlign: "right" }}>{score.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      </PaperCard>

      {/* Top and bottom performers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <PaperCard style={{ padding: 28 }}>
          <h3 className="serif" style={{ marginBottom: 14, color: "var(--green)" }}>Top performers</h3>
          {highlights.top_performers.map((v, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: i === 0 ? "none" : "1px dashed var(--rule-soft)" }}>
              <div style={{ flex: 1 }}>
                <div className="serif" style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.3 }}>{v.title}</div>
                <div className="sans" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{fmt(v.views)} views</div>
              </div>
              <span className="chip chip-green">{v.engagement}%</span>
            </div>
          ))}
        </PaperCard>
        <PaperCard style={{ padding: 28 }}>
          <h3 className="serif" style={{ marginBottom: 14, color: "var(--red)" }}>Underperformers</h3>
          {highlights.bottom_performers.map((v, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: i === 0 ? "none" : "1px dashed var(--rule-soft)" }}>
              <div style={{ flex: 1 }}>
                <div className="serif" style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.3 }}>{v.title}</div>
                <div className="sans" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{fmt(v.views)} views</div>
              </div>
              <span className="chip chip-red">{v.engagement}%</span>
            </div>
          ))}
        </PaperCard>
      </div>

      {/* Claude interpretation */}
      <PaperCard accent style={{ padding: "32px 36px", background: "linear-gradient(180deg, var(--cream-2), var(--cream-3))" }}>
        <div className="eyebrow" style={{ color: "var(--red)", marginBottom: 14 }}>AI Interpretation · grounded in your computed metrics</div>
        <div className="serif" style={{ fontSize: 18, lineHeight: 1.6, color: "var(--ink)", marginBottom: 14 }}>{interp.topics_summary}</div>
        <div className="serif" style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink-soft)", marginBottom: 14 }}>{interp.concentration_risk_note}</div>

        <div style={{ padding: 16, background: "var(--paper)", border: "1px solid var(--rule-soft)", borderRadius: 4, marginBottom: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Overton Window</div>
          <div className="serif" style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.5 }}>{interp.overton_window}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div style={{ padding: 16, background: "var(--paper)", border: "1px solid var(--rule-soft)", borderRadius: 4 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Audience expects</div>
            {interp.audience_expects.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span className="serif" style={{ color: "var(--green)" }}>✓</span>
                <span className="serif" style={{ fontSize: 14, color: "var(--ink-soft)" }}>{e}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 16, background: "var(--paper)", border: "1px solid var(--rule-soft)", borderRadius: 4 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Cancel risk flags</div>
            {interp.cancel_risk_flags.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span className="serif" style={{ color: "var(--red)" }}>⚠</span>
                <span className="serif" style={{ fontSize: 14, color: "var(--ink-soft)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {interp.consumption_gap && (
          <div style={{ padding: 16, background: "color-mix(in oklab, var(--amber) 8%, var(--paper))", border: "1px solid color-mix(in oklab, var(--amber) 20%, var(--rule))", borderRadius: 4 }}>
            <div className="eyebrow" style={{ color: "var(--amber)", marginBottom: 6 }}>Consumption Gap</div>
            <div className="serif" style={{ fontSize: 15, color: "var(--ink)" }}>{interp.consumption_gap}</div>
          </div>
        )}
      </PaperCard>
    </div>
  );
};

window.FootprintView = FootprintView;
window.fmt = fmt;