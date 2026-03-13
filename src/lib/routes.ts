/**
 * Route constants — single source of truth for all navigation URLs.
 */
export const ROUTES = {
  // V2 Cockpit
  dashboard: "/v2",
  seances: "/v2/seances",
  seanceNew: "/v2/seances/new",
  seanceDetail: (id: string) => `/v2/seances/${id}`,
  seancePrepare: (id: string) => `/v2/seances/${id}/prepare`,
  seanceResults: (id: string) => `/v2/seances/${id}/results`,
  statistiques: "/v2/statistiques",
  bibliotheque: "/v2/bibliotheque",
  ficheCours: "/v2/fiche-cours",
  eleves: "/v2/eleves",
  eleveDetail: (id: string) => `/v2/eleves/${id}`,

  // Pilot & Screen (old routes, still active)
  pilot: (id: string) => `/session/${id}/pilot`,
  screen: (id: string) => `/session/${id}/screen`,

  // Play (student game)
  play: (id: string) => `/play/${id}`,
  playBibliotheque: (id: string) => `/play/${id}/bibliotheque`,
  playRecap: (id: string) => `/play/${id}/recap`,

  // Auth
  login: "/login",
  join: "/join",
} as const;
