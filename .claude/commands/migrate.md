# /migrate — Créer et appliquer une migration Supabase

Crée une nouvelle migration SQL et l'applique en local.

## Usage

`/migrate <description>`

Exemple : `/migrate add-user-preferences-table`

## Instructions

1. **Nom de fichier** : générer un timestamp `YYYYMMDDHHMMSS_<description>.sql`
   - Chemin : `supabase/migrations/<timestamp>_<description>.sql`
2. **Contenu SQL** : écrire la migration avec :
   - `-- Migration: <description>`
   - `-- Date: <date>`
   - DDL complet (CREATE TABLE, ALTER TABLE, etc.)
   - RLS policies si nouvelle table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
   - Index pertinents
3. **Appliquer** : `npx supabase db reset` (local) ou `supabase db push` (remote — demander confirmation)
4. **Types** : régénérer avec `npm run db:types`

## Règles

- JAMAIS modifier une migration existante — toujours créer une nouvelle
- RLS obligatoire sur toute nouvelle table avec données utilisateur
- Toujours inclure `created_at TIMESTAMPTZ DEFAULT now()` sur les nouvelles tables
