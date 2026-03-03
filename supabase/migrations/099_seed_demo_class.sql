-- ================================================================
-- SEED: Classe démo — 15 élèves de 3ème (14 ans)
-- Session complète Module 3 (Le Héros) + Module 4 (Vis ma Vie)
-- Chaque élève a une personnalité distincte
-- Timing réaliste, évaluations prof, votes, choix collectifs
-- ================================================================

-- ── Helper: clean up previous demo data ──
DELETE FROM collective_choices WHERE session_id IN (SELECT id FROM sessions WHERE join_code = 'DEMO42');
DELETE FROM votes WHERE session_id IN (SELECT id FROM sessions WHERE join_code = 'DEMO42');
DELETE FROM annotations WHERE session_id IN (SELECT id FROM sessions WHERE join_code = 'DEMO42');
DELETE FROM responses WHERE session_id IN (SELECT id FROM sessions WHERE join_code = 'DEMO42');
DELETE FROM module2_budgets WHERE session_id IN (SELECT id FROM sessions WHERE join_code = 'DEMO42');
DELETE FROM students WHERE session_id IN (SELECT id FROM sessions WHERE join_code = 'DEMO42');
DELETE FROM sessions WHERE join_code = 'DEMO42';

DO $$
DECLARE
  v_session UUID;
  -- Students
  s_yasmine UUID; s_karim UUID; s_lea UUID; s_enzo UUID; s_fatou UUID;
  s_nathan UUID; s_ines UUID; s_rayan UUID; s_chloe UUID; s_mamadou UUID;
  s_sarah UUID; s_lucas UUID; s_amina UUID; s_theo UUID; s_jade UUID;
  -- Situations (Module 3, variant 0)
  sit_3_1_1 UUID; sit_3_1_2 UUID; sit_3_1_3 UUID; sit_3_1_4 UUID;
  sit_3_1_5 UUID; sit_3_1_6 UUID; sit_3_1_7 UUID; sit_3_1_8 UUID;
  sit_3_2_1 UUID; sit_3_2_2 UUID; sit_3_2_3 UUID; sit_3_2_4 UUID;
  sit_3_2_5 UUID; sit_3_2_6 UUID; sit_3_2_7 UUID; sit_3_2_8 UUID;
  sit_3_3_1 UUID; sit_3_3_2 UUID; sit_3_3_3 UUID; sit_3_3_4 UUID; sit_3_3_5 UUID;
  -- Situations (Module 4, variant 0)
  sit_4_1_1 UUID; sit_4_1_2 UUID; sit_4_1_3 UUID; sit_4_1_4 UUID;
  sit_4_1_5 UUID; sit_4_1_6 UUID; sit_4_1_7 UUID; sit_4_1_8 UUID;
  -- Timing base
  t0 TIMESTAMPTZ := '2026-03-01 09:00:00+01';
  -- Temp response IDs for votes
  r_id UUID;
  r_best UUID;
BEGIN

-- ═══════════════════════════════════════════
-- 1. SESSION
-- ═══════════════════════════════════════════
INSERT INTO sessions (facilitator_id, title, join_code, level, template, current_module, current_seance, current_situation_index, status, mode, created_at, updated_at)
VALUES ('3fb7a628-3625-4a8b-8b0d-0f9868787cfd', 'Les Étoiles de Clichy', 'DEMO42', 'college', 'drame', 3, 3, 5, 'done', 'guided', t0 - INTERVAL '10 minutes', t0 + INTERVAL '2 hours')
RETURNING id INTO v_session;

-- ═══════════════════════════════════════════
-- 2. ÉTUDIANTS — 15 personnalités
-- ═══════════════════════════════════════════
-- Yasmine: créative passionnée, écrit long et détaillé, réponses poétiques
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Yasmine', '🌸', true, t0 - INTERVAL '8 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_yasmine;

-- Karim: leader charismatique, réponses courtes et percutantes
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Karim', '🔥', true, t0 - INTERVAL '7 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_karim;

-- Léa: timide mais profonde, commence lent puis s'épanouit
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Léa', '🦋', true, t0 - INTERVAL '6 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_lea;

-- Enzo: le clown, détourne tout en humour mais éclairs de génie
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Enzo', '😂', true, t0 - INTERVAL '5 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_enzo;

-- Fatou: studieuse et structurée, toujours complète
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Fatou', '📚', true, t0 - INTERVAL '9 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_fatou;

-- Nathan: gamer, références pop culture partout
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Nathan', '🎮', true, t0 - INTERVAL '4 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_nathan;

-- Inès: sensible et empathique, focus émotions
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Inès', '💜', true, t0 - INTERVAL '6 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_ines;

-- Rayan: rebelle, challenge les questions, idées originales
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Rayan', '⚡', true, t0 - INTERVAL '3 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_rayan;

-- Chloé: cinéphile, références de films
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Chloé', '🎬', true, t0 - INTERVAL '7 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_chloe;

-- Mamadou: discret mais quand il parle c'est brillant
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Mamadou', '🌍', true, t0 - INTERVAL '5 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_mamadou;

-- Sarah: perfectionniste, qualité haute
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Sarah', '✨', true, t0 - INTERVAL '8 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_sarah;

-- Lucas: sportif, métaphores physiques, pas très long
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Lucas', '⚽', true, t0 - INTERVAL '4 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_lucas;

-- Amina: rêveuse poétique, prose lyrique
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Amina', '🌙', true, t0 - INTERVAL '6 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_amina;

-- Théo: rationnel analytique, décortique tout
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Théo', '🧠', true, t0 - INTERVAL '7 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_theo;

-- Jade: social butterfly, focus relations
INSERT INTO students (session_id, display_name, avatar, is_active, joined_at, last_seen_at)
VALUES (v_session, 'Jade', '💎', true, t0 - INTERVAL '5 min', t0 + INTERVAL '2 hours')
RETURNING id INTO s_jade;

-- ═══════════════════════════════════════════
-- 3. FETCH SITUATION IDs
-- ═══════════════════════════════════════════
SELECT id INTO sit_3_1_1 FROM situations WHERE module=3 AND seance=1 AND position=1 AND variant=0;
SELECT id INTO sit_3_1_2 FROM situations WHERE module=3 AND seance=1 AND position=2 AND variant=0;
SELECT id INTO sit_3_1_3 FROM situations WHERE module=3 AND seance=1 AND position=3 AND variant=0;
SELECT id INTO sit_3_1_4 FROM situations WHERE module=3 AND seance=1 AND position=4 AND variant=0;
SELECT id INTO sit_3_1_5 FROM situations WHERE module=3 AND seance=1 AND position=5 AND variant=0;
SELECT id INTO sit_3_1_6 FROM situations WHERE module=3 AND seance=1 AND position=6 AND variant=0;
SELECT id INTO sit_3_1_7 FROM situations WHERE module=3 AND seance=1 AND position=7 AND variant=0;
SELECT id INTO sit_3_1_8 FROM situations WHERE module=3 AND seance=1 AND position=8 AND variant=0;
SELECT id INTO sit_3_2_1 FROM situations WHERE module=3 AND seance=2 AND position=1 AND variant=0;
SELECT id INTO sit_3_2_2 FROM situations WHERE module=3 AND seance=2 AND position=2 AND variant=0;
SELECT id INTO sit_3_2_3 FROM situations WHERE module=3 AND seance=2 AND position=3 AND variant=0;
SELECT id INTO sit_3_2_4 FROM situations WHERE module=3 AND seance=2 AND position=4 AND variant=0;
SELECT id INTO sit_3_2_5 FROM situations WHERE module=3 AND seance=2 AND position=5 AND variant=0;
SELECT id INTO sit_3_2_6 FROM situations WHERE module=3 AND seance=2 AND position=6 AND variant=0;
SELECT id INTO sit_3_2_7 FROM situations WHERE module=3 AND seance=2 AND position=7 AND variant=0;
SELECT id INTO sit_3_2_8 FROM situations WHERE module=3 AND seance=2 AND position=8 AND variant=0;
SELECT id INTO sit_3_3_1 FROM situations WHERE module=3 AND seance=3 AND position=1 AND variant=0;
SELECT id INTO sit_3_3_2 FROM situations WHERE module=3 AND seance=3 AND position=2 AND variant=0;
SELECT id INTO sit_3_3_3 FROM situations WHERE module=3 AND seance=3 AND position=3 AND variant=0;
SELECT id INTO sit_3_3_4 FROM situations WHERE module=3 AND seance=3 AND position=4 AND variant=0;
SELECT id INTO sit_3_3_5 FROM situations WHERE module=3 AND seance=3 AND position=5 AND variant=0;
-- Module 4
SELECT id INTO sit_4_1_1 FROM situations WHERE module=4 AND seance=1 AND position=1 AND variant=0;
SELECT id INTO sit_4_1_2 FROM situations WHERE module=4 AND seance=1 AND position=2 AND variant=0;
SELECT id INTO sit_4_1_3 FROM situations WHERE module=4 AND seance=1 AND position=3 AND variant=0;
SELECT id INTO sit_4_1_4 FROM situations WHERE module=4 AND seance=1 AND position=4 AND variant=0;
SELECT id INTO sit_4_1_5 FROM situations WHERE module=4 AND seance=1 AND position=5 AND variant=0;
SELECT id INTO sit_4_1_6 FROM situations WHERE module=4 AND seance=1 AND position=6 AND variant=0;
SELECT id INTO sit_4_1_7 FROM situations WHERE module=4 AND seance=1 AND position=7 AND variant=0;
SELECT id INTO sit_4_1_8 FROM situations WHERE module=4 AND seance=1 AND position=8 AND variant=0;

-- ═══════════════════════════════════════════
-- 4. MODULE 3 — SÉANCE 1: "C'est l'histoire de qui ?"
-- 8 situations × 15 élèves = 120 réponses
-- Timing: question ouverte ~5min par situation
-- ═══════════════════════════════════════════

