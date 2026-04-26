// Cadence — Rhythm analytics, no provocateur

const CadenceView = () => {
  // Use HEATMAP but show as bigger heatmap with engagement
  const bestSlots = [
    { rank: 1, day: "Sunday", time: "6–10p", eng: 9.4, posts: 6 },
    { rank: 2, day: "Saturday", time: "6–10p", eng: 8.6, posts: 5 },
    { rank: 3, day: "Sunday", time: "2–6p", eng: 8.1, posts: 4 },
  ];

  return (
    <div className="view-enter" style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 56px 80px", position: "relative" }}>
      <ViewHeader
        eyebrow="CADENCE · Your rhythm"
        title="When the room is listening"
        sub="A rhythm map. Quieter, more honest than analytics. No verdicts."
      />

      {/* Cross-view banner from Mirror */}
      <div className="card card-edge" style={{
        padding: "16px 22px",
        background: "color-mix(in oklab, var(--red) 8%, var(--paper))",
        borderColor: "color-mix(in oklab, var(--red) 28%, var(--rule))",
        marginBottom: 18,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 36, height: 36, flexShrink: 0,
          borderRadius: "50%",
          background: "color-mix(in oklab, var(--red) 18%, var(--paper))",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--red)",
        }}>
          <IconMirror size={18}/>
        </div>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ color: "var(--red)", marginBottom: 2 }}>FROM MIRROR</div>
          <div className="serif" style={{ fontSize: 16, color: "var(--ink)" }}>
            Your health score is in the red. Consider waiting until <span style={{ color: "var(--red)" }}>Sunday, May 17</span> for your next post — give yourself a meaningful break first.
          </div>
        </div>
        <button className="btn btn-ghost">Open Mirror →</button>
      </div>

      {/* Top row: Heatmap + Next window */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <PaperCard style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 className="serif">Your posting rhythm</h3>
            <span className="eyebrow">Engagement % · last 26 weeks</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "70px repeat(7, 1fr)", gap: 6, alignItems: "center" }}>
            <div></div>
            {DAYS.map(d => <div key={d} className="sans" style={{ fontSize: 11, color: "var(--ink-mute)", textAlign: "center", fontWeight: 500 }}>{d}</div>)}
            {HEATMAP.map((row, ri) => (
              <React.Fragment key={ri}>
                <div className="sans" style={{ fontSize: 11, color: "var(--ink-mute)", textAlign: "right", paddingRight: 8 }}>{row.time}</div>
                {row.vals.map((v, ci) => {
                  const intensity = v / 10;
                  const isPeak = v >= 9;
                  return (
                    <div key={ci} className="heat-cell" style={{
                      height: 52,
                      background: `color-mix(in oklab, var(--red) ${Math.round(intensity * 80)}%, var(--paper))`,
                      border: isPeak ? "1.5px solid var(--ink)" : "1px solid var(--rule-soft)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                      fontFamily: "var(--mono)", fontSize: 11,
                      color: intensity > 0.6 ? "#FBF6E8" : "var(--ink-soft)",
                      position: "relative",
                    }}>
                      <div style={{ fontWeight: 600 }}>{v.toFixed(1)}</div>
                      {isPeak && <div style={{ fontSize: 8, opacity: 0.85, letterSpacing: 1 }}>PEAK</div>}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </PaperCard>

        <PaperCard accent style={{ padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="eyebrow" style={{ color: "var(--red)", marginBottom: 12 }}>NEXT RECOMMENDED WINDOW</div>
            <div className="num serif" style={{ fontSize: 48, lineHeight: 1.05, color: "var(--ink)" }}>
              Sun, May 17
            </div>
            <div className="serif" style={{ fontSize: 22, color: "var(--red)", marginTop: 4 }}>7:42 PM</div>
            <p className="serif" style={{ fontStyle: "italic", color: "var(--ink-mute)", fontSize: 14, marginTop: 14, lineHeight: 1.55 }}>
              Three weeks from now. After Mirror's suggested break window — your audience is most receptive Sunday evenings, and your work will land softer with rest behind it.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="btn btn-red"><IconCalendar size={14}/> Add to calendar</button>
            <button className="btn btn-ghost">Reschedule</button>
          </div>
        </PaperCard>
      </div>

      {/* Best windows */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginTop: 16 }}>
        <PaperCard style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 className="serif">Best performing windows</h3>
            <span className="eyebrow">Top 3 by engagement</span>
          </div>
          {bestSlots.map((s, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "32px 1.4fr 1fr 1.5fr 80px",
              gap: 16, alignItems: "center",
              padding: "16px 0",
              borderTop: i === 0 ? "none" : "1px dashed var(--rule-soft)",
            }}>
              <div className="num serif" style={{ fontSize: 26, color: "var(--ink-faint)" }}>0{s.rank}</div>
              <div>
                <div className="serif" style={{ fontSize: 18, color: "var(--ink)" }}>{s.day}</div>
                <div className="sans" style={{ fontSize: 12, color: "var(--ink-mute)" }}>{s.time}</div>
              </div>
              <div className="num serif" style={{ fontSize: 22, color: "var(--red)" }}>{s.eng}<span style={{ fontSize: 12, color: "var(--ink-mute)", marginLeft: 2 }}>%</span></div>
              <div>
                <div style={{ height: 6, background: "var(--cream-3)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${(s.eng / 10) * 100}%`, height: "100%", background: "var(--red)", borderRadius: 999 }}/>
                </div>
                <div className="sans" style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}>across {s.posts} posts</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="chip">Recurring</span>
              </div>
            </div>
          ))}
        </PaperCard>

        <PaperCard style={{ padding: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Rhythm health</div>
          <div className="serif" style={{ fontSize: 28, lineHeight: 1.2, color: "var(--ink)", marginBottom: 6 }}>
            Erratic, trending toward declining
          </div>
          <p className="serif" style={{ fontStyle: "italic", color: "var(--ink-mute)", fontSize: 14, marginTop: 6, marginBottom: 18 }}>
            Your gaps between posts have become uneven over the last 8 weeks.
          </p>

          {/* Pattern visualization — 26 dots */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 60, marginBottom: 14 }}>
            {WEEKLY.map((w, i) => {
              const h = 14 + w.uploads * 7;
              const isErratic = i > 16;
              return (
                <div key={i} style={{
                  flex: 1, height: h,
                  background: isErratic ? "var(--red)" : "var(--cream-3)",
                  opacity: isErratic ? 0.55 + (i - 16) * 0.05 : 1,
                  borderRadius: 1,
                }}/>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="sans" style={{ fontSize: 11, color: "var(--ink-mute)" }}>26 wks ago</span>
            <span className="sans" style={{ fontSize: 11, color: "var(--ink-mute)" }}>Now</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 22 }}>
            {[
              { label: "Consistent", active: false },
              { label: "Erratic", active: true },
              { label: "Declining", active: false, soon: true },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "10px 12px",
                background: s.active ? "color-mix(in oklab, var(--red) 14%, var(--paper))" : "var(--cream-page)",
                border: `1px ${s.active ? "solid" : "dashed"} ${s.active ? "var(--red)" : "var(--rule-soft)"}`,
                borderRadius: 4,
                textAlign: "center",
                position: "relative",
              }}>
                <div className="serif" style={{ fontSize: 15, color: s.active ? "var(--red)" : "var(--ink-soft)" }}>{s.label}</div>
                {s.active && <div className="sans" style={{ fontSize: 9, color: "var(--red)", letterSpacing: 1.5, marginTop: 2 }}>YOU</div>}
                {s.soon && <div className="sans" style={{ fontSize: 9, color: "var(--ink-mute)", letterSpacing: 1.5, marginTop: 2 }}>NEXT</div>}
              </div>
            ))}
          </div>
        </PaperCard>
      </div>
    </div>
  );
};

window.CadenceView = CadenceView;
