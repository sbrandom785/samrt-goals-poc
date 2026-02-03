"use client";

import { useState } from "react";

type SmartKey = "specific" | "measurable" | "achievable" | "relevant" | "time_bound";

type SmartResult = Record<
  SmartKey,
  { score: number; evidence: string; feedback: string }
>;

const ROWS: Array<{ key: SmartKey; label: string }> = [
  { key: "specific", label: "Specific" },
  { key: "measurable", label: "Measurable" },
  { key: "achievable", label: "Achievable" },
  { key: "relevant", label: "Relevant" },
  { key: "time_bound", label: "Time-bound" },
];

function scoreBadge(score: number) {
  const text =
    score === 2 ? "Strong" : score === 1 ? "Partial" : "Missing";
  return `${score}/2 — ${text}`;
}

export default function Home() {
  const [objective, setObjective] = useState("");
  const [result, setResult] = useState<SmartResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function checkSmart() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/score-smart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (e: any) {
      setError("Could not reach the checker. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 28, fontFamily: "Arial, sans-serif", maxWidth: 980 }}>
      <h1 style={{ margin: "0 0 8px 0" }}>SMART Goal Checker</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        Paste your business case objective below. You’ll get formative feedback against
        each SMART criterion.
      </p>

      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
        Objective
      </label>
      <textarea
        rows={5}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 8,
          border: "1px solid #ccc",
          marginBottom: 10,
        }}
        placeholder="e.g. By 30 September 2026, implement a cloud-based HRM system..."
        value={objective}
        onChange={(e) => setObjective(e.target.value)}
      />

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={checkSmart}
          disabled={loading || objective.trim().length < 10}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #333",
            background: loading ? "#eee" : "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Checking…" : "Check SMART"}
        </button>

        <span style={{ color: "#666", fontSize: 13 }}>
          Tip: include a metric + deadline for better feedback.
        </span>
      </div>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #d33",
            background: "#fff5f5",
          }}
        >
          <strong>Issue:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 18 }}>
          <h2 style={{ marginBottom: 10 }}>Feedback</h2>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
                borderRadius: 10,
              }}
            >
              <thead>
                <tr style={{ background: "#f7f7f7" }}>
                  <th style={th}>SMART element</th>
                  <th style={th}>Score</th>
                  <th style={th}>Evidence (from your text)</th>
                  <th style={th}>How to improve</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(({ key, label }) => {
                  const row = result[key];
                  return (
                    <tr key={key}>
                      <td style={tdStrong}>{label}</td>
                      <td style={td}>{scoreBadge(row?.score ?? 0)}</td>
                      <td style={td}>
                        {row?.evidence ? (
                          <span style={{ fontStyle: "italic" }}>
                            “{row.evidence}”
                          </span>
                        ) : (
                          <span style={{ color: "#888" }}>—</span>
                        )}
                      </td>
                      <td style={td}>{row?.feedback || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            This is formative feedback. It only awards points when evidence is present in your text.
          </p>
        </div>
      )}
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 10px",
  borderBottom: "1px solid #ddd",
  fontSize: 13,
};

const td: React.CSSProperties = {
  verticalAlign: "top",
  padding: "10px 10px",
  borderBottom: "1px solid #eee",
  fontSize: 13,
};

const tdStrong: React.CSSProperties = {
  ...td,
  fontWeight: 700,
};
