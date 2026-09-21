// App shell — sidebar, topbar, view router, profile switcher
import { useState, useEffect, useCallback } from "react";
import {
  IconHome, IconFootprint, IconMirror, IconSandbox, IconVault, IconCadence,
  IconSun, IconMoon,
} from "./icons.jsx";
import { HomeView } from "./home.jsx";
import { FootprintView } from "./footprint.jsx";
import { MirrorView } from "./mirror.jsx";
import { SandboxView } from "./sandbox.jsx";
import { VaultView } from "./vault.jsx";
import { CadenceView } from "./cadence.jsx";
import { MAYA, liveState, loadProfile, setOnProfileChange, PROFILES } from "../data.js";

const THEME_STORAGE_KEY = "fifth-postulate-theme";

const NAV = [
  { id: "home",      label: "Home",      sub: "Parallel thoughts",  Icon: IconHome },
  { id: "footprint", label: "Footprint", sub: "Your Wrapped",       Icon: IconFootprint },
  { id: "mirror",    label: "Mirror",    sub: "Creative health",    Icon: IconMirror },
  { id: "sandbox",   label: "Sandbox",   sub: "Test any move",      Icon: IconSandbox },
  { id: "vault",     label: "Vault",     sub: "Protect your ideas", Icon: IconVault },
  { id: "cadence",   label: "Cadence",   sub: "Your rhythm",        Icon: IconCadence },
];

const PROFILE_COLORS = {
  maya: "#C7855B",
  gamerz: "#6B8FD4",
  techtara: "#8AA17A",
};

const PROFILE_INITIALS = {
  maya: "M",
  gamerz: "G",
  techtara: "T",
};

const ProfileSwitcher = ({ current, onSwitch, loading }) => (
  <div style={{
    display: "flex", gap: 6, padding: "8px 12px",
    background: "var(--cream-2)", border: "1px solid var(--rule-soft)",
    borderRadius: 8,
  }}>
    <span className="eyebrow" style={{ alignSelf: "center", marginRight: 8 }}>Demo Profile</span>
    {Object.entries(PROFILES).map(([id, name]) => (
      <button
        key={id}
        onClick={() => onSwitch(id)}
        disabled={loading}
        style={{
          all: "unset", cursor: loading ? "wait" : "pointer",
          padding: "6px 14px", borderRadius: 6,
          background: current === id ? PROFILE_COLORS[id] : "transparent",
          color: current === id ? "#FBF6E8" : "var(--ink-soft)",
          fontFamily: "var(--sans)", fontSize: 12, fontWeight: 600,
          border: current === id ? "none" : "1px solid var(--rule-soft)",
          transition: "all .2s",
          opacity: loading ? 0.5 : 1,
        }}
      >
        {name}
      </button>
    ))}
    {loading && <span className="sans" style={{ fontSize: 11, color: "var(--ink-mute)", alignSelf: "center", marginLeft: 8 }}>Loading…</span>}
  </div>
);

const Sidebar = ({ active, onChange, profile }) => (
  <aside className="sidebar paper-grain" style={{
    width: 240, flexShrink: 0,
    height: "100vh",
    position: "sticky", top: 0,
    display: "flex", flexDirection: "column",
    padding: "26px 16px 24px",
  }}>
    <div style={{ padding: "0 8px 24px", borderBottom: "1px dashed var(--rule)", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 4, flexShrink: 0,
          background: "var(--red)", color: "#FBF6E8",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--serif)", fontSize: 18, fontWeight: 600,
          boxShadow: "0 2px 6px -2px rgba(184,84,63,.5)",
        }}>5</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="serif" style={{ fontSize: 15, lineHeight: 1.1, color: "var(--ink)", whiteSpace: "nowrap" }}>The Fifth</div>
          <div className="serif" style={{ fontSize: 15, lineHeight: 1.1, color: "var(--ink)", fontStyle: "italic", whiteSpace: "nowrap" }}>Postulate</div>
        </div>
      </div>
    </div>

    <div className="eyebrow" style={{ padding: "0 12px 10px" }}>Workspace</div>
    <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {NAV.map(n => {
        const Ic = n.Icon;
        return (
          <div key={n.id}
               className={`nav-item ${active === n.id ? "active" : ""}`}
               onClick={() => onChange(n.id)}>
            <span className="nav-icon"><Ic /></span>
            <div className="nav-label-row">
              <span>{n.label}</span>
              <span className="nav-sub">{n.sub}</span>
            </div>
          </div>
        );
      })}
    </nav>

    <div style={{ marginTop: "auto", padding: 14, background: "var(--paper)", borderRadius: 8, border: "1px solid var(--rule-soft)" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: `linear-gradient(135deg, ${PROFILE_COLORS[profile]}88, ${PROFILE_COLORS[profile]})`,
          color: "#FBF6E8", display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--serif)", fontSize: 16, fontWeight: 600,
        }}>{PROFILE_INITIALS[profile]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="serif" style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.1 }}>{MAYA.name}</div>
          <div className="sans" style={{ fontSize: 11, color: "var(--ink-mute) " }}>
            {liveState.burnoutScore != null ? `Burnout: ${liveState.burnoutScore}/100` : "Loading..."}
          </div>
        </div>
      </div>
    </div>
  </aside>
);