-- ── Q1: Le héros (personnage) ──
-- Temps base: t0 + 0min (début séance 1)
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted, teacher_comment) VALUES
(v_session, s_yasmine, sit_3_1_1, 'C''est Nora, 16 ans. Elle porte toujours un vieux walkman avec une cassette que sa mère lui a laissée. Elle vit chez sa grand-mère à Clichy et elle dessine tout le temps dans les marges de ses cahiers. Ses yeux sont immenses, comme si elle voyait des choses que personne d''autre ne voit.', t0 + INTERVAL '2 min 34 sec', true, 'Très riche en détails, personnage touchant'),
(v_session, s_karim, sit_3_1_1, 'Samir. 17 ans. Il traîne au pied des immeubles mais il a un secret : la nuit il écrit des textes de rap qu''il montre à personne.', t0 + INTERVAL '0 min 45 sec', false, NULL),
(v_session, s_lea, sit_3_1_1, 'Une fille qui s''appelle Lina. Elle est discrète, on la remarque pas trop au collège.', t0 + INTERVAL '3 min 12 sec', false, NULL),
(v_session, s_enzo, sit_3_1_1, 'Un mec qui s''appelle Tony Laser et qui a un pouvoir : il peut voir à travers les murs mais que les murs des toilettes (oui c''est nul comme pouvoir)', t0 + INTERVAL '1 min 5 sec', false, 'Ha ha, essaie de prendre ça au sérieux Enzo !'),
(v_session, s_fatou, sit_3_1_1, 'Le personnage principal est Aïcha, une élève de troisième qui vit dans une cité. Elle est brillante en cours mais elle cache à tout le monde qu''elle travaille le soir au restaurant de son oncle pour aider sa famille. Elle porte toujours une montre cassée.', t0 + INTERVAL '3 min 45 sec', true, 'Excellent ! Contexte social très bien posé'),
(v_session, s_nathan, sit_3_1_1, 'C''est un gars genre Naruto mais en vrai, un mec qui est rejeté par tout le monde au quartier et qui veut prouver qu''il est fort', t0 + INTERVAL '1 min 22 sec', false, NULL),
(v_session, s_ines, sit_3_1_1, 'Elle s''appelle Luna. Elle sourit tout le temps mais personne sait qu''elle pleure le soir. Elle a 15 ans et elle veut juste que quelqu''un la comprenne vraiment.', t0 + INTERVAL '2 min 50 sec', true, 'Émotion sincère, bravo'),
(v_session, s_rayan, sit_3_1_1, 'Pourquoi faut que ce soit UNE personne ? C''est deux jumeaux. Yassine et Youssef. Tout le monde les confond mais ils sont opposés.', t0 + INTERVAL '0 min 38 sec', false, 'Idée intéressante de doubler le héros'),
(v_session, s_chloe, sit_3_1_1, 'C''est une réalisatrice en herbe, genre Agnès Varda jeune, qui filme tout avec son téléphone. Elle s''appelle Salomé et elle documente la vie de son quartier pour un concours.', t0 + INTERVAL '2 min 15 sec', true, 'Mise en abyme intéressante'),
(v_session, s_mamadou, sit_3_1_1, 'Ibrahim. Il est gardien de nuit dans un centre commercial abandonné. Il a 60 ans. Il parle peu mais il a vécu mille vies.', t0 + INTERVAL '4 min 30 sec', true, 'Personnage inattendu et puissant'),
(v_session, s_sarah, sit_3_1_1, 'Maya, 16 ans. Elle est à moitié française, à moitié japonaise. Elle vient d''arriver en France et elle comprend pas les codes. Elle est photographe et elle capture les moments que les gens ignorent.', t0 + INTERVAL '3 min 55 sec', false, NULL),
(v_session, s_lucas, sit_3_1_1, 'Un boxeur de 16 ans qui s''appelle Kenzo. Il a un match important bientôt.', t0 + INTERVAL '0 min 52 sec', false, NULL),
(v_session, s_amina, sit_3_1_1, 'Elle s''appelle Soraya. Elle marche pieds nus sur le béton chaud de la cité, avec des écouteurs et les yeux fermés. Le monde est trop bruyant pour elle alors elle se crée le sien avec la musique.', t0 + INTERVAL '3 min 20 sec', true, 'Très poétique'),
(v_session, s_theo, sit_3_1_1, 'C''est un adolescent de 15 ans, Maxime, qui vit dans une banlieue pavillonnaire. Il est bon en maths, il a peu d''amis, et il passe ses soirées à observer les étoiles avec un télescope. Son truc c''est la logique : tout doit avoir une explication.', t0 + INTERVAL '4 min 10 sec', false, NULL),
(v_session, s_jade, sit_3_1_1, 'Sofia ! Elle connaît TOUT LE MONDE dans le quartier. Genre elle dit bonjour à tous les commerçants, elle connaît les prénoms des enfants du parc. C''est la fille la plus sociable du monde mais personne connaît sa vraie vie.', t0 + INTERVAL '1 min 48 sec', false, NULL);

-- ── Q2: Son désir (personnage) ──
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted, teacher_comment) VALUES
(v_session, s_yasmine, sit_3_1_2, 'Elle veut retrouver sa mère qui est partie quand elle avait 5 ans. La cassette dans le walkman, c''est le seul lien. Elle est persuadée que si elle arrive à trouver l''endroit décrit dans les chansons, elle la retrouvera.', t0 + INTERVAL '8 min 15 sec', true, 'Le walkman comme fil conducteur, très bien'),
(v_session, s_karim, sit_3_1_2, 'Être reconnu. Pas par tout le monde, juste par son père qui l''a jamais calculé.', t0 + INTERVAL '6 min 20 sec', true, 'Puissant en si peu de mots'),
(v_session, s_lea, sit_3_1_2, 'Elle veut être vue. Que quelqu''un la remarque enfin.', t0 + INTERVAL '9 min 30 sec', false, NULL),
(v_session, s_enzo, sit_3_1_2, 'Il veut devenir célèbre sur TikTok. Genre 10 millions d''abonnés minimum. Non sérieux, il veut que les gens arrêtent de le prendre pour un rigolo.', t0 + INTERVAL '7 min 5 sec', false, 'La deuxième partie est intéressante'),
(v_session, s_fatou, sit_3_1_2, 'Aïcha veut décrocher une bourse pour un lycée prestigieux à Paris. C''est sa seule chance de sortir du cercle. Mais pour ça, faut qu''elle ait des notes parfaites ET qu''elle garde le secret sur son travail au restaurant.', t0 + INTERVAL '9 min 45 sec', true, 'Enjeu concret et crédible'),
(v_session, s_nathan, sit_3_1_2, 'Il veut prouver à tout le monde qu''il est pas juste le mec bizarre du quartier. Genre Izuku dans My Hero Academia quand tout le monde lui dit qu''il peut pas être héros.', t0 + INTERVAL '7 min 30 sec', false, NULL),
(v_session, s_ines, sit_3_1_2, 'Elle veut que la douleur s''arrête. Pas une douleur physique, celle qu''on sent là, dans la poitrine, quand on se sent seule dans une pièce pleine de monde.', t0 + INTERVAL '8 min 50 sec', true, 'Très touchant'),
(v_session, s_rayan, sit_3_1_2, 'Les jumeaux veulent pas la même chose. Yassine veut partir loin, Youssef veut rester. Leur vrai désir c''est d''être enfin séparés pour exister seuls.', t0 + INTERVAL '6 min 55 sec', false, 'Le conflit entre eux EST le désir'),
(v_session, s_chloe, sit_3_1_2, 'Gagner le concours de court-métrage et montrer que les histoires de banlieue c''est pas que de la violence et du deal. Genre comme dans Les Misérables de Ladj Ly mais version ado.', t0 + INTERVAL '8 min 5 sec', false, NULL),
(v_session, s_mamadou, sit_3_1_2, 'La paix. Juste la paix. Il a fui un pays en guerre, il a traversé la mer, il a perdu des gens. Maintenant il veut juste que le silence reste silencieux.', t0 + INTERVAL '10 min 20 sec', true, 'Puissant et universel'),
(v_session, s_sarah, sit_3_1_2, 'Elle veut appartenir. Trouver sa place entre deux cultures, deux langues, deux mondes. Elle veut que quelqu''un lui dise "t''es chez toi ici".', t0 + INTERVAL '9 min 15 sec', false, NULL),
(v_session, s_lucas, sit_3_1_2, 'Gagner le championnat. C''est tout ce qui compte. S''il gagne, il aura une place en sport-études.', t0 + INTERVAL '6 min 35 sec', false, NULL),
(v_session, s_amina, sit_3_1_2, 'Elle veut que la musique dans ses écouteurs devienne réelle. Que le monde ressemble à ce qu''elle entend quand elle ferme les yeux : beau, doux, et plein de couleurs.', t0 + INTERVAL '9 min 40 sec', false, NULL),
(v_session, s_theo, sit_3_1_2, 'Comprendre pourquoi sa mère est partie. Il a analysé toutes les hypothèses logiques mais aucune ne colle. Pour la première fois, la logique ne suffit pas.', t0 + INTERVAL '10 min 5 sec', false, NULL),
(v_session, s_jade, sit_3_1_2, 'Elle veut que tout le monde s''entende. Sa famille se déchire, ses parents divorcent, et elle, elle passe son temps à faire la médiatrice. Elle veut la paix chez elle.', t0 + INTERVAL '7 min 50 sec', false, NULL);

