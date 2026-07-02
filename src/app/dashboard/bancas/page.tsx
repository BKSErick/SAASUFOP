/* =========================================================
   Bancas / CalendÃƒÆ’Ã‚Â¡rio (server) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â port de page-others.jsx::Bancas
   ========================================================= */
import { Card, Pill, Btn } from "@/components/ui/primitives";
import { Ico } from "@/components/icons";
import { getBancas, getDashboardKpis, HOJE } from "@/lib/data";
import type { Banca } from "@/types/domain";

export default async function BancasPage() {
  const [bancas, kpis] = await Promise.all([getBancas(), getDashboardKpis()]);

  const calendarYear = HOJE.getFullYear();
  const calendarMonth = HOJE.getMonth();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const today = HOJE.getDate();
  const monthLabel = HOJE.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  const bancasByDay: Record<number, Banca[]> = {};
  bancas.forEach((b) => {
    const d = new Date(b.data);
    if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth) {
      const day = d.getDate();
      (bancasByDay[day] = bancasByDay[day] || []).push(b);
    }
  });

  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>Bancas</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{kpis.bancasAgendadas} agendadas Ãƒâ€šÃ‚Â· {kpis.proximasDefesas} defesas em 6 meses</p>
        </div>
        <Btn variant="primary" size="sm" icon={Ico.plus({ size: 13 })} disabled title="Modulo de bancas pendente">Agendar banca</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "var(--d-gap)" }}>
        <Card padding={0}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--divider)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>{monthLabel}</h3>
            <div style={{ display: "flex", gap: 4 }}>
              <Btn variant="ghost" size="sm" style={{ padding: 6 }} disabled title="Navegacao de calendario pendente"><span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>{Ico.chevron({ size: 14 })}</span></Btn>
              <Btn variant="ghost" size="sm" disabled title="Navegacao de calendario pendente">Hoje</Btn>
              <Btn variant="ghost" size="sm" style={{ padding: 6 }} disabled title="Navegacao de calendario pendente">{Ico.chevron({ size: 14 })}</Btn>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0 }}>
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "SÃƒÆ’Ã‚Â¡b"].map((d, i) => (
              <div key={i} style={{ padding: "8px 10px", fontSize: 10.5, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid var(--divider)" }}>{d}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - firstDay + 1;
              const valid = day >= 1 && day <= daysInMonth;
              const isToday = day === today;
              const events = bancasByDay[day] || [];
              return (
                <div key={i} style={{ minHeight: 96, padding: 8, borderRight: i % 7 !== 6 ? "1px solid var(--divider)" : "none", borderBottom: "1px solid var(--divider)", opacity: valid ? 1 : 0.3, background: isToday ? "color-mix(in oklch, var(--accent) 5%, var(--surface))" : "transparent", position: "relative" }}>
                  {valid && (
                    <>
                      <span className="mono tabular" style={{ fontSize: 12, fontWeight: isToday ? 600 : 400, color: isToday ? "var(--accent)" : "var(--fg-2)" }}>{day}</span>
                      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                        {events.map((e) => (
                          <div key={e.id} style={{ fontSize: 10.5, padding: "2px 5px", borderRadius: 4, background: e.tipo === "Defesa" ? "var(--accent-soft)" : "var(--info-soft)", color: e.tipo === "Defesa" ? "var(--accent-soft-fg)" : "var(--info)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{e.tipo[0]}Ãƒâ€šÃ‚Â· {e.aluno.split(" ")[0]}</div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>PrÃƒÆ’Ã‚Â³ximas</div>
          {bancas.length === 0 && (
            <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "32px 16px", textAlign: "center", color: "var(--muted)" }}>
              <span style={{ color: "var(--muted-2)" }}>{Ico.calendar({ size: 24 })}</span>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-2)" }}>Nenhuma banca agendada</div>
              <div style={{ fontSize: 11.5 }}>O mÃƒÆ’Ã‚Â³dulo de marcaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de bancas (substituindo Google Forms) estÃƒÆ’Ã‚Â¡ pendente.</div>
            </Card>
          )}
          {bancas.map((b) => {
            const dt = new Date(b.data);
            return (
              <Card key={b.id} style={{ display: "flex", gap: 12, padding: "14px 16px" }}>
                <div style={{ width: 46, flexShrink: 0, background: b.tipo === "Defesa" ? "var(--accent-soft)" : "var(--info-soft)", color: b.tipo === "Defesa" ? "var(--accent-soft-fg)" : "var(--info)", borderRadius: 6, padding: "4px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 600 }}>{dt.toLocaleString("pt-BR", { month: "short" }).replace(".", "").toUpperCase()}</span>
                  <span className="mono" style={{ fontSize: 18, fontWeight: 400 }}>{dt.getDate()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Pill tone={b.tipo === "Defesa" ? "accent" : "info"} style={{ fontSize: 9.5 }}>{b.tipo}</Pill>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, marginTop: 4, lineHeight: 1.3 }}>{b.aluno}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{b.local}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
