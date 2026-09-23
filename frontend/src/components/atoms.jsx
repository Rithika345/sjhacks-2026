// Reusable atoms: ViewHeader, Card, Eyebrow, Trend, Sparkline, etc.
import { IconArrowUp, IconArrowDown } from "./icons.jsx";

export const ViewHeader = ({ eyebrow, title, sub, right }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 28 }}>
    <div>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 10 }}>{eyebrow}</div>}
      <h1 className="serif" style={{ fontSize: 42, lineHeight: 1.04, letterSpacing: "-0.015em" }}>{title}</h1>
      {sub && <div className="serif" style={{ fontStyle: "italic", color: "var(--ink-mute)", marginTop: 12, fontSize: 17 }}>{sub}</div>}
    </div>
    {right}
  </div>
);

// Indeterminate loading bar — used anywhere a fetch/API call is in flight
// so the page never looks frozen while waiting on a real network request.
// `label` is optional caption text shown above the bar.
export const LoadingBar = ({ label, style }) => (
  <div style={{ width: "100%", ...style }}>
    {label && (
      <div className="serif" style={{ fontSize: 13, color: "var(--ink-mute)", fontStyle: "italic", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <span className="loading-dot" />
        {label}
      </div>
    )}
    <div className="loading-bar" />
  </div>
);

export const PaperCard = ({ children, style, padding = 24, accent = false, className = "" }) => (
  <div className={`card card-edge ${className}`} style={{
    background: accent ? "var(--cream-2)" : "var(--paper)",
    padding,
    ...style,
  }}>
    {children}
  </div>
);

// Trend arrow + percent
export const Trend = ({ value, suffix = "%" }) => {
  const positive = value >= 0;
  return (
    <span className="sans" style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 12, fontWeight: 600,
      color: positive ? "var(--green)" : "var(--red)",
    }}>
      {positive ? <IconArrowUp size={11} stroke={2.4} /> : <IconArrowDown size={11} stroke={2.4} />}
      {Math.abs(value)}{suffix}
    </span>
  );
};

export const Stat = ({ label, value, trend, suffix }) => (
  <div>
    <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <div className="num" style={{ fontSize: 56, lineHeight: 1, color: "var(--ink)" }}>
        {value}
        {suffix && <span style={{ fontSize: 22, color: "var(--ink-mute)", marginLeft: 4 }}>{suffix}</span>}
      </div>
    </div>
    {trend !== undefined && <div style={{ marginTop: 6 }}><Trend value={trend} /></div>}
  </div>
);

