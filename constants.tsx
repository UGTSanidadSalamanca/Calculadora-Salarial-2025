
export const BOE_DATA = {
  TITLE: "RDL 14/2025",
  YEARS: [
    {
      year: 2025,
      fixed: 0.02, 
      variable: 0.005,
      isConfirmed: true,
      description: "2% fijo + 0,5% IPC"
    },
    {
      year: 2026,
      fixed: 0.015,
      variable: 0.005,
      isConfirmed: true,
      description: "1,5% fijo + 0,5% IPC"
    },
    {
      year: 2027,
      fixed: 0.015,
      variable: 0.005,
      isConfirmed: false,
      description: "1,5% Recuperación UGT"
    },
    {
      year: 2028,
      fixed: 0.015,
      variable: 0.005,
      isConfirmed: false,
      description: "1,5% Recuperación UGT"
    }
  ]
};

export const COLORS = {
  PRIMARY: "#E30613", // UGT Red
  SECONDARY: "#0F172A",
  ACCENT: "#3B82F6",
  SUCCESS: "#10B981"
};
