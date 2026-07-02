"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui/primitives";
import { Ico } from "@/components/icons";

type VerifyState = {
  status: "idle" | "loading" | "ok" | "error";
  message: string;
};

export function ScopusVerifyButton() {
  const router = useRouter();
  const [state, setState] = useState<VerifyState>({ status: "idle", message: "" });

  async function verify() {
    setState({ status: "loading", message: "Verificando producoes na Scopus..." });

    try {
      const response = await fetch("/api/scopus/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 50 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.details || data?.error || "Falha ao verificar Scopus");

      setState({
        status: "ok",
        message: `${data.checked ?? 0} verificadas; ${data.matched ?? 0} encontradas; ${data.updated ?? 0} links atualizados.`,
      });
      router.refresh();
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Falha ao verificar Scopus",
      });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <Btn
        variant="secondary"
        size="sm"
        icon={Ico.refresh({ size: 13 })}
        disabled={state.status === "loading"}
        onClick={() => void verify()}
        title="Usa ELSEVIER_API_KEY no servidor para buscar registros na Scopus"
      >
        {state.status === "loading" ? "Verificando..." : "Verificar Scopus"}
      </Btn>
      {state.status !== "idle" && (
        <span style={{ maxWidth: 320, textAlign: "right", fontSize: 11.5, color: state.status === "error" ? "var(--danger)" : "var(--muted)" }}>
          {state.message}
        </span>
      )}
    </div>
  );
}
