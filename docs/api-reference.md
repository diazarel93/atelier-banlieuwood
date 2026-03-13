# API Reference — Banlieuwood Atelier

Base URL: `/api`

All responses are JSON. Errors return `{ error: "message" }` with appropriate HTTP status codes.

---

## Authentication

### POST `/api/auth/setup`
Onboard a new facilitator or update existing profile.

- **Auth**: Requires authenticated Supabase session
- **Body**: `{ name, role?, institution?, invitationToken? }`
- **Response**: `{ ok: true }`
- **Notes**: Creates facilitator record. If `invitationToken` is valid, auto-activates. Sends welcome email.

### GET `/api/auth/me`
Get current authenticated user profile.

- **Auth**: Requires authenticated session
- **Response**: `{ id, email, name, role, status, institution }`

### POST `/api/auth/student-login`
Magic link login for students.

- **Auth**: None
- **Body**: `{ email, display_name?, avatar? }`
- **Response**: `{ ok: true }`

---

## Sessions

### GET `/api/sessions`
List sessions for the authenticated facilitator.

- **Auth**: Facilitator (admin sees all)
- **Query**: `?status=active&limit=20`
- **Response**: `{ sessions: Session[] }`

### POST `/api/sessions`
Create a new session.

- **Auth**: Facilitator
- **Body**: `{ title, module?, seance?, level?, class_label?, scheduled_at? }`
- **Response**: `{ session: Session }` (includes generated `join_code`)

### GET `/api/sessions/[id]`
Get session details.

- **Auth**: Facilitator (owner or admin)
- **Response**: `{ session: Session }`

### PATCH `/api/sessions/[id]`
Update session (status, title, broadcast, current situation, etc.).

- **Auth**: Facilitator (owner or admin)
- **Body**: `{ status?, title?, module?, seance?, broadcast?, currentSituationId? }`
- **Response**: `{ session: Session }`

### DELETE `/api/sessions/[id]`
Soft-delete a session.

- **Auth**: Facilitator (owner)
- **Response**: `{ ok: true }`

### POST `/api/sessions/join`
Student joins a session via join code.

- **Auth**: None
- **Body**: `{ joinCode, displayName, avatar? }`
- **Response**: `{ student: { id, display_name, avatar } }`
- **Limits**: Max 50 students per session

### POST `/api/sessions/free`
Create a free solo session (no facilitator needed).

- **Auth**: None
- **Body**: `{ displayName, avatar? }`
- **Response**: `{ sessionId, studentId, joinCode }`

### GET `/api/sessions/analytics`
Cross-session analytics.

- **Auth**: Facilitator
- **Response**: `{ moduleUsage, levelDistribution, weeklyTrends, templateUsage }`

### POST `/api/sessions/[id]/duplicate`
Duplicate session as fresh template.

- **Auth**: Facilitator (owner)
- **Response**: `{ session: Session }`

### POST `/api/sessions/[id]/demo`
Create 5 demo students with responses for current situation.

- **Auth**: Facilitator
- **Response**: `{ students: Student[], responses: Response[] }`

### DELETE `/api/sessions/[id]/demo`
Remove demo students from session.

- **Auth**: Facilitator
- **Response**: `{ deleted: number }`

---

## Situation

### GET `/api/sessions/[id]/situation`
Get current situation for a session (used by student app for polling).

- **Auth**: None (rate limited)
- **Response**: `{ situation, voteOptions?, collectiveChoice?, warnings? }`

---

## Student Responses

### POST `/api/sessions/[id]/respond`
Student submits a response.

- **Auth**: None (rate limited: 20/60s per IP)
- **Body**: `{ studentId, situationId, text }`
- **Response**: `{ response: Response }`
- **Limits**: Max 500 chars, timer validation

### GET `/api/sessions/[id]/responses`
Get all responses for a session.

- **Auth**: Facilitator
- **Query**: `?situationId=uuid`
- **Response**: `{ responses: Response[] }`

### PATCH `/api/sessions/[id]/responses`
Update response metadata (comment, highlight, score).

- **Auth**: Facilitator
- **Body**: `{ responseId, comment?, highlight?, score?, feedback? }`
- **Response**: `{ response: Response }`

### POST `/api/sessions/[id]/responses/evaluate`
AI-evaluate up to 20 responses concurrently.

- **Auth**: Facilitator
- **Body**: `{ responseIds: string[] }`
- **Response**: `{ evaluated: { id, score, feedback }[] }`

### PATCH `/api/sessions/[id]/responses/[responseId]`
Update individual response flags.

