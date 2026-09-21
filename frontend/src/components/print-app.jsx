// Print-only app: renders every view stacked, each on its own page.
import { FootprintView } from "./footprint.jsx";
import { MirrorView } from "./mirror.jsx";
import { SandboxView } from "./sandbox.jsx";
import { VaultView } from "./vault.jsx";
import { CadenceView } from "./cadence.jsx";

const PrintCover = () => (
  <section className="print-page print-cover paper-grain">
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: 40 }}>
      <div style={{
        width: 72, height: 72, borderRadius: 8,
        background: "var(--red)", color: "#FBF6E8",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--serif)", fontSize: 42, fontWeight: 600,
        boxShadow: "0 6px 20px -8px rgba(184,84,63,.5)",
        marginBottom: 28,
      }}>5</div>
      <h1 className="serif" style={{ fontSize: 64, lineHeight: 1.02, margin: 0, letterSpacing: "-0.02em" }}>The Fifth Postulate</h1>
      <p className="serif" style={{ fontStyle: "italic", color: "var(--ink-mute)", fontSize: 22, marginTop: 14 }}>
        Parallel thoughts meet here.
      </p>
      <div style={{ width: 60, height: 1, background: "var(--rule)", margin: "36px auto" }}></div>
      <div className="sans" style={{ fontSize: 12, color: "var(--ink-mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
        Maya's Kitchen · Creative Manager Report
      </div>
    </div>
  </section>
);

const PrintViewPage = ({ label, sub, View }) => (
  <section className="print-page paper-grain" data-screen-label={label}>
    <div className="print-page-header">
      <h2 className="serif" style={{ fontSize: 22, margin: 0 }}>The Fifth Postulate</h2>
      <span className="serif" style={{ color: "var(--ink-faint)" }}>·</span>
      <span className="serif" style={{ fontStyle: "italic", color: "var(--ink-mute)", fontSize: 16 }}>{sub}</span>
      <span style={{ flex: 1 }}></span>
      <span className="sans" style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.16em", textTransform: "uppercase" }}>{label}</span>
    </div>
    <div className="print-page-body">
      <View />
    </div>
  </section>
);

const PRINT_VIEWS = [
  { label: "Footprint", sub: "Your Wrapped",       View: FootprintView },
  { label: "Mirror",    sub: "Creative health",    View: MirrorView },
  { label: "Sandbox",   sub: "Test any move",      View: SandboxView },
  { label: "Vault",     sub: "Protect your ideas", View: VaultView },
  { label: "Cadence",   sub: "Your rhythm",        View: CadenceView },
];

export const PrintApp = () => (
  <div className="print-root" style={{ background: "var(--cream-page)" }}>
    <PrintCover />
    {PRINT_VIEWS.map(v => (
      <PrintViewPage key={v.label} label={v.label} sub={v.sub} View={v.View} />
    ))}
  </div>
);
