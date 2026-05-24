# Juliedash — Récapitulatif de cadrage projet

## 1. Décision de positionnement

Le projet **Juliedash** n’est pas une simple application de réservation.

C’est une **application de gestion métier centrée client, avec réservation contrôlée**.

L’objectif n’est pas de reproduire Calendly, ni de construire un agenda autonome qui décide à la place de Julie. L’objectif est de fournir à Julie un outil métier privé qui l’aide à :

- gérer ses clients/patients dans la durée ;
- recevoir des demandes de rendez-vous depuis une page publique ;
- garder le contrôle humain sur la confirmation des rendez-vous ;
- organiser son planning sans subir les trous ;
- proposer des micro-décalages aux clients quand son planning se remplit ;
- enregistrer paiements, absences, notes et rappels ;
- produire des exports ou facturettes si besoin.

Phrase de référence :

> Juliedash est une application métier privée pour Julie, avec une entrée publique sans compte, permettant de gérer le cycle complet : demande de rendez-vous → validation humaine → ajustements horaires → séance réalisée → paiement → suivi client.

---

## 2. Pourquoi repartir sur un nouveau projet

Il est recommandé de créer un **nouveau repo / nouveau dossier vierge**, par exemple :

```text
juliedash/
```

Raison : l’ancien projet `bienetre-dashboard` a été construit progressivement autour de Calendly, des paiements, d’un dashboard et d’expérimentations successives. Il contient beaucoup d’apprentissage utile, mais son centre de gravité n’est plus le bon.

La nouvelle app doit partir d’un modèle clair :

```text
Client → Demandes → Rendez-vous → Séances → Paiements → Factures → Rappels
```

et non :

```text
Calendly → Événements → Paiements
```

L’ancien projet reste une référence d’expérience : Docker, Prisma, SMTP, facturation, dashboard, déploiement VPS, mais il ne doit pas être prolongé directement pour cette nouvelle vision.

---

## 3. Transition avec Calendly

Calendly ne doit pas disparaître brutalement.

Pendant une période transitoire estimée à **3 à 4 mois**, Calendly reste utilisé comme **source externe en lecture seule**.

Cela signifie :

- l’app importe les rendez-vous Calendly ;
- ces rendez-vous bloquent les créneaux disponibles ;
- Julie peut les voir dans son agenda Juliedash ;
- Julie peut éventuellement les rattacher à une fiche client ;
- Julie ne peut pas les modifier depuis Juliedash ;
- aucune synchronisation bidirectionnelle Calendly n’est prévue ;
- Juliedash ne doit pas tenter de déplacer, annuler ou modifier un rendez-vous Calendly via API.

Calendly est donc une **source temporaire de blocage et d’historique**, pas un système partenaire durable.

Objectif long terme :

```text
Calendly disparaît progressivement.
Juliedash devient la source de vérité pour les rendez-vous.
```

---

## 4. Deux grands pans fonctionnels

### 4.1 Avant le rendez-vous : interaction client sans compte

Le client n’a pas de compte.

Il interagit uniquement via :

- une page publique de demande de rendez-vous ;
- des emails ;
- des liens sécurisés par token pour accepter/refuser une proposition de changement.

Le client ne gère pas un espace personnel.

Objectif : permettre au client de demander un rendez-vous, puis éventuellement répondre à une proposition de décalage.

### 4.2 Après le rendez-vous : traitement métier interne Julie

Une fois le rendez-vous passé, Julie enrichit son outil métier :

- rendez-vous réalisé ;
- absence / lapin ;
- paiement ;
- facturette éventuelle ;
- notes de séance ;
- rappels ;
- historique client.

Cette partie est plus simple fonctionnellement car seule Julie y accède.

---

## 5. Parcours client public

### Étape 1 — Demande de rendez-vous

Le client arrive sur :

```text
/reservation
```

Il renseigne :

- type de séance ou durée ;
- créneau souhaité ;
- nom ;
- prénom ;
- email ;
- téléphone ;
- message libre éventuel.

Le client ne réserve pas définitivement.

Il crée une **demande de rendez-vous**.

Email automatique possible :

> Votre demande de rendez-vous a bien été reçue. Julie va la consulter et vous confirmera le rendez-vous ou vous proposera un ajustement si besoin.

### Étape 2 — Confirmation par Julie

Julie peut accepter la demande.

Le client reçoit alors une confirmation du type :

> Votre rendez-vous est accepté pour le [date] à [heure]. Julie se réserve la possibilité de vous proposer un léger ajustement horaire si cela permet d’organiser au mieux sa journée. Aucun changement ne sera appliqué sans votre accord.

Notion importante : le rendez-vous peut être **accepté mais encore ajustable**.

### Étape 3 — Proposition de décalage ultérieure

Quand la semaine se remplit, Julie peut proposer un décalage :

- avancer de 30 minutes ;
- reculer de 30 minutes ;
- proposer un autre horaire.