- **Auth**: Facilitator
- **Body**: `{ is_hidden?, is_vote_option?, teacher_comment?, teacher_score?, ai_score? }`
- **Response**: `{ response: Response }`

### POST `/api/sessions/[id]/reset-responses`
Reset all responses for a situation.

- **Auth**: Facilitator
- **Body**: `{ situationId }`
- **Response**: `{ reset: number }`

---

## Voting

### POST `/api/sessions/[id]/vote`
Student casts a vote.

- **Auth**: None
- **Body**: `{ studentId, situationId, responseId }`
- **Response**: `{ vote: Vote }`
- **Notes**: One vote per student per situation

### GET `/api/sessions/[id]/collective-choice`
Get all collective choices for a session.

- **Auth**: Any
- **Response**: `{ choices: CollectiveChoice[] }`

### POST `/api/sessions/[id]/collective-choice`
Facilitator validates a collective choice.

- **Auth**: Facilitator
- **Body**: `{ situationId, responseId }`
- **Response**: `{ choice: CollectiveChoice }`

### POST `/api/sessions/[id]/manche-vote`
Vote in a "manche" round (Module 12).

- **Auth**: None
- **Body**: `{ studentId, mancheKey, cardIndex }`
- **Response**: `{ ok: true }`

### POST `/api/sessions/[id]/manche-winner`
Declare winner of a manche round.

- **Auth**: None
- **Body**: `{ mancheKey, winnerIndex }`
- **Response**: `{ ok: true }`

---

## Module 2 — Emotion & Scene Building

### POST `/api/sessions/[id]/budget`
Student allocates creative budget (5 categories, 100 credits total).

- **Auth**: None (rate limited)
- **Body**: `{ studentId, situationId, allocations: { casting, decors, image, son, montage } }`
- **Response**: `{ budget: Budget }`

### GET `/api/sessions/[id]/budget`
Get all budgets for session + class averages.

- **Auth**: Facilitator
- **Response**: `{ budgets: Budget[], averages: Averages }`

### POST `/api/sessions/[id]/scene`
Student submits a scene.

- **Auth**: None (rate limited)
- **Body**: `{ studentId, situationId, emotion, intention, obstacle, changement, elements }`
- **Response**: `{ scene: Scene, aiFeedback? }`

### GET `/api/sessions/[id]/scene`
Get all scenes + emotion distribution.

- **Auth**: Facilitator
- **Response**: `{ scenes: Scene[], emotionDistribution: Record<string, number> }`

---

## Module 10 — Et si... & Pitch

### POST `/api/sessions/[id]/etsi`
Student submits "Et si..." text.

- **Auth**: None (rate limited)
- **Body**: `{ studentId, imageId, etsiText, helpUsed?, qcmAnswers? }`
- **Response**: `{ etsi: Etsi }`

### GET `/api/sessions/[id]/etsi`
Get student or all "Et si..." responses.

- **Auth**: Mixed (student sees own, facilitator sees all)
- **Query**: `?studentId=uuid`
- **Response**: `{ responses: Etsi[] }`

### POST `/api/sessions/[id]/personnage`
Create/update a character.

- **Auth**: None (rate limited)
- **Body**: `{ studentId, prenom, trait, force, faiblesse, avatar }`
- **Response**: `{ personnage: Personnage }`

### GET `/api/sessions/[id]/personnage`
Get student or all characters.

- **Auth**: Mixed
- **Query**: `?studentId=uuid`
- **Response**: `{ personnages: Personnage[] }`

### POST `/api/sessions/[id]/pitch`
Submit a pitch.

- **Auth**: None (rate limited)
- **Body**: `{ studentId, objectif, obstacle, pitch_text, chrono? }`
- **Response**: `{ pitch: Pitch }`

### PATCH `/api/sessions/[id]/pitch`
Update chrono time on pitch.

- **Auth**: None
- **Body**: `{ studentId, chrono }`
- **Response**: `{ ok: true }`

### GET `/api/sessions/[id]/pitch`
Get student or all pitches.

- **Auth**: Mixed
- **Response**: `{ pitches: Pitch[] }`

### POST `/api/sessions/[id]/help-request`
Request AI hint.

- **Auth**: None
- **Body**: `{ studentId, step, helpType: "example"|"reformulate"|"starter", context? }`
- **Response**: `{ hint: string }`
- **Limits**: Max 3 per step

---

## Module 6 — Scenario

### GET `/api/sessions/[id]/scenario`
Get scenes, missions, and scenario data.

- **Auth**: Facilitator
- **Response**: `{ scenes, missions, scenario }`

### POST `/api/sessions/[id]/scenario`
Submit M6/M7/M8 actions (comparison, decoupage, quiz, roles).

