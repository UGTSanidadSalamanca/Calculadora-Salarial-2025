
export const BOE_DATA = {
  TITLE: "Real Decreto-ley 14/2025",
  YEARS: [
    {
      year: 2025,
      fixed: 0.02, // 2% según RDL 14/2025
      variable: 0.005, // 0.5% variable IPCA
      isConfirmed: true,
      description: "Subida fija del 2% + 0,5% variable (IPCA)."
    },
    {
      year: 2026,
      fixed: 0.015, // 1.5% según RDL 14/2025
      variable: 0.005, // 0.5% variable IPCA
      isConfirmed: true,
      description: "Subida fija del 1,5% + 0,5% variable (IPCA)."
    },
    {
      year: 2027,
      fixed: 0.015,
      variable: 0.005,
      isConfirmed: false,
      description: "Previsión de acuerdo: 1,5% fijo + 0,5% variable."
    },
    {
      year: 2028,
      fixed: 0.015,
      variable: 0.005,
      isConfirmed: false,
      description: "Previsión de acuerdo: 1,5% fijo + 0,5% variable."
    }
  ]
};

export const COLORS = {
  PRIMARY: "#E30613", // UGT Red
  SECONDARY: "#1e293b",
  ACCENT: "#3b82f6",
  SUCCESS: "#10b981"
};
