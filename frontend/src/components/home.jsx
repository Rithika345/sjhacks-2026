// Home — landing view

export const HomeView = () => {
  return (
    <div className="view-enter" style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "64px 56px",
      position: "relative",
      textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 6,
        background: "var(--red)", color: "#FBF6E8",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--serif)", fontSize: 30, fontWeight: 500,
        boxShadow: "0 6px 18px -8px rgba(184,84,63,.6)",
        marginBottom: 36,
      }}>5</div>

      <h1 className="serif" style={{
        fontSize: 92, lineHeight: 1, fontWeight: 500,
        letterSpacing: "-0.02em", color: "var(--ink)",
        marginBottom: 22,
      }}>
        The Fifth Postulate
      </h1>

      <div className="serif" style={{
        fontStyle: "italic",
        fontSize: 24,
        color: "var(--ink-mute)",
        letterSpacing: "0.01em",
        maxWidth: 640,
      }}>
        Parallel thoughts meet here.
      </div>

      <div style={{
        marginTop: 48,
        height: 1, width: 80,
        background: "var(--rule)",
      }}/>

      <div className="eyebrow" style={{ marginTop: 28, color: "var(--ink-mute)" }}>
        A creative manager · for independent makers
      </div>
    </div>
  );
};