- **Auth**: None
- **Body**: `{ type: "comparison"|"decoupage"|"quiz"|"roles", studentId, ...typeSpecificFields }`
- **Response**: varies by type

### PATCH `/api/sessions/[id]/scenario`
Update mission content.

- **Auth**: Facilitator
- **Body**: `{ missionId, content }`
- **Response**: `{ mission: Mission }`

### POST `/api/sessions/[id]/scenario-generate`
AI-generate scenes from Module 12 winners.

- **Auth**: None
- **Response**: `{ scenes: Scene[], missions: Mission[] }`

---

## Analysis & Feedback

### GET `/api/sessions/[id]/oie-profile`
Get cached O-I-E scores per student.

- **Auth**: Facilitator
- **Response**: `{ profiles: OieProfile[] }`

### POST `/api/sessions/[id]/oie-profile`
Compute and persist O-I-E scores.

- **Auth**: None
- **Response**: `{ computed: number, profiles: OieProfile[] }`

### GET `/api/sessions/[id]/feedback`
Generate educational feedback.

- **Auth**: Any
- **Response**: `{ participation, competencies, topContributors, groupProfile }`

### GET `/api/sessions/[id]/leaderboard`
Session leaderboard.

- **Auth**: None
- **Response**: `{ leaderboard: { studentId, xp, responses, votes, retained }[], badges: Badge[] }`

### GET `/api/sessions/[id]/recap`
Fetch recap data (collective story, personal responses).

- **Auth**: None
- **Response**: `{ collectiveStory, personalResponses, chosenCount, pitch?, personnage? }`

### POST `/api/sessions/[id]/recap/share`
Generate shareable recap link.

- **Auth**: None
- **Body**: `{ studentId }`
- **Response**: `{ shareUrl, token }`

### GET `/api/sessions/[id]/export`
Export collective story as Markdown.

- **Auth**: Facilitator
- **Response**: `{ markdown: string }`

---

## V2 Dashboard & Analytics

### GET `/api/v2/dashboard-summary`
Light dashboard aggregation.

- **Auth**: Facilitator/Admin
- **Response**: `{ todaySessions, tomorrowSessions, stats, atRiskStudents, completedModules }`

### GET `/api/v2/stats`
O-I-E scores aggregated to 4 axes.

- **Auth**: Facilitator/Admin
- **Response**: `{ axes: { comprehension, creativite, expression, engagement }, students: StudentBreakdown[] }`

### GET `/api/v2/question-analytics`
Per-question analytics.

- **Auth**: Facilitator
- **Response**: `{ questions: { id, avgScore, responseCount, avgTime }[] }`

### GET `/api/v2/student-profiles`
Student profiles linked to facilitator's sessions.

- **Auth**: Facilitator
- **Response**: `{ profiles: StudentProfile[] }`

### GET `/api/v2/student-profiles/[profileId]`
Fetch student profile details.

- **Auth**: Facilitator
- **Response**: `{ profile: StudentProfile }`

### PATCH `/api/v2/student-profiles/[profileId]`
Update student profile.

- **Auth**: Facilitator
- **Body**: `{ display_name?, avatar?, custom_title? }`
- **Response**: `{ profile: StudentProfile }`

### GET `/api/v2/student-profiles/[profileId]/notes`
Get notes on a student.

- **Auth**: Facilitator
- **Response**: `{ notes: Note[] }`

### POST `/api/v2/student-profiles/[profileId]/notes`
Add/update a note on a student.

- **Auth**: Facilitator
- **Body**: `{ content, type? }`
- **Response**: `{ note: Note }`

---

## Admin (requires admin role)

### GET `/api/v2/admin/users`
List all facilitators.

- **Auth**: Admin
- **Query**: `?role=intervenant&status=active`
- **Response**: `{ users: Facilitator[] }`

### PATCH `/api/v2/admin/users`
Bulk update user statuses.

- **Auth**: Admin
- **Body**: `{ userIds: string[], status: "active"|"pending"|"deactivated" }`
- **Response**: `{ updated: number }`

### PATCH `/api/v2/admin/users/[userId]`
Validate, reject, deactivate, or reactivate a user.

- **Auth**: Admin
- **Body**: `{ action: "validate"|"reject"|"deactivate"|"reactivate" }`
- **Response**: `{ user: Facilitator }`
- **Notes**: Sends email notification on validate/reject

### GET `/api/v2/admin/invitations`
List all invitations.

- **Auth**: Admin
- **Response**: `{ invitations: Invitation[] }`

### POST `/api/v2/admin/invitations`
Create an invitation (admin invite) or access request (public).