-- ── Q3: Sa faille (personnage) ──
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted, teacher_comment) VALUES
(v_session, s_yasmine, sit_3_1_3, 'Elle fait confiance trop vite. Dès que quelqu''un lui montre un peu d''attention, elle s''accroche et elle se fait toujours avoir. C''est parce qu''elle cherche sa mère dans chaque personne bienveillante.', t0 + INTERVAL '14 min 10 sec', true, NULL),
(v_session, s_karim, sit_3_1_3, 'La fierté. Il demande jamais d''aide même quand il coule.', t0 + INTERVAL '12 min 15 sec', false, NULL),
(v_session, s_lea, sit_3_1_3, 'Elle se laisse marcher dessus. Elle dit jamais non.', t0 + INTERVAL '15 min 45 sec', false, NULL),
(v_session, s_enzo, sit_3_1_3, 'Il utilise l''humour pour cacher qu''il a peur. Genre il rigole de tout pour pas montrer que ça le touche. Mais du coup personne le prend au sérieux.', t0 + INTERVAL '13 min 5 sec', true, 'Très lucide, presque autobiographique ?'),
(v_session, s_fatou, sit_3_1_3, 'Elle ment. Pas méchamment mais elle cache tellement de choses que sa vie est un château de cartes. Un seul mensonge qui tombe et tout s''effondre.', t0 + INTERVAL '15 min 30 sec', false, NULL),
(v_session, s_nathan, sit_3_1_3, 'Il se met en mode berserker dès qu''on se moque de lui. Il pète les plombs et après il regrette.', t0 + INTERVAL '12 min 50 sec', false, NULL),
(v_session, s_ines, sit_3_1_3, 'Elle absorbe la douleur des autres comme une éponge. Elle veut tellement aider tout le monde qu''elle oublie de s''aider elle-même. À la fin elle craque.', t0 + INTERVAL '14 min 40 sec', true, 'Empathie excessive comme faille, original'),
(v_session, s_rayan, sit_3_1_3, 'Yassine est lâche, il fuit les conflits. Youssef est impulsif, il fonce dans le mur. Ensemble ils se compensent, séparés ils sont perdus.', t0 + INTERVAL '12 min 30 sec', false, NULL),
(v_session, s_chloe, sit_3_1_3, 'Elle est tellement obsédée par son film qu''elle filme des trucs qu''elle devrait pas filmer. Elle respecte plus la vie privée des gens.', t0 + INTERVAL '13 min 55 sec', false, NULL),
(v_session, s_mamadou, sit_3_1_3, 'Les cauchemars. La nuit le passé revient et le jour il est épuisé. Il dort que 3 heures par nuit.', t0 + INTERVAL '16 min 10 sec', false, NULL),
(v_session, s_sarah, sit_3_1_3, 'Le perfectionnisme. Elle recommence tout 10 fois. Du coup elle finit jamais rien et elle se déteste pour ça.', t0 + INTERVAL '15 min 20 sec', false, NULL),
(v_session, s_lucas, sit_3_1_3, 'Il pense qu''avec les poings on règle tout. Dès que ça va pas, il tape. C''est sa seule façon de s''exprimer.', t0 + INTERVAL '12 min 20 sec', false, NULL),
(v_session, s_amina, sit_3_1_3, 'Elle vit dans sa bulle. Tellement dans son monde qu''elle rate ce qui se passe autour d''elle. Sa famille a besoin d''elle mais elle entend que la musique.', t0 + INTERVAL '14 min 55 sec', false, NULL),
(v_session, s_theo, sit_3_1_3, 'Il intellectualise tout. Il peut pas ressentir les émotions normalement. Il les analyse au lieu de les vivre. Du coup les gens le trouvent froid et distant.', t0 + INTERVAL '16 min 5 sec', true, 'Très introspectif, bonne connaissance de soi'),
(v_session, s_jade, sit_3_1_3, 'Elle dit oui à tout le monde et du coup elle se perd. Elle sait plus ce qu''ELLE veut parce qu''elle passe sa vie à faire plaisir aux autres.', t0 + INTERVAL '13 min 25 sec', false, NULL);

-- ── Q4: Son secret ──
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted, teacher_comment) VALUES
(v_session, s_yasmine, sit_3_1_4, 'La cassette du walkman est vide. Elle le sait depuis longtemps mais elle fait semblant d''écouter quelque chose. Le vrai souvenir de sa mère, c''est juste le bruit du mécanisme.', t0 + INTERVAL '20 min 30 sec', true, 'Retournement magnifique sur l''objet'),
(v_session, s_karim, sit_3_1_4, 'Il a vu son père pleurer une fois. Un homme qui pleure jamais. Et il sait pourquoi.', t0 + INTERVAL '18 min 15 sec', false, NULL),
(v_session, s_lea, sit_3_1_4, 'Elle écrit des lettres à quelqu''un qui existe pas. Elle s''est inventé un ami imaginaire et elle a 14 ans.', t0 + INTERVAL '22 min 45 sec', true, 'Très touchant et original'),
(v_session, s_enzo, sit_3_1_4, 'OK sérieux cette fois. Il dort pas chez lui des fois. Il dit qu''il est chez des potes mais en vrai il squatte le hall parce que chez lui c''est compliqué.', t0 + INTERVAL '19 min 20 sec', true, 'Bravo Enzo, merci pour cette sincérité'),
(v_session, s_fatou, sit_3_1_4, 'Elle a falsifié un bulletin de notes. Pas pour elle, pour sa petite sœur qui allait se faire frapper par leur père si les notes étaient mauvaises.', t0 + INTERVAL '22 min 10 sec', true, 'Dilemme moral puissant'),
(v_session, s_nathan, sit_3_1_4, 'Il a un compte Twitch secret avec 200 viewers et personne au collège le sait', t0 + INTERVAL '18 min 50 sec', false, NULL),
(v_session, s_ines, sit_3_1_4, 'Elle prend des médicaments que personne sait. Pas des trucs graves, des trucs pour l''anxiété. Mais elle a honte.', t0 + INTERVAL '21 min 30 sec', false, NULL),
(v_session, s_rayan, sit_3_1_4, 'Yassine sait lire et écrire l''arabe, pas Youssef. Mais c''est Youssef qui a les lettres du grand-père. Il peut pas les lire.', t0 + INTERVAL '18 min 40 sec', true, 'Beau parallèle tragique'),
(v_session, s_chloe, sit_3_1_4, 'Elle a filmé une scène par accident qui montre quelque chose d''illégal dans son quartier. Elle sait pas si elle doit la garder ou l''effacer.', t0 + INTERVAL '20 min 15 sec', false, NULL),
(v_session, s_mamadou, sit_3_1_4, 'Il parle à sa femme tous les soirs avant de dormir. Elle est morte pendant la traversée. Mais il continue de lui raconter sa journée.', t0 + INTERVAL '24 min 0 sec', true, 'Bouleversant'),
(v_session, s_sarah, sit_3_1_4, 'Elle a quitté le Japon pas parce que son père a eu une mutation. C''est parce qu''elle était harcelée à l''école là-bas. Personne sait ici.', t0 + INTERVAL '22 min 30 sec', false, NULL),
(v_session, s_lucas, sit_3_1_4, 'Il prend des trucs pour être plus fort. Des compléments bizarres qu''un gars de la salle lui a filés.', t0 + INTERVAL '18 min 30 sec', false, NULL),
(v_session, s_amina, sit_3_1_4, 'Elle compose de la musique. Des vrais morceaux. Mais elle les garde dans un dossier caché sur son téléphone et elle les écoute que seule.', t0 + INTERVAL '21 min 45 sec', false, NULL),
(v_session, s_theo, sit_3_1_4, 'Il a trouvé un carnet de sa mère avec des lettres d''amour destinées à un homme qui est pas son père. Il a fait les calculs. Les dates correspondent.', t0 + INTERVAL '23 min 50 sec', true, 'Le rationnel face à l''irrationnel'),
(v_session, s_jade, sit_3_1_4, 'Elle parle à tout le monde mais elle a zéro vrai ami. Personne connaît son adresse, personne est jamais venu chez elle. Sa vie sociale c''est une façade.', t0 + INTERVAL '19 min 55 sec', false, NULL);

-- ── Q5-Q8 séance 1 : réponses plus condensées ──

-- Q5: Le meilleur allié
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at) VALUES
(v_session, s_yasmine, sit_3_1_5, 'Sa grand-mère Mami Djamila. Elle cuisine des bricks en lui racontant des histoires du bled et c''est le seul moment où Nora se sent en paix.', t0 + INTERVAL '26 min 20 sec'),
(v_session, s_karim, sit_3_1_5, 'Son petit frère de 8 ans. Le seul qui le regarde comme un héros.', t0 + INTERVAL '24 min 30 sec'),
(v_session, s_lea, sit_3_1_5, 'Sa prof de français. La seule adulte qui lui dit qu''elle a de la valeur.', t0 + INTERVAL '28 min 10 sec'),
(v_session, s_enzo, sit_3_1_5, 'Son chien Rex. Le seul être vivant qui se barre pas quand Enzo est sérieux.', t0 + INTERVAL '25 min 15 sec'),
(v_session, s_fatou, sit_3_1_5, 'Sa meilleure amie Mariama. Elles se connaissent depuis la maternelle. Mariama sait pour le restaurant.', t0 + INTERVAL '28 min 40 sec'),
(v_session, s_nathan, sit_3_1_5, 'Son pote en ligne, DarkNinja92, qu''il a jamais vu en vrai mais qu''il connaît mieux que quiconque', t0 + INTERVAL '25 min 50 sec'),
(v_session, s_ines, sit_3_1_5, 'Sa sœur aînée de 19 ans. Elle est partie à la fac mais elle appelle tous les soirs.', t0 + INTERVAL '27 min 5 sec'),
(v_session, s_rayan, sit_3_1_5, 'L''un pour l''autre, évidemment. Même s''ils se détestent parfois.', t0 + INTERVAL '24 min 45 sec'),
(v_session, s_chloe, sit_3_1_5, 'Son voisin Abdel, 70 ans, ancien projectionniste de cinéma. Il lui prête des DVD et lui raconte le cinéma d''avant.', t0 + INTERVAL '26 min 50 sec'),
(v_session, s_mamadou, sit_3_1_5, 'Le chat du centre commercial. Un chat errant qui vient dormir sur ses genoux pendant ses rondes de nuit.', t0 + INTERVAL '29 min 30 sec'),
(v_session, s_sarah, sit_3_1_5, 'Son carnet de photos. C''est pas une personne mais c''est son meilleur ami. Dedans il y a tous les moments qu''elle veut garder.', t0 + INTERVAL '28 min 20 sec'),
(v_session, s_lucas, sit_3_1_5, 'Son coach, Mourad. Le seul adulte qui croit en lui sans conditions.', t0 + INTERVAL '24 min 55 sec'),
(v_session, s_amina, sit_3_1_5, 'Sa mère. Même si elles se parlent pas beaucoup, le soir sa mère lui laisse un thé à la menthe devant la porte de sa chambre. C''est leur langage.', t0 + INTERVAL '27 min 40 sec'),
(v_session, s_theo, sit_3_1_5, 'Internet. Sérieusement. Les forums d''astronomie. Des gens qu''il a jamais vus mais qui partagent sa passion.', t0 + INTERVAL '29 min 10 sec'),
(v_session, s_jade, sit_3_1_5, 'Son petit cousin de 6 ans, Adam. Il est le seul avec qui elle est 100% elle-même.', t0 + INTERVAL '25 min 35 sec');

