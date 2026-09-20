// Sandbox — Live stress test via backend API

const { useState } = React;
const SANDBOX_API = window.API_BASE_URL;

const SandboxView = () => {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId] = useState("session-" + Date.now());

  const onRun = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      // Phase 1: Get structured risk report
      const resp = await fetch(SANDBOX_API + "/api/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ move: text }),
      });
      const data = await resp.json();
      setReport(data.report);
      setSubmitted(true);

      // Phase 2: Start the conversation
      const chatResp = await fetch(SANDBOX_API + "/api/sandbox/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, move: text, message: text }),
      });
      const chatData = await chatResp.json();
      setChatHistory([{ role: "assistant", content: chatData.response }]);
    } catch (err) {
      console.error("Sandbox error:", err);
    }
    setLoading(false);
  };

  const onChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: "user", content: msg }]);
    setChatLoading(true);
    try {
      const resp = await fetch(SANDBOX_API + "/api/sandbox/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: msg }),
      });
      const data = await resp.json();
      setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      console.error("Chat error:", err);
    }
    setChatLoading(false);
  };

  const reset = () => {
    setSubmitted(false);
    setReport(null);
    setChatHistory([]);
    setText("");
  };

  const riskColor = (score) => score > 60 ? "var(--red)" : score > 30 ? "var(--amber)" : "var(--green)";

  return (
    <div className="view-enter" style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 56px 80px", position: "relative" }}>
      <ViewHeader
        eyebrow="SANDBOX · Test any move"
        title="Try it on paper first"
        sub="Type a move. The provocateur won't tell you what to do — only what to think about."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 18 }}>
        {/* Left: input + report */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <PaperCard style={{ padding: 32, display: "flex", flexDirection: "column" }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>The proposed move</div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="I'm thinking about pivoting from cooking to travel content..."
              disabled={submitted}
              style={{
                minHeight: 160,
                background: "var(--cream-page)",
                border: "1px solid var(--rule-soft)",
                borderRadius: 4,
                padding: "18px 20px",
                fontFamily: "var(--serif)",
                fontSize: 18, lineHeight: 1.6,
                color: "var(--ink)",
                resize: "none", outline: "none",
                opacity: submitted ? 0.6 : 1,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 18, gap: 10 }}>
              {submitted && (
                <button className="btn btn-ghost" onClick={reset}>
                  <IconRefresh size={14}/> New Move
                </button>
              )}
              <button className="btn btn-red" onClick={onRun} disabled={loading || submitted || !text.trim()}>
                {loading ? "Analyzing…" : "Run Stress Test"}
              </button>
            </div>
          </PaperCard>

          {/* Risk Report */}
          {report && (
            <div style={{ animation: "scaleIn .45s ease-out" }}>
              <PaperCard style={{ padding: 28 }}>
                <div className="eyebrow" style={{ color: "var(--red)", marginBottom: 16 }}>Risk Assessment</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div style={{ padding: 18, background: "var(--cream-2)", border: "1px solid var(--rule-soft)", borderRadius: 4 }}>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>Cancel Risk</div>
                    <div className="num serif" style={{ fontSize: 42, color: riskColor(report.cancel_risk_score), lineHeight: 1 }}>
                      {report.cancel_risk_score}<span style={{ fontSize: 16, color: "var(--ink-mute)" }}>/100</span>
                    </div>
                  </div>
                  <div style={{ padding: 18, background: "var(--cream-2)", border: "1px solid var(--rule-soft)", borderRadius: 4 }}>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>Audience Retention</div>
                    <div className="num serif" style={{ fontSize: 42, color: "var(--ink)", lineHeight: 1 }}>
                      {report.audience_retention_estimate}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ padding: 16, background: "color-mix(in oklab, var(--red) 8%, var(--paper))", border: "1px solid color-mix(in oklab, var(--red) 20%, var(--rule))", borderRadius: 4 }}>
                    <div className="eyebrow" style={{ color: "var(--red)", marginBottom: 10 }}>Worst Case</div>
                    {report.worst_case.map((w, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <span className="serif" style={{ color: "var(--red)", flexShrink: 0 }}>—</span>
                        <span className="serif" style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.4 }}>{w}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: 16, background: "color-mix(in oklab, var(--green) 8%, var(--paper))", border: "1px solid color-mix(in oklab, var(--green) 20%, var(--rule))", borderRadius: 4 }}>
                    <div className="eyebrow" style={{ color: "var(--green)", marginBottom: 10 }}>Best Case</div>
                    {report.best_case.map((b, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <span className="serif" style={{ color: "var(--green)", flexShrink: 0 }}>—</span>
                        <span className="serif" style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.4 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 16, padding: 14, background: "var(--cream-2)", borderRadius: 4, border: "1px solid var(--rule-soft)" }}>
                  <span className="serif" style={{ fontStyle: "italic", fontSize: 14, color: "var(--ink-soft)" }}>
                    {report.execution_note}
                  </span>
                </div>
              </PaperCard>
            </div>
          )}
        </div>

        {/* Right: live conversation */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!submitted ? (
            <PaperCard style={{
              padding: 36, flex: 1, minHeight: 540,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              textAlign: "center",
              background: "repeating-linear-gradient(45deg, var(--paper) 0 12px, var(--cream-page) 12px 14px)",
            }}>
              <DecoTriangle size={48} style={{ opacity: 0.5, marginBottom: 18 }} />
              <h3 className="serif" style={{ fontSize: 22, color: "var(--ink-soft)", maxWidth: 320 }}>
                The right side is where the provocateur lives.
              </h3>
              <p className="serif" style={{ fontStyle: "italic", color: "var(--ink-mute)", marginTop: 14, maxWidth: 340, fontSize: 15 }}>
                Click <em>Run Stress Test</em> to begin. It won't grade you — it'll question you.
              </p>
            </PaperCard>
          ) : (
            <PaperCard style={{ padding: 28, flex: 1, display: "flex", flexDirection: "column", minHeight: 540 }}>
              <div className="eyebrow" style={{ color: "var(--red)", marginBottom: 16 }}>The provocateur</div>
              
              {/* Chat messages */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{
                    animation: `scaleIn .35s ease-out ${i * 0.05}s both`,
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "88%",
                  }}>
                    <div style={{
                      padding: "14px 18px",
                      borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                      background: msg.role === "user" ? "var(--cream-3)" : "var(--paper)",
                      border: `1px solid ${msg.role === "user" ? "var(--rule)" : "var(--red-pale)"}`,
                      borderLeft: msg.role === "assistant" ? "3px solid var(--red)" : "none",
                    }}>
                      <p className="serif" style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink)", margin: 0 }}>
                        {msg.content}
                      </p>
                    </div>
                    <div className="sans" style={{ fontSize: 10, color: "var(--ink-faint)", marginTop: 4, textAlign: msg.role === "user" ? "right" : "left" }}>
                      {msg.role === "user" ? "You" : "Provocateur"}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ alignSelf: "flex-start", padding: "14px 18px", background: "var(--paper)", border: "1px solid var(--red-pale)", borderLeft: "3px solid var(--red)", borderRadius: "12px 12px 12px 2px" }}>
                    <span className="serif" style={{ color: "var(--ink-mute)", fontStyle: "italic" }}>Thinking…</span>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && onChat()}
                  placeholder="Respond to the challenge…"
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    background: "var(--cream-page)",
                    border: "1px solid var(--rule-soft)",
                    borderRadius: 8,
                    fontFamily: "var(--serif)",
                    fontSize: 15, color: "var(--ink)",
                    outline: "none",
                  }}
                />
                <button className="btn btn-red" onClick={onChat} disabled={chatLoading || !chatInput.trim()}>
                  Send
                </button>
              </div>
            </PaperCard>
          )}
        </div>
      </div>

      <div className="serif" style={{ textAlign: "center", fontStyle: "italic", color: "var(--ink-mute)", fontSize: 14, marginTop: 20 }}>
        Powered by your real channel data. Every challenge references your actual metrics.
      </div>
    </div>
  );
};

window.SandboxView = SandboxView;