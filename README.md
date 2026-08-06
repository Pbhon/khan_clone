# LearnHub

A self-paced learning platform: students enroll in courses, work through lessons, take quizzes pulled from a
larger question bank, and earn awards as they go. Admins get a full in-app interface for building and managing
that content — no scripts required.

Built with React (Vite), React Router, and the Context API. No backend yet on purpose — see
[Connecting Firebase](#connecting-firebase) below.

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

### Demo accounts

The app seeds itself with two accounts the first time it runs:

| Role    | Email                | Password    |
|---------|-----------------------|-------------|
| Admin   | `admin@example.com`  | `admin123`  |
| Student | `student@example.com`| `student123`|

To wipe everything and start over from the seed data, open the browser console and run `resetLearnHub()`.

## What's included

- **Two account types.** Students browse and take courses; admins manage content. Signup has a Student/Admin
  toggle — choosing Admin requires an access code. See [Admin accounts](#admin-accounts) for how that code works
  and its limits.
- **A real admin interface**, not scripts. Create a course, add units and lessons, write teaching content section
  by section, attach a quiz, and build its question bank — all through forms in the app
  (`/admin`, `AdminCourseEditor`, `AdminQuizEditor`).
- **Progress tracking.** Enrolling adds a course to a student's dashboard with a live progress bar. Completing a
  lesson (or passing its quiz) updates it immediately, and "Continue" always jumps to the next unfinished lesson.
- **A quiz bank with pooling.** Each quiz stores a full bank of questions; admins set how many get used per
  attempt. Every attempt — including retakes — randomly samples that many, so a retake looks different.
- **Retry-then-reveal grading.** Miss a question and you get a second attempt. Miss it twice (or get it right) and
  the correct answer and explanation are revealed before moving on.
- **An awards engine.** Badges unlock automatically for things like finishing a lesson, passing a quiz cleanly, or
  improving on a retake. See `src/utils/awardsEngine.js` to add more.
- **Draft/published courses.** Admins can hide a course while it's still being built and publish it once it's
  ready — draft courses never appear in the student catalog.

## Project structure

```
src/
  main.jsx, App.jsx, index.css     entry point, routes, design system
  context/                          AuthContext, DataContext — shared app state
  services/                         all data access — see "Connecting Firebase"
  data/
    templates.js                    the shape of a course/unit/lesson/quiz/question
    seedData.js                     example courses + quizzes + awards catalog
  utils/                            progress math, quiz sampling/scoring, awards rules
  components/                       shared UI (+ components/admin/ for the editors)
  pages/                            one file per route (+ pages/admin/ for admin views)
```

## The data model

Defined in `src/data/templates.js` — these are the exact shapes the admin forms produce:

- **Course** → `title`, `description`, `subject`, `status` (`draft` | `published`), `units[]`
- **Unit** → `title`, `description`, `lessons[]`
- **Lesson** → `title`, `sections[]` (the "teaching sections" — each a `{ heading, body }` pair), `quizId`
- **Quiz** → `title`, `questionsPerAttempt`, `passingScorePercent`, `questions[]` (the full bank)
- **Question** → `prompt`, `choices[]`, `correctIndex`, `explanation`
- **Progress** (one per student per course) → `lessonCompletion`, `quizAttempts`, `percentComplete`, `status`
- **Award** → `name`, `description`, `icon`, `criteriaKey` (maps to a rule in `awardsEngine.js`)

If you ever want to seed content by script instead of the admin UI, import the `create*Template()` functions from
`templates.js` the same way the editors do.

## Admin accounts

The signup page has a Student/Admin toggle. Choosing Admin reveals an access-code field, checked against
`ADMIN_SIGNUP_CODE` in **`src/config/adminAccess.js`** — open that one file to read or change the code. It's a
single exported constant with a comment block around it, so it's easy to find again later.

**This is a convenience gate, not real security.** The check runs entirely in the browser, so the code ships
inside the app's JavaScript bundle — anyone who opens dev tools and looks at the source can read it. That's fine
for local development, or a small group testing the app together and sharing the code directly. Before a real
deployment:

1. Remove the Admin option from the signup form (`src/pages/SignupPage.jsx`) — go back to student-only signup.
2. Create admin accounts on the backend only, once Firebase is connected — see the Admin SDK / custom claims
   example under [Connecting Firebase](#connecting-firebase) below. That's real security, because the check runs
   on a server the client can't inspect or bypass.

Two other ways to make an admin still work regardless of the toggle:

- Use the seeded `admin@example.com` account.
- Sign up a normal student, then run `promoteToAdmin('their@email.com')` in the browser console — useful for
  promoting an account after the fact without needing the code.

## Connecting Firebase

Every service file in `src/services/` is written so its function *signatures* already match what you'd call
against Firebase — the goal is that `context/` and `pages/` never need to change, only the internals of these
service files.

### 1. Install and configure

```bash
npm install firebase
```

Create `src/services/firebaseConfig.js`:

```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp({
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  // ...rest of your config from the Firebase console
});

export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 2. Swap `authService.js`

| This mock function              | Becomes                                                              |
|----------------------------------|-----------------------------------------------------------------------|
| `subscribeToAuthChanges(cb)`     | `onAuthStateChanged(auth, cb)`                                        |
| `login({ email, password })`     | `signInWithEmailAndPassword(auth, email, password)`                   |
| `signup({ name, email, password })` | `createUserWithEmailAndPassword(...)`, then `setDoc()` a profile doc with `role: 'student'` |
| `logout()`                       | `signOut(auth)`                                                       |

Keep `signup` hard-coding `role: 'student'` — that's what enforces "no admin accounts through the signup form."

### 3. Swap the rest of the services

`courseService.js`, `quizService.js`, `progressService.js`, and `awardsService.js` each just read/write a
collection. `readCollection`/`writeCollection` (from `localDb.js`) become Firestore calls, e.g.:

```js
// courseService.js — before (mock)
export function getAllCourses() {
  return readCollection(DB_KEYS.COURSES) || [];
}

// after (Firestore)
export async function getAllCourses() {
  const snapshot = await getDocs(collection(db, 'courses'));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
```

Because courses/units/lessons are one nested object, a single `courses` collection with one document per course
works fine — you don't need subcollections unless a course grows to hundreds of lessons.

Note that Firestore calls are asynchronous, so callers (mainly `DataContext.jsx`) will need `await` added where
they currently call these functions synchronously.

### 4. Create your first real admin account

Never do this from client-side app code. Two good options:

- **Firebase console**: create the user in Authentication, then manually add a document at
  `users/{uid}` with `{ role: 'admin' }` in Firestore.
- **Admin SDK script**, run on a trusted machine/server (this is the standard, secure pattern — custom claims
  can't be set from the browser):

```js
// scripts/setAdmin.js — run with Node, using a service account key. Never ship this file to the client.
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccountKey.json')) });

async function makeAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
  await admin.firestore().doc(`users/${uid}`).set({ role: 'admin' }, { merge: true });
}

makeAdmin('the-users-uid');
```

## Known simplifications

- **Answer checking happens client-side.** There's no server yet, so a determined student could inspect app state
  to see answers. If quiz integrity matters once you're on Firebase, move grading into a Cloud Function.
- **Passwords are plaintext in the mock DB.** Firebase Auth handles hashing/security for you — this only affects
  local dev before you connect it.
- **The awards catalog is config, not admin-editable.** Add or change badges in `src/data/seedData.js` /
  `src/utils/awardsEngine.js`. Giving admins a UI for this would follow the exact same pattern as courses/quizzes.

## Available scripts

- `npm run dev` — start the local dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