-- Q6: Le rival
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at) VALUES
(v_session, s_yasmine, sit_3_1_6, 'Sa tante Malika qui dit à la grand-mère que Nora perd son temps avec ses dessins et qu''elle devrait apprendre un vrai métier.', t0 + INTERVAL '32 min 40 sec'),
(v_session, s_karim, sit_3_1_6, 'Un mec du quartier, Sofiane. Il a tout ce que Karim veut : le respect, l''argent, les gens qui l''écoutent. Sauf que Sofiane fait des trucs pas nets.', t0 + INTERVAL '30 min 20 sec'),
(v_session, s_lea, sit_3_1_6, 'La fille populaire de la classe, Clara. Tout le monde l''adore et Lina se sent invisible à côté.', t0 + INTERVAL '34 min 15 sec'),
(v_session, s_enzo, sit_3_1_6, 'Son grand frère qui est parfait en tout et que tout le monde compare à lui.', t0 + INTERVAL '31 min 5 sec'),
(v_session, s_fatou, sit_3_1_6, 'Le système. C''est pas une personne, c''est tout un système qui dit qu''une fille de cité peut pas aller en prépa.', t0 + INTERVAL '34 min 50 sec'),
(v_session, s_nathan, sit_3_1_6, 'Kevin, le mec qui le harcèle au collège et qui détruit tout ce qu''il fait', t0 + INTERVAL '31 min 30 sec'),
(v_session, s_ines, sit_3_1_6, 'Y''a pas de rival. Son pire ennemi c''est elle-même, sa propre voix qui lui dit qu''elle est pas assez bien.', t0 + INTERVAL '33 min 45 sec'),
(v_session, s_rayan, sit_3_1_6, 'Chacun est le rival de l''autre. Yassine veut être comme Youssef (courageux) et Youssef veut être comme Yassine (réfléchi).', t0 + INTERVAL '30 min 50 sec'),
(v_session, s_chloe, sit_3_1_6, 'Un autre élève du concours, un fils de réalisateur qui a du matos pro et qui la nargue avec ça.', t0 + INTERVAL '32 min 20 sec'),
(v_session, s_mamadou, sit_3_1_6, 'L''administration qui veut fermer le centre commercial et le mettre dehors.', t0 + INTERVAL '35 min 30 sec'),
(v_session, s_sarah, sit_3_1_6, 'Une fille de la classe qui parle japonais mieux qu''elle et qui lui rappelle ce qu''elle a fui.', t0 + INTERVAL '34 min 5 sec'),
(v_session, s_lucas, sit_3_1_6, 'Un boxeur de son club, Driss. Il est meilleur techniquement et Lucas le sait.', t0 + INTERVAL '30 min 35 sec'),
(v_session, s_amina, sit_3_1_6, 'Le bruit. Le bruit de la cité, des travaux, des cris. Tout ce qui l''empêche d''entendre sa musique intérieure.', t0 + INTERVAL '33 min 10 sec'),
(v_session, s_theo, sit_3_1_6, 'Son beau-père. Un homme qui prétend remplacer son père et qui comprend rien à sa passion pour les étoiles.', t0 + INTERVAL '35 min 15 sec'),
(v_session, s_jade, sit_3_1_6, 'Sa mère qui contrôle tout et qui veut choisir ses amis, ses habits, sa vie.', t0 + INTERVAL '31 min 45 sec');

-- Q7: Le lieu
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted, teacher_comment) VALUES
(v_session, s_yasmine, sit_3_1_7, 'Le toit de l''immeuble de sa grand-mère. La nuit, on voit tout Paris qui brille. C''est là qu''elle va dessiner et écouter son walkman. Le sol est goudronné, y''a une antenne rouillée et des pigeons.', t0 + INTERVAL '38 min 25 sec', true, 'Image cinématographique forte'),
(v_session, s_karim, sit_3_1_7, 'Le local à vélos au sous-sol de la tour. Personne y va, ça pue l''humidité. Mais c''est là qu''il écrit.', t0 + INTERVAL '36 min 15 sec', false, NULL),
(v_session, s_lea, sit_3_1_7, 'La bibliothèque municipale. Elle y passe tous ses mercredis. C''est le seul endroit calme.', t0 + INTERVAL '40 min 10 sec', false, NULL),
(v_session, s_enzo, sit_3_1_7, 'Le terrain vague derrière le Lidl. Y''a un canapé abandonné, des graffitis, et c''est là que tout se passe.', t0 + INTERVAL '37 min 5 sec', false, NULL),
(v_session, s_fatou, sit_3_1_7, 'Le restaurant de l''oncle, le soir quand c''est fermé. Les tables sont empilées, l''odeur du couscous traîne encore, et Aïcha révise sous les néons.', t0 + INTERVAL '40 min 35 sec', true, 'Ambiance réaliste et sensorielle'),
(v_session, s_nathan, sit_3_1_7, 'Sa chambre. Poster de One Piece au mur, deux écrans, des canettes vides, et la lumière bleue du PC', t0 + INTERVAL '37 min 30 sec', false, NULL),
(v_session, s_ines, sit_3_1_7, 'Le banc du parc à côté du collège. Celui sous le grand platane. C''est là qu''elle va quand ça va pas.', t0 + INTERVAL '39 min 20 sec', false, NULL),
(v_session, s_rayan, sit_3_1_7, 'L''appartement des jumeaux. Petit, bruyant, avec des murs fins. On entend les voisins. Deux lits superposés dans 9m².', t0 + INTERVAL '36 min 50 sec', false, NULL),
(v_session, s_chloe, sit_3_1_7, 'La dalle du quartier. C''est une place en béton entre les tours, avec un banc cassé et un lampadaire qui clignote. Vu d''en haut c''est comme une scène de théâtre.', t0 + INTERVAL '38 min 40 sec', true, 'Le regard de réalisatrice, cohérent'),
(v_session, s_mamadou, sit_3_1_7, 'Le centre commercial la nuit. Les escalators arrêtés, les vitrines vides, l''écho de ses pas. C''est immense et silencieux comme une cathédrale.', t0 + INTERVAL '41 min 15 sec', true, 'Image très forte'),
(v_session, s_sarah, sit_3_1_7, 'Le RER B. Le trajet entre sa maison et Paris. C''est ni ici ni là-bas. C''est le lieu de l''entre-deux.', t0 + INTERVAL '40 min 0 sec', false, NULL),
(v_session, s_lucas, sit_3_1_7, 'La salle de boxe. Ça sent la sueur, le cuir et le désinfectant. Les néons grésillent.', t0 + INTERVAL '36 min 25 sec', false, NULL),
(v_session, s_amina, sit_3_1_7, 'La cage d''escalier de sa tour. Elle s''assoit entre le 3ème et le 4ème étage, là où personne passe, et la résonance est parfaite pour écouter de la musique.', t0 + INTERVAL '39 min 50 sec', false, NULL),
(v_session, s_theo, sit_3_1_7, 'Le jardin de la maison, la nuit. Le télescope est pointé vers le ciel. Autour c''est le pavillon, la haie, le silence de la banlieue résidentielle.', t0 + INTERVAL '41 min 30 sec', false, NULL),
(v_session, s_jade, sit_3_1_7, 'Le hall de l''immeuble. C''est là que tout le monde se croise, que les nouvelles circulent, que les drames se jouent.', t0 + INTERVAL '37 min 45 sec', false, NULL);