Le client reçoit un email avec lien sécurisé.

Il peut répondre :

- j’accepte ;
- je refuse.

Selon la règle métier prudente, l’acceptation client ne déplace pas forcément immédiatement le rendez-vous. Julie peut garder une validation finale.

---

## 6. Parcours Julie admin

Julie accède à une interface privée protégée par login.

Pages envisagées :

```text
/admin
/admin/agenda
/admin/disponibilites
/admin/demandes
/admin/imports/calendly
/admin/clients
/admin/clients/[id]
/admin/paiements
/admin/factures
/admin/rappels
```

### Dashboard

Vue synthétique :

- demandes en attente ;
- rendez-vous du jour ou de la semaine ;
- propositions de décalage en attente ;
- paiements à saisir ;
- rappels à traiter ;
- clients récents.

### Disponibilités

Julie définit des plages larges :

```text
08:00–13:00
14:00–19:00
```

Les clients demandent des rendez-vous dans ces plages.

La V1 ne doit pas forcément avoir une interface drag-and-drop sophistiquée. Une création/suppression simple suffit au départ.

### Demandes

Julie voit les demandes publiques reçues.

Pour chaque demande :

- voir les infos saisies ;
- lier à un client existant ;
- créer une nouvelle fiche client ;
- accepter ;
- refuser ;
- proposer un autre horaire.

### Agenda

Julie voit :

- les disponibilités ;
- les rendez-vous internes Juliedash ;
- les événements Calendly importés en lecture seule ;
- les statuts des rendez-vous ;
- les trous éventuels.

Pas de bouton d’optimisation automatique en V1.

Julie décide elle-même.

### Clients

Cœur de l’application.

Julie peut :

- créer/modifier une fiche client ;
- consulter l’historique ;
- voir les rendez-vous passés ;
- voir les paiements ;
- ajouter des notes ;
- créer des rappels.

---

## 7. Modèle métier fondamental

### User

Compte admin Julie.

Champs possibles :

```text
id
email
passwordHash
twoFactorEnabled
createdAt
updatedAt
```

### Client

Fiche métier stable.

```text
id
firstName
lastName
displayName
notes
status
createdAt
updatedAt
```

Un client ne doit pas être identifié uniquement par son email.

### ClientContact

Moyens de contact multiples.

```text
id
clientId
type: email | phone
value
isPrimary
isActive
source
createdAt
updatedAt
```

Cela permet de gérer :

- ancien email ;
- email d’un conjoint ;
- téléphone secondaire ;
- changement de coordonnées.

### AppointmentRequest

Demande publique brute.

```text
id
requestedStartAt
requestedEndAt
durationMinutes
serviceType
firstName
lastName
email
phone
message
status
linkedClientId?
createdAppointmentId?
createdAt
updatedAt
```

Statuts possibles :

```text
received
linked_to_client
accepted
refused
converted_to_appointment
cancelled
```

### Appointment

Rendez-vous interne géré par Juliedash.

```text
id
clientId
startAt
endAt
serviceType
status
source
notes
createdFromRequestId?
createdAt
updatedAt
```

Statuts possibles :

```text
accepted_adjustable
confirmed
reschedule_pending
completed
cancelled
no_show
```

Sources possibles :

```text
public_request
manual_admin
```

### ExternalCalendarEvent

Rendez-vous Calendly importé en lecture seule.

```text
id
provider: calendly
externalId
title
startAt
endAt
rawName
rawEmail
rawPhone
linkedClientId?
importedAt
updatedAt
```

Rôle : bloquer les créneaux et éventuellement alimenter la base client.

Important : non modifiable depuis Juliedash.

### AvailabilitySlot

Plage de disponibilité ouverte par Julie.

```text
id
startAt
endAt
status
createdAt
updatedAt
```

### RescheduleProposal

Proposition de déplacement.

```text
id
appointmentId
proposedStartAt
proposedEndAt
status
token
sentAt
respondedAt
createdAt
updatedAt
```

Statuts possibles :

```text
pending_client
accepted_by_client
refused_by_client
approved_by_admin
cancelled_by_admin
expired
```

### Payment

Paiement après rendez-vous.

```text
id
appointmentId?
clientId
amountCents
method
paidAt
notes
createdAt
updatedAt
```

Méthodes possibles :

```text
cash
cheque
bank_transfer
card
other
```

### Invoice

Facturette éventuelle.

```text
id
paymentId
number
issueDate
filePath?
createdAt
updatedAt
```

### ClientNote

Note de suivi.

```text
id
clientId
appointmentId?
content
createdAt
updatedAt
```

### Reminder

Rappel interne Julie.

```text
id
clientId?
appointmentId?
title
dueAt
status
createdAt
updatedAt
```

---

## 8. Architecture technique envisagée

Stack recommandée :