const ThemeToggle = ({ dark, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    title={dark ? "Switch to light theme" : "Switch to dark theme"}
    style={{
      all: "unset", cursor: "pointer", boxSizing: "border-box",
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 36, height: 36, borderRadius: 8,
      border: "1px solid var(--rule-soft)", color: "var(--ink-soft)",
    }}
  >
    {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
  </button>
);

const TopBar = ({ active, profile, onProfileSwitch, profileLoading, darkMode, onToggleDarkMode }) => {
  const view = NAV.find(n => n.id === active);
  return (
    <div className="topbar" style={{
      height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 56px",
      position: "sticky", top: 0, zIndex: 10,
      backdropFilter: "blur(6px)",
      background: "color-mix(in oklab, var(--cream-page) 88%, transparent)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2 className="serif" style={{ fontSize: 22 }}>The Fifth Postulate</h2>
        <span className="serif" style={{ color: "var(--ink-faint)" }}>·</span>
        <span className="serif" style={{ fontStyle: "italic", color: "var(--ink-mute)", fontSize: 16 }}>{view?.sub}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ThemeToggle dark={darkMode} onToggle={onToggleDarkMode} />
        <ProfileSwitcher current={profile} onSwitch={onProfileSwitch} loading={profileLoading} />
      </div>
    </div>
  );
};

const getInitialDarkMode = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark";
  } catch {
    // localStorage unavailable (private browsing, disabled storage, etc.) —
    // just start in light mode rather than failing to load.
    return false;
  }
};

export const App = () => {
  const [active, setActive] = useState("home");
  const [profile, setProfile] = useState("maya");
  const [profileLoading, setProfileLoading] = useState(false);
  const [dataVersion, setDataVersion] = useState(0); // forces re-render
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    try {
      localStorage.setItem(THEME_STORAGE_KEY, darkMode ? "dark" : "light");
    } catch {
      // theme just won't persist across reloads; not worth failing over
    }
  }, [darkMode]);

  // Register callback so data.js can trigger re-render, then kick off the
  // initial demo-profile load (moved here from a module-level side effect in
  // data.js, so importing the data module never has a network side effect).
  useEffect(() => {
    setOnProfileChange((newProfile) => {
      setProfile(newProfile);
      setDataVersion(v => v + 1);
      setProfileLoading(false);
    });
    loadProfile("maya");
  }, []);

  const handleProfileSwitch = useCallback(async (profileId) => {
    if (profileId === profile || profileLoading) return;
    setProfileLoading(true);
    await loadProfile(profileId);
  }, [profile, profileLoading]);

  const ViewComponent = {
    home: HomeView,
    footprint: FootprintView,
    mirror: MirrorView,
    sandbox: SandboxView,
    vault: VaultView,
    cadence: CadenceView,
  }[active];

  return (
    <div className="paper-grain" style={{ display: "flex", minHeight: "100vh", background: "var(--cream-page)" }}>
      <Sidebar active={active} onChange={setActive} profile={profile} />
      <main style={{ flex: 1, minWidth: 0 }} data-screen-label={NAV.find(n => n.id === active)?.label}>
        <TopBar
          active={active}
          profile={profile}
          onProfileSwitch={handleProfileSwitch}
          profileLoading={profileLoading}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(d => !d)}
        />
        <div key={`${active}-${dataVersion}`}>
          <ViewComponent />
        </div>
      </main>
    </div>
  );
};