-- Q8: L'ambiance
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at) VALUES
(v_session, s_yasmine, sit_3_1_8, 'Mélancolique mais lumineuse. Comme un coucher de soleil d''hiver. Des couleurs froides avec des éclats de chaleur. La musique serait du piano avec des sons de la rue en fond.', t0 + INTERVAL '44 min 30 sec'),
(v_session, s_karim, sit_3_1_8, 'Sombre. Tendu. Comme la nuit avant un match. On sait qu''il va se passer un truc.', t0 + INTERVAL '42 min 20 sec'),
(v_session, s_lea, sit_3_1_8, 'Douce et triste. Comme de la pluie derrière une vitre.', t0 + INTERVAL '46 min 5 sec'),
(v_session, s_enzo, sit_3_1_8, 'Genre comédie dramatique. Tu rigoles et d''un coup BAM un truc triste arrive sans prévenir.', t0 + INTERVAL '43 min 10 sec'),
(v_session, s_fatou, sit_3_1_8, 'Réaliste et intense. Pas de musique d''ambiance. Juste les bruits de la vie : les casseroles, le RER, les discussions. Le réel c''est déjà cinématographique.', t0 + INTERVAL '46 min 40 sec'),
(v_session, s_nathan, sit_3_1_8, 'Epic. Genre musique orchestrale avec des bass drops. Tension maximale.', t0 + INTERVAL '42 min 45 sec'),
(v_session, s_ines, sit_3_1_8, 'Intime. Comme quand t''es sous ta couette avec tes écouteurs. Le monde est loin et t''es avec toi-même.', t0 + INTERVAL '45 min 20 sec'),
(v_session, s_rayan, sit_3_1_8, 'Chaotique. Deux ambiances qui se mélangent, comme les jumeaux. Un côté calme, un côté violent.', t0 + INTERVAL '42 min 55 sec'),
(v_session, s_chloe, sit_3_1_8, 'Néoréalisme italien. Caméra à l''épaule, lumière naturelle, dialogues qui sonnent vrai. Comme du Ken Loach.', t0 + INTERVAL '44 min 15 sec'),
(v_session, s_mamadou, sit_3_1_8, 'Le silence. Et dans ce silence, des échos lointains. Une radio quelque part. Un chien qui aboie. La vie continue dehors mais lui est dans son monde.', t0 + INTERVAL '47 min 30 sec'),
(v_session, s_sarah, sit_3_1_8, 'Entre deux. Ni joyeux ni triste. L''ambiance d''un voyage en train, quand tu regardes le paysage défiler et tu sais pas si t''es content ou triste.', t0 + INTERVAL '46 min 15 sec'),
(v_session, s_lucas, sit_3_1_8, 'Adrénaline. Le son d''un cœur qui bat vite. Des respirations fortes.', t0 + INTERVAL '42 min 35 sec'),
(v_session, s_amina, sit_3_1_8, 'Onirique. Comme un rêve éveillé. Les sons de la ville se transforment en mélodie. Les lumières des voitures deviennent des étoiles filantes.', t0 + INTERVAL '45 min 50 sec'),
(v_session, s_theo, sit_3_1_8, 'Nocturne et contemplative. La bande-son serait minimaliste. Du Nils Frahm ou du Ólafur Arnalds. Quelque chose de mathématiquement beau.', t0 + INTERVAL '47 min 10 sec'),
(v_session, s_jade, sit_3_1_8, 'Vivante ! Bruyante ! Des gens qui parlent fort, de la musique qui sort des fenêtres, des enfants qui crient. La vie quoi.', t0 + INTERVAL '43 min 40 sec');

-- ═══════════════════════════════════════════
-- 5. VOTES + CHOIX COLLECTIFS — Séance 1
-- On crée des votes sur Q1, Q2, Q4 (situations clés)
-- ═══════════════════════════════════════════

-- Mark vote options for Q1 (Le héros)
UPDATE responses SET is_vote_option = true
WHERE session_id = v_session AND situation_id = sit_3_1_1
AND student_id IN (s_yasmine, s_mamadou);

-- Votes for Q1: Yasmine's character wins (9 votes vs 6)
INSERT INTO votes (session_id, student_id, situation_id, chosen_response_id, voted_at)
SELECT v_session, voter.id, sit_3_1_1,
  (SELECT id FROM responses WHERE session_id = v_session AND situation_id = sit_3_1_1 AND student_id = s_yasmine),
  t0 + INTERVAL '50 min' + (random() * INTERVAL '2 min')
FROM students voter
WHERE voter.session_id = v_session AND voter.id IN (s_yasmine, s_lea, s_enzo, s_fatou, s_ines, s_chloe, s_amina, s_sarah, s_jade);

INSERT INTO votes (session_id, student_id, situation_id, chosen_response_id, voted_at)
SELECT v_session, voter.id, sit_3_1_1,
  (SELECT id FROM responses WHERE session_id = v_session AND situation_id = sit_3_1_1 AND student_id = s_mamadou),
  t0 + INTERVAL '50 min' + (random() * INTERVAL '2 min')
FROM students voter
WHERE voter.session_id = v_session AND voter.id IN (s_karim, s_nathan, s_rayan, s_mamadou, s_lucas, s_theo);

-- Collective choice Q1: Yasmine's Nora
INSERT INTO collective_choices (session_id, situation_id, category, restitution_label, chosen_text, source_response_id, validated_at)
VALUES (v_session, sit_3_1_1, 'personnage', 'Le héros',
  'C''est Nora, 16 ans. Elle porte toujours un vieux walkman avec une cassette que sa mère lui a laissée. Elle vit chez sa grand-mère à Clichy et elle dessine tout le temps dans les marges de ses cahiers.',
  (SELECT id FROM responses WHERE session_id = v_session AND situation_id = sit_3_1_1 AND student_id = s_yasmine),
  t0 + INTERVAL '52 min');

-- Collective choice Q2: Mamadou's desire wins
INSERT INTO collective_choices (session_id, situation_id, category, restitution_label, chosen_text, source_response_id, validated_at)
VALUES (v_session, sit_3_1_2, 'personnage', 'Son désir',
  'La paix. Juste la paix. Il a fui un pays en guerre, il a traversé la mer, il a perdu des gens. Maintenant il veut juste que le silence reste silencieux.',
  (SELECT id FROM responses WHERE session_id = v_session AND situation_id = sit_3_1_2 AND student_id = s_mamadou),
  t0 + INTERVAL '55 min');

-- Collective choice Q3: Enzo's flaw (the class was surprised)
INSERT INTO collective_choices (session_id, situation_id, category, restitution_label, chosen_text, source_response_id, validated_at)
VALUES (v_session, sit_3_1_3, 'personnage', 'Sa faille',
  'Il utilise l''humour pour cacher qu''il a peur. Genre il rigole de tout pour pas montrer que ça le touche. Mais du coup personne le prend au sérieux.',
  (SELECT id FROM responses WHERE session_id = v_session AND situation_id = sit_3_1_3 AND student_id = s_enzo),
  t0 + INTERVAL '58 min');

-- Collective choice Q4: Fatou's secret
INSERT INTO collective_choices (session_id, situation_id, category, restitution_label, chosen_text, source_response_id, validated_at)
VALUES (v_session, sit_3_1_4, 'personnage', 'Son secret',
  'Elle a falsifié un bulletin de notes. Pas pour elle, pour sa petite sœur qui allait se faire frapper par leur père si les notes étaient mauvaises.',
  (SELECT id FROM responses WHERE session_id = v_session AND situation_id = sit_3_1_4 AND student_id = s_fatou),
  t0 + INTERVAL '61 min');

-- Collective choice Q5: Yasmine's ally
INSERT INTO collective_choices (session_id, situation_id, category, restitution_label, chosen_text, source_response_id, validated_at)
VALUES (v_session, sit_3_1_5, 'liens', 'Le meilleur allié',
  'Sa grand-mère Mami Djamila. Elle cuisine des bricks en lui racontant des histoires du bled et c''est le seul moment où Nora se sent en paix.',
  (SELECT id FROM responses WHERE session_id = v_session AND situation_id = sit_3_1_5 AND student_id = s_yasmine),
  t0 + INTERVAL '64 min');

-- Collective choice Q6: Karim's rival
INSERT INTO collective_choices (session_id, situation_id, category, restitution_label, chosen_text, source_response_id, validated_at)
VALUES (v_session, sit_3_1_6, 'liens', 'Le rival',
  'Un mec du quartier, Sofiane. Il a tout ce que Karim veut : le respect, l''argent, les gens qui l''écoutent. Sauf que Sofiane fait des trucs pas nets.',
  (SELECT id FROM responses WHERE session_id = v_session AND situation_id = sit_3_1_6 AND student_id = s_karim),
  t0 + INTERVAL '67 min');

-- Collective choice Q7: Mamadou's place
INSERT INTO collective_choices (session_id, situation_id, category, restitution_label, chosen_text, source_response_id, validated_at)
VALUES (v_session, sit_3_1_7, 'environnement', 'Le lieu',
  'Le centre commercial la nuit. Les escalators arrêtés, les vitrines vides, l''écho de ses pas. C''est immense et silencieux comme une cathédrale.',
  (SELECT id FROM responses WHERE session_id = v_session AND situation_id = sit_3_1_7 AND student_id = s_mamadou),
  t0 + INTERVAL '70 min');

-- Collective choice Q8: Fatou's ambiance
INSERT INTO collective_choices (session_id, situation_id, category, restitution_label, chosen_text, source_response_id, validated_at)
VALUES (v_session, sit_3_1_8, 'environnement', 'L''ambiance',
  'Réaliste et intense. Pas de musique d''ambiance. Juste les bruits de la vie : les casseroles, le RER, les discussions. Le réel c''est déjà cinématographique.',
  (SELECT id FROM responses WHERE session_id = v_session AND situation_id = sit_3_1_8 AND student_id = s_fatou),
  t0 + INTERVAL '73 min');