```text
Next.js App Router
TypeScript
Prisma
PostgreSQL
Auth admin simple
SMTP
Docker Compose
Caddy sur VPS
Stockage local fichiers via volume Docker
```

### Stockage fichiers

Prévoir un volume Docker pour :

- factures PDF ;
- exports ;
- documents futurs.

Exemple conceptuel :

```text
uploads:/app/uploads
```

Pas besoin de MinIO/S3 en V1.

### Environnements

Local :

```text
npm run dev
Postgres Docker local
```

VPS DEV :

```text
/opt/apps/juliedash-dev
```

VPS PROD :

```text
/opt/apps/juliedash-prod
```

Workflow :

```text
local dev
→ git push
→ déploiement VPS dev
→ tests
→ merge main
→ déploiement prod
```

---

## 9. Plan de construction recommandé

### Phase 0 — Socle technique

Objectif : application vide mais saine.

À faire :

- créer projet Next.js ;
- installer Prisma ;
- brancher PostgreSQL ;
- créer modèle User ;
- créer login admin ;
- protéger `/admin` ;
- créer `/reservation` publique vide ;
- Dockerfile ;
- docker-compose dev/prod ;
- `.env.example` ;
- README de lancement ;
- déploiement VPS DEV fonctionnel.

Livrable :

```text
L’app démarre en local, se build en Docker, se déploie sur VPS DEV, et Julie peut se connecter à /admin.
```

### Phase 1 — Import Calendly lecture seule

- page `/admin/imports/calendly` ;
- bouton importer ;
- stockage en base dans `ExternalCalendarEvent` ;
- tableau simple ;
- pas de modification ;
- pas de synchro bidirectionnelle.

Livrable :

```text
Les rendez-vous Calendly apparaissent dans Juliedash et bloquent les créneaux.
```

### Phase 2 — Disponibilités

- page `/admin/disponibilites` ;
- création de plages ;
- suppression de plages ;
- affichage simple.

Livrable :

```text
Julie peut définir quand elle accepte des demandes.
```

### Phase 3 — Demande publique

- page `/reservation` ;
- affichage de créneaux selon disponibilités ;
- exclusion des créneaux bloqués par Calendly ;
- formulaire client ;
- création `AppointmentRequest`.

Livrable :

```text
Un client peut créer une demande de rendez-vous.
```

### Phase 4 — Admin demandes

- page `/admin/demandes` ;
- liste des demandes ;
- accepter/refuser ;
- création d’un `Appointment`.

Livrable :

```text
Julie peut transformer une demande en rendez-vous accepté.
```

### Phase 5 — Clients

- page `/admin/clients` ;
- page `/admin/clients/[id]` ;
- création/modification client ;
- gestion contacts ;
- rattachement demande → client ;
- rattachement Calendly importé → client.

Livrable :

```text
Les rendez-vous et demandes sont reliés à une base client propre.
```

### Phase 6 — Agenda

- page `/admin/agenda` ;
- vue semaine ;
- RDV internes ;
- événements Calendly verrouillés ;
- disponibilités ;
- statuts visuels.

Livrable :

```text
Julie voit son planning réel dans Juliedash.
```

### Phase 7 — Emails

- accusé réception demande ;
- confirmation Julie ;
- refus ;
- modification ;
- annulation.

Livrable :

```text
Les actions importantes déclenchent des emails propres.
```

### Phase 8 — Décalages

- bouton proposer un décalage ;
- création `RescheduleProposal` ;
- email avec lien ;
- page publique token ;
- acceptation/refus client ;
- validation finale Julie.

Livrable :

```text
Julie peut proposer des micro-décalages sans appeler systématiquement ses clients.
```

### Phase 9 — Post-rendez-vous

- marquer réalisé ;
- marquer absence/lapin ;
- saisir paiement ;
- ajouter note de séance ;
- créer rappel.

Livrable :

```text
Le rendez-vous alimente l’historique client.
```

### Phase 10 — Factures et exports

- facturette PDF ;
- stockage fichier ;
- export CSV des paiements ;
- filtres période.

Livrable :

```text
Julie peut produire ses informations comptables utiles.
```

---

## 10. Ce qu’il ne faut pas faire au début

Ne pas commencer par :

- optimisation automatique ;
- synchronisation bidirectionnelle Calendly ;
- espace client ;
- SMS ;
- interface agenda drag-and-drop complexe ;
- rôles multi-utilisateurs ;
- moteur IA ;
- facturation avancée ;
- récurrences complexes ;
- import massif de documents.

Priorité : socle simple, fiable, déployable.

---

## 11. Décision stratégique

Le bon départ est :

```text
Créer un nouveau projet vierge nommé juliedash.
Garder bienetre-dashboard comme ancien projet / référence technique.
Utiliser Calendly uniquement comme source temporaire en lecture seule.
Construire d’abord le socle technique et le flux métier minimal.
```

Cap à garder :

> Ne pas construire un Calendly alternatif. Construire l’outil métier quotidien de Julie.
