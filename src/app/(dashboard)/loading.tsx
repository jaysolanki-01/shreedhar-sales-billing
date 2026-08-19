export default function Loading() {
  return (
    <div style={{ padding: "24px 24px", maxWidth: 800, margin: "0 auto" }}>
      {/* Header skeleton */}
      <div style={{ height: 20, width: 120, borderRadius: 6, background: "#F3F4F6", marginBottom: 24 }} />
      {/* Row skeletons */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F3F4F6", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 13, width: `${50 + (i % 3) * 20}%`, borderRadius: 4, background: "#F3F4F6" }} />
          </div>
          <div style={{ height: 13, width: 60, borderRadius: 4, background: "#F3F4F6" }} />
        </div>
      ))}
    </div>
  );
}