-- ═══════════════════════════════════════════
-- 6. ANNOTATIONS PROF — évaluations qualitatives
-- ═══════════════════════════════════════════
INSERT INTO annotations (session_id, student_id, situation_id, content, type, created_at) VALUES
-- Encouragements
(v_session, s_yasmine, sit_3_1_1, 'Yasmine a un vrai talent narratif. Le walkman comme objet-lien est une trouvaille. À encourager à développer.', 'encouragement', t0 + INTERVAL '48 min'),
(v_session, s_mamadou, sit_3_1_2, 'Mamadou est discret mais quand il écrit, c''est d''une profondeur rare. Il a vécu des choses qui nourrissent son écriture.', 'encouragement', t0 + INTERVAL '55 min'),
(v_session, s_enzo, sit_3_1_3, 'Tournant dans la session pour Enzo. Il est passé du mode "clown" à quelque chose de sincère. Sa faille = sa propre stratégie de défense. Bravo.', 'encouragement', t0 + INTERVAL '58 min'),
(v_session, s_fatou, sit_3_1_4, 'Fatou propose des dilemmes moraux d''une maturité impressionnante. Le bulletin falsifié pour protéger la sœur = conflit éthique puissant.', 'encouragement', t0 + INTERVAL '62 min'),
(v_session, s_ines, sit_3_1_1, 'Inès a une sensibilité qui transparaît dans chaque réponse. Elle capte les émotions comme personne dans cette classe.', 'encouragement', t0 + INTERVAL '50 min'),
-- Notes pédagogiques
(v_session, s_lea, NULL, 'Léa met du temps à écrire mais ses réponses gagnent en qualité. Les 2 premières étaient timides, à partir de Q4 elle s''est lâchée. Progression nette.', 'note', t0 + INTERVAL '65 min'),
(v_session, s_rayan, NULL, 'Rayan challenge le format (jumeaux au lieu d''un héros) mais c''est productif. Ses réponses sont toujours décalées ET pertinentes.', 'note', t0 + INTERVAL '60 min'),
(v_session, s_chloe, NULL, 'Chloé fait beaucoup de références cinéma (Varda, Loach, Ladj Ly). Ça montre une vraie culture mais attention à pas juste copier.', 'note', t0 + INTERVAL '63 min'),
(v_session, s_nathan, NULL, 'Nathan reste dans ses références manga/gaming. Pas grave en soi mais il faudrait l''amener à trouver SA voix, pas celle de Naruto.', 'note', t0 + INTERVAL '55 min'),
(v_session, s_lucas, NULL, 'Lucas écrit court et direct. C''est pas un défaut — c''est un style. Ses réponses sont efficaces comme des uppercuts.', 'note', t0 + INTERVAL '58 min'),
-- Alertes
(v_session, s_enzo, sit_3_1_4, 'Enzo a révélé une situation de vie compliquée (dort pas chez lui). À surveiller, peut-être en parler avec le CPE.', 'alerte', t0 + INTERVAL '62 min'),
(v_session, s_ines, sit_3_1_4, 'Inès mentionne des médicaments pour l''anxiété. Pas alarmant en soi mais à garder en tête. Vérifier si l''infirmière est au courant.', 'alerte', t0 + INTERVAL '63 min');

-- ═══════════════════════════════════════════
-- 7. MODULE 3 — SÉANCE 2: "Il se passe quoi ?"
-- Réponses condensées pour les 8 situations
-- Timing: t0 + 75min (après pause)
-- ═══════════════════════════════════════════

-- Q1 Séance 2: Le déclencheur
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted) VALUES
(v_session, s_yasmine, sit_3_2_1, 'La grand-mère de Nora fait un AVC. À l''hôpital, délirante, elle murmure une adresse que Nora n''a jamais entendue. C''est l''adresse de sa mère.', t0 + INTERVAL '77 min 20 sec', true),
(v_session, s_karim, sit_3_2_1, 'Son carnet de textes disparaît. Quelqu''un l''a trouvé et les a postés anonymement sur Instagram. Tout le quartier lit ses textes.', t0 + INTERVAL '75 min 40 sec', true),
(v_session, s_lea, sit_3_2_1, 'Un nouveau arrive au collège. C''est le premier à la regarder. Vraiment la regarder.', t0 + INTERVAL '79 min 10 sec', false),
(v_session, s_enzo, sit_3_2_1, 'Un soir il rentre et ses affaires sont sur le palier. Sa mère a changé les serrures sans prévenir.', t0 + INTERVAL '76 min 15 sec', true),
(v_session, s_fatou, sit_3_2_1, 'Le proviseur convoque Aïcha : "On sait que tu travailles le soir. C''est incompatible avec la bourse. Il faut choisir."', t0 + INTERVAL '79 min 45 sec', true),
(v_session, s_nathan, sit_3_2_1, 'Son compte Twitch est découvert par les harceleurs du collège. Ils spamment son chat avec des insultes.', t0 + INTERVAL '76 min 50 sec', false),
(v_session, s_ines, sit_3_2_1, 'Sa sœur aînée lui annonce qu''elle revient pas pour les vacances. Pour la première fois, Luna se retrouve vraiment seule.', t0 + INTERVAL '78 min 30 sec', false),
(v_session, s_rayan, sit_3_2_1, 'Leur mère annonce qu''elle peut garder qu''un seul jumeau. L''autre ira chez le père au bled.', t0 + INTERVAL '75 min 55 sec', true),
(v_session, s_chloe, sit_3_2_1, 'En visionnant ses rushs, Salomé découvre qu''elle a filmé par accident un deal dans le quartier. Et on reconnaît les visages.', t0 + INTERVAL '77 min 45 sec', false),
(v_session, s_mamadou, sit_3_2_1, 'Lettre de la mairie : le centre commercial sera démoli dans 30 jours. Ibrahim doit partir.', t0 + INTERVAL '80 min 10 sec', false),
(v_session, s_sarah, sit_3_2_1, 'Elle retrouve par hasard le profil Instagram de la fille qui la harcelait au Japon. Et elle voit qu''elle poste des photos souriantes. Comme si rien ne s''était passé.', t0 + INTERVAL '79 min 25 sec', false),
(v_session, s_lucas, sit_3_2_1, 'Diagnostic du médecin : il a une blessure au poignet. S''il boxe au championnat, il risque de perdre l''usage de sa main.', t0 + INTERVAL '76 min 5 sec', false),
(v_session, s_amina, sit_3_2_1, 'Quelqu''un a trouvé son dossier de musique et l''a envoyé à un producteur local. Il veut la rencontrer. Elle panique.', t0 + INTERVAL '78 min 55 sec', false),
(v_session, s_theo, sit_3_2_1, 'Le test ADN qu''il a fait en secret revient. L''homme sur les photos de famille n''est pas son père biologique.', t0 + INTERVAL '80 min 30 sec', true),
(v_session, s_jade, sit_3_2_1, 'Ses parents annoncent le divorce devant toute la famille. Au dîner de l''Aïd. Personne parle.', t0 + INTERVAL '77 min 10 sec', false);

-- Collective choice Q1 Séance 2: Fatou's trigger
INSERT INTO collective_choices (session_id, situation_id, category, restitution_label, chosen_text, source_response_id, validated_at)
VALUES (v_session, sit_3_2_1, 'conflit', 'Le déclencheur',
  'Le proviseur convoque Aïcha : "On sait que tu travailles le soir. C''est incompatible avec la bourse. Il faut choisir."',
  (SELECT id FROM responses WHERE session_id = v_session AND situation_id = sit_3_2_1 AND student_id = s_fatou),
  t0 + INTERVAL '85 min');

-- Q2-Q8 Séance 2: collective choices only (réponses omises pour la taille)
INSERT INTO collective_choices (session_id, situation_id, category, restitution_label, chosen_text, source_response_id, validated_at) VALUES
(v_session, sit_3_2_2, 'conflit', 'L''obstacle', 'Le proviseur a déjà prévenu le rectorat. Si Aïcha ne quitte pas le restaurant, elle perd la bourse et retourne en filière générale.', NULL, t0 + INTERVAL '90 min'),
(v_session, sit_3_2_3, 'conflit', 'La trahison', 'C''est Mariama, sa meilleure amie, qui a parlé au proviseur. Elle pensait aider Aïcha mais elle a tout fait exploser.', NULL, t0 + INTERVAL '95 min'),
(v_session, sit_3_2_4, 'trajectoire', 'Le choix', 'Soit elle garde le restaurant et sa famille mange. Soit elle garde la bourse et sa famille coule. Pas de bon choix.', NULL, t0 + INTERVAL '100 min'),
(v_session, sit_3_2_5, 'trajectoire', 'La montée', 'Son père découvre qu''elle a falsifié le bulletin de la petite sœur. La confiance est brisée. Et le proviseur lui laisse 48h pour décider.', NULL, t0 + INTERVAL '105 min'),
(v_session, sit_3_2_6, 'conflit', 'Le point bas', 'Seule dans le restaurant fermé, la nuit. Mariama répond plus. Son père lui parle plus. La petite sœur pleure. Et la lettre de la bourse est sur la table.', NULL, t0 + INTERVAL '110 min'),
(v_session, sit_3_2_7, 'trajectoire', 'Le sursaut', 'La petite sœur vient la trouver au restaurant avec un dessin : "merci d''avoir menti pour moi". Aïcha comprend pourquoi elle se bat.', NULL, t0 + INTERVAL '115 min'),
(v_session, sit_3_2_8, 'conflit', 'La confrontation', 'Elle va voir le proviseur. Elle lui dit tout. La vérité complète. Le restaurant, le bulletin, la sœur, tout. Elle tremble mais elle parle.', NULL, t0 + INTERVAL '120 min');

-- ═══════════════════════════════════════════
-- 8. MODULE 3 — SÉANCE 3: "Ça raconte quoi en vrai ?"
-- ═══════════════════════════════════════════