- **Auth**: Admin for invite, none for request
- **Body**: `{ email, role?, institution?, message? }`
- **Response**: `{ invitation: Invitation }`
- **Notes**: Sends invitation email with token link

### GET `/api/v2/admin/stats`
Global admin statistics.

- **Auth**: Admin
- **Response**: `{ totalUsers, pendingUsers, totalSessions, pendingInvitations }`

---

## Gamification

### GET `/api/achievements`
Get student's unlocked achievements + all definitions.

- **Auth**: Mixed
- **Query**: `?studentProfileId=uuid`
- **Response**: `{ achievements: Achievement[], definitions: AchievementDef[] }`

### POST `/api/achievements`
Unlock an achievement.

- **Auth**: Mixed
- **Body**: `{ studentProfileId, achievementKey, tier?, progress? }`
- **Response**: `{ achievement: Achievement }`

### GET `/api/missions`
Get available missions + student submissions.

- **Auth**: Mixed
- **Query**: `?profileId=uuid`
- **Response**: `{ missions: Mission[], submissions: Submission[] }`

### POST `/api/missions`
Submit mission response.

- **Auth**: Mixed
- **Body**: `{ profileId, missionId, response }`
- **Response**: `{ submission: Submission, xpEarned: number }`

---

## Student Profile

### GET `/api/student-profile`
Fetch or create student profile.

- **Auth**: Authenticated student
- **Response**: `{ profile: StudentProfile }`

### PATCH `/api/student-profile`
Update student profile (display name, avatar, accessories).

- **Auth**: Authenticated student
- **Body**: `{ display_name?, avatar?, accessories?, frame?, custom_title?, particle_effect? }`
- **Response**: `{ profile: StudentProfile }`

---

## Badge (Public)

### GET `/api/badge/[token]`
Get badge data for a share token.

- **Auth**: None (public)
- **Response**: `{ name, responses, retained, impactRate, creativeProfile, achievements }`

---

## Other

### POST `/api/contact`
Submit contact form.

- **Auth**: None
- **Body**: `{ email, message }`
- **Response**: `{ ok: true }`
- **Validation**: Email required, message min 10 chars

### POST `/api/locale`
Set locale preference.

- **Auth**: None
- **Body**: `{ locale: "fr"|"en" }`
- **Response**: Sets cookie `bw-locale` (1 year)

### POST `/api/analytics`
Track an analytics event.

- **Auth**: Mixed
- **Body**: `{ event, properties? }`
- **Response**: `{ ok: true }`

### GET `/api/sessions/[id]/students/[studentId]`
Get student details within a session.

- **Auth**: Facilitator
- **Response**: `{ student: Student }`

### PATCH `/api/sessions/[id]/students/[studentId]`
Update student in session.

- **Auth**: Facilitator
- **Body**: `{ display_name?, avatar? }`
- **Response**: `{ student: Student }`

### DELETE `/api/sessions/[id]/students/[studentId]`
Remove student from session.

- **Auth**: Facilitator
- **Response**: `{ ok: true }`

### GET/POST `/api/sessions/[id]/teams`
Manage teams within a session.

- **Auth**: Facilitator
- **Methods**: GET (list teams), POST (create team), DELETE (remove team)

### POST `/api/sessions/[id]/teams/assign`
Assign students to teams.

- **Auth**: Facilitator
- **Body**: `{ assignments: { studentId, teamId }[] }`
- **Response**: `{ ok: true }`

### GET/POST `/api/sessions/[id]/reactions`
Student emoji reactions.

- **Auth**: None
- **Methods**: GET (list), POST (create reaction)

### GET `/api/sessions/[id]/facilitator-tags`
Get facilitator tags on responses.

- **Auth**: Facilitator
- **Response**: `{ tags: Tag[] }`

### POST `/api/sessions/[id]/facilitator-tags`
Create a tag on a response.

- **Auth**: Facilitator
- **Body**: `{ responseId, tag }`
- **Response**: `{ tag: Tag }`

---

## Common Patterns

### Authentication
- **Facilitator routes** use `requireFacilitator(sessionId)` — must own the session
- **Admin routes** use `requireAdmin()` — must have admin role
- **Student routes** are unauthenticated but rate-limited (10-20 requests/60s per IP)
- **Admin bypass**: Admins can access any session data via RLS policies

### Rate Limiting
Student POST endpoints are rate-limited by IP address. Typical limits:
- Responses: 20 per 60 seconds
- Votes: 10 per 60 seconds
- Help requests: 3 per step

### Validation
- All IDs are validated as UUIDs
- Text fields are trimmed and sliced to prevent bloat
- Complex inputs use Zod schema validation
- Upserts prevent duplicate submissions