// Hand-drawn sparkline using rough-ish path generation
export const Sparkline = ({ data, width = 300, height = 70, color = "var(--red)", fill = true }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 10) - 5]);

  // hand-drawn jitter
  const jittered = pts.map(([x, y], i) => {
    const j = i === 0 || i === pts.length - 1 ? 0 : (Math.sin(i * 12.9898) * 43758.5453 % 1) * 1.6;
    return [x, y + j];
  });

  let d = `M ${jittered[0][0]} ${jittered[0][1]}`;
  for (let i = 1; i < jittered.length; i++) {
    const [px, py] = jittered[i - 1];
    const [x, y] = jittered[i];
    const cx = (px + x) / 2;
    d += ` Q ${cx} ${py} ${x} ${y}`;
  }

  let fillD = d;
  if (fill) fillD += ` L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {fill && <path d={fillD} fill={color} opacity="0.12" />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* end dot */}
      <circle cx={jittered[jittered.length - 1][0]} cy={jittered[jittered.length - 1][1]} r="2.6" fill={color} />
    </svg>
  );
};

// Hand-drawn line + bar combo chart
export const RoughChart = ({ weeks, width = 720, height = 240 }) => {
  const padL = 36, padR = 36, padT = 14, padB = 28;
  const W = width - padL - padR;
  const H = height - padT - padB;
  const maxUploads = Math.max(...weeks.map(w => w.uploads));
  const maxEng = Math.max(...weeks.map(w => w.engagement));
  const minEng = Math.min(...weeks.map(w => w.engagement));
  const stepX = W / (weeks.length - 1);
  const barW = Math.max(6, stepX * 0.55);

  const linePts = weeks.map((w, i) => [
    padL + i * stepX,
    padT + H - ((w.engagement - minEng) / (maxEng - minEng || 1)) * (H - 10),
  ]);

  // jitter for hand-drawn feel
  const jit = (i, base) => base + (Math.sin(i * 91.7 + 3.1) * 0.5);
  let d = `M ${linePts[0][0]} ${linePts[0][1]}`;
  for (let i = 1; i < linePts.length; i++) {
    const [px, py] = linePts[i - 1];
    const [x, y] = linePts[i];
    const cx = (px + x) / 2;
    d += ` Q ${cx} ${jit(i, py)} ${x} ${jit(i, y)}`;
  }

  // grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((g, i) => (
    <line key={i} x1={padL} x2={padL + W} y1={padT + g * H} y2={padT + g * H}
          stroke="var(--rule-soft)" strokeWidth="1" strokeDasharray="2 4" />
  ));

  // labels (months)
  const monthLabels = ["Nov","Dec","Jan","Feb","Mar","Apr"];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block", maxWidth: "100%" }}>
      {gridLines}
      {/* y-axis labels */}
      <text x={padL - 8} y={padT + 4} textAnchor="end" fontSize="10" fill="var(--ink-mute)" fontFamily="var(--sans)">High</text>
      <text x={padL - 8} y={padT + H} textAnchor="end" fontSize="10" fill="var(--ink-mute)" fontFamily="var(--sans)">Low</text>

      {/* bars: uploads */}
      {weeks.map((w, i) => {
        const x = padL + i * stepX - barW/2;
        const h = (w.uploads / maxUploads) * (H * 0.55);
        return (
          <rect key={i} x={x} y={padT + H - h} width={barW} height={h}
                rx="1.5" fill="var(--cream-3)" opacity="0.9" />
        );
      })}

      {/* engagement line — hand-drawn */}
      <path d={d} fill="none" stroke="var(--red)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 1px 0 rgba(184,84,63,.15))" }}/>
      {/* dots */}
      {linePts.filter((_, i) => i % 4 === 0 || i === linePts.length - 1).map(([x, y], i) => (
        <circle key={i} cx={x} cy={jit(i*4, y)} r="2.4" fill="var(--red)" />
      ))}

      {/* x labels */}
      {monthLabels.map((m, i) => {
        const idx = Math.round((i / (monthLabels.length - 1)) * (weeks.length - 1));
        const x = padL + idx * stepX;
        return (
          <text key={m} x={x} y={height - 10} textAnchor="middle" fontSize="10"
                fill="var(--ink-mute)" fontFamily="var(--sans)">{m}</text>
        );
      })}

      {/* legend */}
      <g transform={`translate(${padL}, ${padT - 4})`}>
        <rect x="0" y="-8" width="10" height="6" fill="var(--cream-3)" rx="1"/>
        <text x="14" y="-3" fontSize="10" fill="var(--ink-mute)" fontFamily="var(--sans)">Uploads / wk</text>
        <line x1="92" y1="-5" x2="106" y2="-5" stroke="var(--red)" strokeWidth="2"/>
        <text x="110" y="-3" fontSize="10" fill="var(--ink-mute)" fontFamily="var(--sans)">Engagement %</text>
      </g>
    </svg>
  );
};

// Donut chart, hand-drawn style
export const Donut = ({ data, size = 200, thickness = 28 }) => {
  const r = size/2 - thickness/2 - 2;
  const cx = size/2, cy = size/2;
  let acc = 0;
  const total = data.reduce((s, d) => s + d.pct, 0);

  const arcs = data.map((d, i) => {
    const start = acc / total * Math.PI * 2 - Math.PI/2;
    const end = (acc + d.pct) / total * Math.PI * 2 - Math.PI/2;
    acc += d.pct;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = (end - start) > Math.PI ? 1 : 0;
    return { d, path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}` };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--cream-3)" strokeWidth={thickness - 2}/>
      {arcs.map((a, i) => (
        <path key={i} d={a.path} fill="none" stroke={a.d.color}
              strokeWidth={thickness} strokeLinecap="butt" />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="var(--serif)" fontSize="22" fill="var(--ink)">{data.length}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontFamily="var(--sans)" fontSize="10" fill="var(--ink-mute)" letterSpacing="1.5">CATEGORIES</text>
    </svg>
  );
};
