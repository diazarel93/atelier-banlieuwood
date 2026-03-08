/**
 * Route constants — single source of truth for all V2 navigation URLs.
 */
export const ROUTES = {
  dashboard: "/v2",
  seances: "/v2/seances",
  seanceNew: "/v2/seances/new",
  seanceDetail: (id: string) => `/v2/seances/${id}`,
  seancePrepare: (id: string) => `/v2/seances/${id}/prepare`,
  seanceResults: (id: string) => `/v2/seances/${id}/results`,
  seancePilot: (id: string) => `/session/${id}/pilot`,
  statistiques: "/v2/statistiques",
  bibliotheque: "/v2/bibliotheque",
  ficheCours: "/v2/fiche-cours",
} as const;
