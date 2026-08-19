interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header
      style={{
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h1 style={{ fontSize: 15, fontWeight: 600, color: "#111827", lineHeight: 1.3, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.3, marginTop: 1 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>{actions}</div>}
    </header>
  );
}
