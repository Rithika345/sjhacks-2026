// Vault — Live idea protection + similarity detection via backend
import { useState } from "react";
import { ViewHeader, PaperCard, LoadingBar } from "./atoms.jsx";
import { API_BASE_URL } from "../config.js";
import { VAULTED } from "../data.js";

export const VaultView = () => {
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaBody, setIdeaBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [vaultItems, setVaultItems] = useState(VAULTED || []);
  const [seeded, setSeeded] = useState(false);

  const onSeed = async () => {
    const resp = await fetch(API_BASE_URL + "/api/vault/seed", { method: "POST", credentials: "include" });
    await resp.json();
    setSeeded(true);
  };

  const onProtect = async () => {
    if (!ideaBody.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch(API_BASE_URL + "/api/vault", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaBody }),
      });
      const data = await resp.json();
      setResult(data);

      setVaultItems(prev => [{
        id: "v-live-" + Date.now(),
        title: ideaTitle || "Untitled Idea",
        body: ideaBody,
        hash: data.proof.hash,
        lockedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        daysLeft: 60,
        state: "fresh",
        similarity: data.similarity,
      }, ...prev]);

      setIdeaTitle("");
      setIdeaBody("");
    } catch (err) {
      console.error("Vault error:", err);
    }
    setLoading(false);
  };

  const simColor = (score) => score > 60 ? "var(--red)" : score > 30 ? "var(--amber)" : "var(--green)";
  const stateColor = { fresh: "var(--green)", aging: "var(--amber)", expiring: "var(--red)" };

  return (
    <div className="view-enter view-shell">
      <ViewHeader
        eyebrow="VAULT · Protect your ideas"
        title="Lock it before someone else ships it"
        sub="Cryptographic timestamp + semantic similarity detection. Your idea text never leaves your browser."
      />

      <div className="split-2-even">
        {/* Left: new idea input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <PaperCard style={{ padding: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>New idea</div>
            <input
              value={ideaTitle}
              onChange={e => setIdeaTitle(e.target.value)}
              placeholder="Give it a name…"
              style={{
                width: "100%", padding: "12px 16px", marginBottom: 12,
                background: "var(--cream-page)", border: "1px solid var(--rule-soft)",
                borderRadius: 4, fontFamily: "var(--serif)", fontSize: 17,
                color: "var(--ink)", outline: "none",
              }}
            />
            <textarea
              value={ideaBody}
              onChange={e => setIdeaBody(e.target.value)}
              placeholder="Describe the idea in detail. The more specific, the better the similarity detection…"
              style={{
                width: "100%", minHeight: 200, padding: "16px",
                background: "var(--cream-page)", border: "1px solid var(--rule-soft)",
                borderRadius: 4, fontFamily: "var(--serif)", fontSize: 15,
                lineHeight: 1.6, color: "var(--ink)", resize: "vertical", outline: "none",
              }}
            />
            {loading && <LoadingBar label="Extracting concepts and checking similarity…" style={{ marginTop: 16 }} />}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              {!seeded && (
                <button className="btn btn-ghost" onClick={onSeed}>Seed demo vault</button>
              )}
              {seeded && <span className="serif" style={{ fontSize: 12, color: "var(--green)", fontStyle: "italic" }}>✓ Vault seeded with 3 ideas</span>}
              <button className="btn btn-red" onClick={onProtect} disabled={loading || !ideaBody.trim()}>
                {loading ? "Analyzing…" : "🔒 Protect This Idea"}
              </button>
            </div>
          </PaperCard>

          {/* Similarity result */}
          {result && (
            <div style={{ animation: "scaleIn .45s ease-out" }}>
              <PaperCard style={{ padding: 28 }}>
                <div className="eyebrow" style={{ color: "var(--red)", marginBottom: 14 }}>Similarity Scan</div>
                <div className="grid-2" style={{ marginBottom: 16 }}>
                  <div style={{ padding: 18, background: "var(--cream-2)", border: "1px solid var(--rule-soft)", borderRadius: 4 }}>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>Overlap Score</div>
                    <div className="num serif" style={{ fontSize: 42, color: simColor(result.similarity.highest_similarity_percent), lineHeight: 1 }}>
                      {result.similarity.highest_similarity_percent}<span style={{ fontSize: 16, color: "var(--ink-mute)" }}>%</span>
                    </div>
                  </div>
                  <div style={{ padding: 18, background: "var(--cream-2)", border: "1px solid var(--rule-soft)", borderRadius: 4 }}>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>Concepts Extracted</div>
                    <div className="num serif" style={{ fontSize: 42, color: "var(--ink)", lineHeight: 1 }}>
                      {result.concepts_extracted}
                    </div>
                  </div>
                </div>

                {result.similarity.overlapping_themes && result.similarity.overlapping_themes.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Overlapping themes</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {result.similarity.overlapping_themes.map((t, i) => (
                        <span key={i} className="chip chip-red">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="serif" style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.5, fontStyle: "italic" }}>
                  {result.similarity.assessment}
                </div>

                {result.similarity.warning && (
                  <div style={{ marginTop: 12, padding: 12, background: "color-mix(in oklab, var(--red) 8%, var(--paper))", border: "1px solid color-mix(in oklab, var(--red) 20%, var(--rule))", borderRadius: 4 }}>
                    <span className="serif" style={{ fontSize: 13, color: "var(--red)" }}>⚠ {result.similarity.warning}</span>
                  </div>
                )}
              </PaperCard>

              {/* Proof certificate */}
              <PaperCard style={{ padding: 28, marginTop: 14 }}>
                <div className="eyebrow" style={{ marginBottom: 14 }}>Proof Certificate</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-mute)", wordBreak: "break-all", padding: 14, background: "var(--cream-2)", borderRadius: 4, border: "1px solid var(--rule-soft)", marginBottom: 12 }}>
                  {result.proof.hash}
                </div>
                <div className="grid-2">
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>Timestamp</div>
                    <div className="serif" style={{ fontSize: 14, color: "var(--ink-soft)" }}>{new Date(result.proof.timestamp).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>Action Deadline</div>
                    <div className="serif" style={{ fontSize: 14, color: "var(--amber)" }}>{new Date(result.proof.action_deadline).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>Expires</div>
                    <div className="serif" style={{ fontSize: 14, color: "var(--ink-soft)" }}>{new Date(result.proof.expires).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>Status</div>
                    <span className="chip chip-green">{result.proof.status}</span>
                  </div>
                </div>
                <div style={{ marginTop: 14, padding: 12, background: "var(--cream-2)", borderRadius: 4, border: "1px solid var(--rule-soft)" }}>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>JWT Token (tamper-proof)</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)", wordBreak: "break-all", maxHeight: 60, overflow: "hidden" }}>
                    {result.token}
                  </div>
                </div>
              </PaperCard>
            </div>
          )}
        </div>

        {/* Right: existing vault items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Protected ideas</div>
          {vaultItems.map(v => (
            <PaperCard key={v.id} style={{ padding: 22, borderLeft: `3px solid ${stateColor[v.state] || "var(--green)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h3 className="serif" style={{ fontSize: 17, color: "var(--ink)", margin: 0 }}>{v.title}</h3>
                <span className={`chip ${v.state === "fresh" ? "chip-green" : v.state === "aging" ? "chip-amber" : "chip-red"}`}>
                  {v.daysLeft}d left
                </span>
              </div>
              <p className="serif" style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.4, margin: "0 0 10px" }}>{v.body}</p>
              {v.similarity && v.similarity.highest_similarity_percent > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span className="sans" style={{ fontSize: 11, color: simColor(v.similarity.highest_similarity_percent) }}>
                    {v.similarity.highest_similarity_percent}% overlap detected
                  </span>
                </div>
              )}
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-faint)", wordBreak: "break-all" }}>
                {v.hash.slice(0, 32)}…
              </div>
              <div className="sans" style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 6 }}>Locked {v.lockedAt}</div>
            </PaperCard>
          ))}
        </div>
      </div>
    </div>
  );
};