INSERT INTO collective_choices (session_id, situation_id, category, restitution_label, chosen_text, source_response_id, validated_at) VALUES
(v_session, sit_3_3_1, 'trajectoire', 'La résolution', 'Le proviseur est ému. Il trouve un arrangement : Aïcha pourra travailler le samedi seulement, avec un aménagement d''emploi du temps. La bourse est maintenue sous conditions.', NULL, t0 + INTERVAL '125 min'),
(v_session, sit_3_3_2, 'trajectoire', 'Le prix payé', 'Mariama et Aïcha ne seront plus jamais les mêmes. Leur amitié a survécu mais elle est fissurée. Et son père, même s''il a pardonné, la regarde différemment.', NULL, t0 + INTERVAL '128 min'),
(v_session, sit_3_3_3, 'intention', 'La leçon', 'Ce film parle de tous les gamins qui portent le poids de leur famille sur leurs épaules. Ceux qui grandissent trop vite. Et il dit qu''on peut demander de l''aide sans avoir honte.', NULL, t0 + INTERVAL '131 min'),
(v_session, sit_3_3_4, 'renforcement', 'La dernière scène', 'Aïcha marche vers le lycée, sac sur le dos. La petite sœur lui fait signe depuis la fenêtre. Le soleil se lève sur la cité. Pour la première fois, Aïcha ne regarde pas en arrière.', NULL, t0 + INTERVAL '134 min'),
(v_session, sit_3_3_5, 'renforcement', 'Le titre', 'Les Étoiles de Clichy', NULL, t0 + INTERVAL '137 min');

-- ═══════════════════════════════════════════
-- 9. STATS RÉSUMÉES pour analytics
-- Mise à jour de la session en mode "done"
-- ═══════════════════════════════════════════

-- Update session final state
UPDATE sessions SET
  status = 'done',
  current_module = 3,
  current_seance = 3,
  current_situation_index = 5,
  updated_at = t0 + INTERVAL '140 min'
WHERE id = v_session;

-- Update last_seen_at pour tous les étudiants
UPDATE students SET last_seen_at = t0 + INTERVAL '140 min'
WHERE session_id = v_session;

-- ═══════════════════════════════════════════
-- 8. SCORING — Notes prof + IA
-- ═══════════════════════════════════════════
-- teacher_score: note du prof (1-5, 0 = pas noté)
-- ai_score: note IA (1-5, 0 = pas évalué)
-- ai_feedback: commentaire IA court

-- Yasmine 🌸 — créative, poétique, détaillée → prof: 4-5, IA: 4-5
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Réponse riche et très détaillée, personnage vivant'
WHERE session_id = v_session AND student_id = s_yasmine AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 5, ai_score = 4, ai_feedback = 'Fil conducteur narratif bien pensé'
WHERE session_id = v_session AND student_id = s_yasmine AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Imaginaire riche et cohérent'
WHERE session_id = v_session AND student_id = s_yasmine AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Scène cinématographique très visuelle'
WHERE session_id = v_session AND student_id = s_yasmine AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Bonne construction du personnage'
WHERE session_id = v_session AND student_id = s_yasmine AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 4, ai_score = 5, ai_feedback = 'Tension narrative excellente'
WHERE session_id = v_session AND student_id = s_yasmine AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 5, ai_score = 4, ai_feedback = 'Idée originale et forte'
WHERE session_id = v_session AND student_id = s_yasmine AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Conclusion poétique et cohérente'
WHERE session_id = v_session AND student_id = s_yasmine AND situation_id = sit_3_1_8;

-- Karim 🔥 — leader, court mais percutant → prof: 3-4, IA: 3-4
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Réponse courte mais efficace, manque de détails'
WHERE session_id = v_session AND student_id = s_karim AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Puissant en peu de mots, émotion brute'
WHERE session_id = v_session AND student_id = s_karim AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Bref mais pertinent'
WHERE session_id = v_session AND student_id = s_karim AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 4, ai_score = 3, ai_feedback = 'Style direct, manque un peu de nuance'
WHERE session_id = v_session AND student_id = s_karim AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Idée correcte, développement minimal'
WHERE session_id = v_session AND student_id = s_karim AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Tension bien rendue'
WHERE session_id = v_session AND student_id = s_karim AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Cohérent mais peu développé'
WHERE session_id = v_session AND student_id = s_karim AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Résolution trop rapide'
WHERE session_id = v_session AND student_id = s_karim AND situation_id = sit_3_1_8;

-- Léa 🦋 — timide, s'épanouit → prof: 2-4, IA: 2-3
UPDATE responses SET teacher_score = 2, ai_score = 2, ai_feedback = 'Trop court, personnage peu défini'
WHERE session_id = v_session AND student_id = s_lea AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 2, ai_score = 2, ai_feedback = 'Basique mais sincère'
WHERE session_id = v_session AND student_id = s_lea AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Progrès, plus développé'
WHERE session_id = v_session AND student_id = s_lea AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Montée en qualité encourageante'
WHERE session_id = v_session AND student_id = s_lea AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Réponse correcte'
WHERE session_id = v_session AND student_id = s_lea AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Bon effort de réflexion'
WHERE session_id = v_session AND student_id = s_lea AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 4, ai_score = 3, ai_feedback = 'Belle progression dans la séance'
WHERE session_id = v_session AND student_id = s_lea AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Très bien, Léa s''est vraiment libérée'
WHERE session_id = v_session AND student_id = s_lea AND situation_id = sit_3_1_8;

-- Enzo 😂 — clown mais éclairs de génie → prof: 1-4, IA: 1-3
UPDATE responses SET teacher_score = 2, ai_score = 1, ai_feedback = 'Humour mais hors-sujet, pas un vrai personnage'
WHERE session_id = v_session AND student_id = s_enzo AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 3, ai_score = 2, ai_feedback = 'Début humoristique puis réflexion intéressante'
WHERE session_id = v_session AND student_id = s_enzo AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 2, ai_score = 2, ai_feedback = 'Trop dans la blague, peu de contenu narratif'
WHERE session_id = v_session AND student_id = s_enzo AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Éclair de génie ! Idée vraiment originale'
WHERE session_id = v_session AND student_id = s_enzo AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 2, ai_score = 2, ai_feedback = 'Retour au mode blague'
WHERE session_id = v_session AND student_id = s_enzo AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Correct quand il fait un effort'
WHERE session_id = v_session AND student_id = s_enzo AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 2, ai_score = 1, ai_feedback = 'Réponse pas sérieuse'
WHERE session_id = v_session AND student_id = s_enzo AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Fin acceptable, signe de potentiel'
WHERE session_id = v_session AND student_id = s_enzo AND situation_id = sit_3_1_8;

-- Fatou 📚 — studieuse, toujours complète → prof: 4-5, IA: 4-5
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Contexte social très bien posé, personnage complet'
WHERE session_id = v_session AND student_id = s_fatou AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Enjeu crédible et concret'
WHERE session_id = v_session AND student_id = s_fatou AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Développement structuré et cohérent'
WHERE session_id = v_session AND student_id = s_fatou AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 5, ai_score = 4, ai_feedback = 'Réflexion mature et bien articulée'
WHERE session_id = v_session AND student_id = s_fatou AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Toujours pertinente et complète'
WHERE session_id = v_session AND student_id = s_fatou AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 4, ai_score = 5, ai_feedback = 'Tension narrative bien construite'
WHERE session_id = v_session AND student_id = s_fatou AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Excellente cohérence globale'
WHERE session_id = v_session AND student_id = s_fatou AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Conclusion brillante, Fatou modèle'
WHERE session_id = v_session AND student_id = s_fatou AND situation_id = sit_3_1_8;

-- Nathan 🎮 — gamer, références pop → prof: 2-3, IA: 2-3
UPDATE responses SET teacher_score = 2, ai_score = 2, ai_feedback = 'Trop calqué sur un anime, peu original'
WHERE session_id = v_session AND student_id = s_nathan AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 2, ai_score = 2, ai_feedback = 'Référence manga au lieu de créer'
WHERE session_id = v_session AND student_id = s_nathan AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Mieux, idée personnelle qui émerge'
WHERE session_id = v_session AND student_id = s_nathan AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 3, ai_score = 2, ai_feedback = 'Encore trop de références externes'
WHERE session_id = v_session AND student_id = s_nathan AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Correct, s''éloigne des clichés'
WHERE session_id = v_session AND student_id = s_nathan AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Progression notable dans la séance'
WHERE session_id = v_session AND student_id = s_nathan AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Idée convenable'
WHERE session_id = v_session AND student_id = s_nathan AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Fin acceptable mais prévisible'
WHERE session_id = v_session AND student_id = s_nathan AND situation_id = sit_3_1_8;

-- Inès 💜 — empathique, émotions → prof: 4-5, IA: 3-4
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Émotion sincère et forte'
WHERE session_id = v_session AND student_id = s_ines AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 5, ai_score = 4, ai_feedback = 'Profondeur émotionnelle remarquable'
WHERE session_id = v_session AND student_id = s_ines AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 4, ai_score = 3, ai_feedback = 'Émotion juste mais peu de structure narrative'
WHERE session_id = v_session AND student_id = s_ines AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Touche toujours juste émotionnellement'
WHERE session_id = v_session AND student_id = s_ines AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 4, ai_score = 3, ai_feedback = 'Bonne sensibilité, cadre narratif à renforcer'
WHERE session_id = v_session AND student_id = s_ines AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 5, ai_score = 4, ai_feedback = 'Moment de grâce, très mature'
WHERE session_id = v_session AND student_id = s_ines AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Empathie profonde, belle écriture'
WHERE session_id = v_session AND student_id = s_ines AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Très investie émotionnellement'
WHERE session_id = v_session AND student_id = s_ines AND situation_id = sit_3_1_8;

-- Rayan ⚡ — rebelle, challenge le format → prof: 3-4, IA: 3-4
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Idée originale de dédoubler le héros'
WHERE session_id = v_session AND student_id = s_rayan AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Le conflit interne comme désir, intéressant'
WHERE session_id = v_session AND student_id = s_rayan AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Provocateur mais réfléchi'
WHERE session_id = v_session AND student_id = s_rayan AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Questionnement pertinent du format'
WHERE session_id = v_session AND student_id = s_rayan AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Bon, mais manque de construction'
WHERE session_id = v_session AND student_id = s_rayan AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Idée subversive et intelligente'
WHERE session_id = v_session AND student_id = s_rayan AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Posture rebelle maintenue, cohérent'
WHERE session_id = v_session AND student_id = s_rayan AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 4, ai_score = 3, ai_feedback = 'Fin provocatrice mais pertinente'
WHERE session_id = v_session AND student_id = s_rayan AND situation_id = sit_3_1_8;

-- Chloé 🎬 — cinéphile, références de films → prof: 4, IA: 3-4
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Mise en abyme intéressante'
WHERE session_id = v_session AND student_id = s_chloe AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Référence pertinente mais pas assez personnel'
WHERE session_id = v_session AND student_id = s_chloe AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Regard cinématographique intéressant'
WHERE session_id = v_session AND student_id = s_chloe AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 4, ai_score = 3, ai_feedback = 'Bonne culture ciné mais manque d''originalité propre'
WHERE session_id = v_session AND student_id = s_chloe AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Très bonne analyse visuelle'
WHERE session_id = v_session AND student_id = s_chloe AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Vocabulaire cinéma maîtrisé'
WHERE session_id = v_session AND student_id = s_chloe AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Solide et cultivée'
WHERE session_id = v_session AND student_id = s_chloe AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Conclusion cinématographique réussie'
WHERE session_id = v_session AND student_id = s_chloe AND situation_id = sit_3_1_8;

-- Mamadou 🌍 — discret mais brillant → prof: 4-5, IA: 4-5
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Personnage inattendu et puissant'
WHERE session_id = v_session AND student_id = s_mamadou AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Profondeur rare, réponse courte mais riche'
WHERE session_id = v_session AND student_id = s_mamadou AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Maturité exceptionnelle'
WHERE session_id = v_session AND student_id = s_mamadou AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 4, ai_score = 5, ai_feedback = 'Profond et original'
WHERE session_id = v_session AND student_id = s_mamadou AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Chaque mot compte, brillant'
WHERE session_id = v_session AND student_id = s_mamadou AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Le meilleur de la classe sur cette question'
WHERE session_id = v_session AND student_id = s_mamadou AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Toujours pertinent'
WHERE session_id = v_session AND student_id = s_mamadou AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Conclusion magistrale'
WHERE session_id = v_session AND student_id = s_mamadou AND situation_id = sit_3_1_8;

-- Sarah ✨ — perfectionniste, qualité haute → prof: 4, IA: 3-4
UPDATE responses SET teacher_score = 4, ai_score = 3, ai_feedback = 'Personnage bien construit mais un peu classique'
WHERE session_id = v_session AND student_id = s_sarah AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Bonne construction du désir'
WHERE session_id = v_session AND student_id = s_sarah AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Travail soigné et détaillé'
WHERE session_id = v_session AND student_id = s_sarah AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Qualité constante'
WHERE session_id = v_session AND student_id = s_sarah AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Toujours appliquée'
WHERE session_id = v_session AND student_id = s_sarah AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 4, ai_score = 3, ai_feedback = 'Correcte mais manque de prise de risque'
WHERE session_id = v_session AND student_id = s_sarah AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Solide'
WHERE session_id = v_session AND student_id = s_sarah AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Conclusion propre et soignée'
WHERE session_id = v_session AND student_id = s_sarah AND situation_id = sit_3_1_8;

-- Lucas ⚽ — sportif, réponses courtes → prof: 2-3, IA: 2
UPDATE responses SET teacher_score = 2, ai_score = 2, ai_feedback = 'Trop court, manque de profondeur'
WHERE session_id = v_session AND student_id = s_lucas AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 2, ai_score = 2, ai_feedback = 'Idée basique, peu développée'
WHERE session_id = v_session AND student_id = s_lucas AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 2, ai_score = 2, ai_feedback = 'Effort minimal'
WHERE session_id = v_session AND student_id = s_lucas AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 3, ai_score = 2, ai_feedback = 'Un peu mieux mais reste surface'
WHERE session_id = v_session AND student_id = s_lucas AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 2, ai_score = 2, ai_feedback = 'Court et prévisible'
WHERE session_id = v_session AND student_id = s_lucas AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 2, ai_score = 2, ai_feedback = 'Manque d''investissement'
WHERE session_id = v_session AND student_id = s_lucas AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 3, ai_score = 2, ai_feedback = 'Correct mais sans relief'
WHERE session_id = v_session AND student_id = s_lucas AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 2, ai_score = 2, ai_feedback = 'Résolution trop simple'
WHERE session_id = v_session AND student_id = s_lucas AND situation_id = sit_3_1_8;

-- Amina 🌙 — rêveuse, poétique → prof: 4-5, IA: 4
UPDATE responses SET teacher_score = 5, ai_score = 4, ai_feedback = 'Très poétique et sensoriel'
WHERE session_id = v_session AND student_id = s_amina AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Belle écriture, monde intérieur riche'
WHERE session_id = v_session AND student_id = s_amina AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Imaginaire poétique constant'
WHERE session_id = v_session AND student_id = s_amina AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 4, ai_score = 3, ai_feedback = 'Poésie belle mais narration à structurer'
WHERE session_id = v_session AND student_id = s_amina AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Style personnel affirmé'
WHERE session_id = v_session AND student_id = s_amina AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 5, ai_score = 4, ai_feedback = 'Moment de grâce poétique'
WHERE session_id = v_session AND student_id = s_amina AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Cohérence stylistique remarquable'
WHERE session_id = v_session AND student_id = s_amina AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Conclusion magnifique'
WHERE session_id = v_session AND student_id = s_amina AND situation_id = sit_3_1_8;

-- Théo 🧠 — rationnel, analytique → prof: 3-4, IA: 3-4
UPDATE responses SET teacher_score = 3, ai_score = 4, ai_feedback = 'Personnage bien construit, cohérent mais froid'
WHERE session_id = v_session AND student_id = s_theo AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Logique mais manque d''émotion'
WHERE session_id = v_session AND student_id = s_theo AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Analyse pertinente et structurée'
WHERE session_id = v_session AND student_id = s_theo AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Trop cérébral, cinéma = émotion aussi'
WHERE session_id = v_session AND student_id = s_theo AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Bonne rigueur narrative'
WHERE session_id = v_session AND student_id = s_theo AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Progression, plus d''émotion apparaît'
WHERE session_id = v_session AND student_id = s_theo AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Réponse correcte et logique'
WHERE session_id = v_session AND student_id = s_theo AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Conclusion réfléchie'
WHERE session_id = v_session AND student_id = s_theo AND situation_id = sit_3_1_8;

-- Jade 💎 — sociable, bavarde → prof: 3, IA: 2-3
UPDATE responses SET teacher_score = 3, ai_score = 2, ai_feedback = 'Idée sympa mais reste en surface'
WHERE session_id = v_session AND student_id = s_jade AND situation_id = sit_3_1_1;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Énergie communicative mais peu de profondeur'
WHERE session_id = v_session AND student_id = s_jade AND situation_id = sit_3_1_2;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Correct, social mais narratif ?'
WHERE session_id = v_session AND student_id = s_jade AND situation_id = sit_3_1_3;
UPDATE responses SET teacher_score = 3, ai_score = 2, ai_feedback = 'Trop bavard, peu d''enjeu narratif'
WHERE session_id = v_session AND student_id = s_jade AND situation_id = sit_3_1_4;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Idée relationnelle intéressante'
WHERE session_id = v_session AND student_id = s_jade AND situation_id = sit_3_1_5;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Bonnes interactions mais manque de fond'
WHERE session_id = v_session AND student_id = s_jade AND situation_id = sit_3_1_6;
UPDATE responses SET teacher_score = 3, ai_score = 2, ai_feedback = 'Reste surface'
WHERE session_id = v_session AND student_id = s_jade AND situation_id = sit_3_1_7;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Fin correcte'
WHERE session_id = v_session AND student_id = s_jade AND situation_id = sit_3_1_8;

-- ── Scores Séance 2 Q1 (les 15 réponses insérées) ──
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Vision cinématographique exceptionnelle'
WHERE session_id = v_session AND student_id = s_yasmine AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 4, ai_score = 3, ai_feedback = 'Direct et efficace'
WHERE session_id = v_session AND student_id = s_karim AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Belle progression depuis la séance 1'
WHERE session_id = v_session AND student_id = s_lea AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 3, ai_score = 2, ai_feedback = 'Humour mais idée sous-jacente'
WHERE session_id = v_session AND student_id = s_enzo AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Excellente, comme toujours'
WHERE session_id = v_session AND student_id = s_fatou AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'S''améliore petit à petit'
WHERE session_id = v_session AND student_id = s_nathan AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Toujours émouvante'
WHERE session_id = v_session AND student_id = s_ines AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Questionnement pertinent'
WHERE session_id = v_session AND student_id = s_rayan AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Bonne analyse visuelle'
WHERE session_id = v_session AND student_id = s_chloe AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 5, ai_score = 5, ai_feedback = 'Profondeur incroyable'
WHERE session_id = v_session AND student_id = s_mamadou AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Toujours soignée'
WHERE session_id = v_session AND student_id = s_sarah AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 2, ai_score = 2, ai_feedback = 'Trop court'
WHERE session_id = v_session AND student_id = s_lucas AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 5, ai_score = 4, ai_feedback = 'Très poétique'
WHERE session_id = v_session AND student_id = s_amina AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 4, ai_score = 4, ai_feedback = 'Structuré et réfléchi'
WHERE session_id = v_session AND student_id = s_theo AND situation_id = sit_3_2_1;
UPDATE responses SET teacher_score = 3, ai_score = 3, ai_feedback = 'Agréable mais manque de fond'
WHERE session_id = v_session AND student_id = s_jade AND situation_id = sit_3_2_1;

RAISE NOTICE 'Seed complete! Session ID: %, Join code: DEMO42', v_session;

END $$;
