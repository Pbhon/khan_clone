# LearnHub

LearnHub is a self-paced learning application built with React, Vite, Firebase Authentication, and Cloud Firestore. Students are automatically enrolled in every published course when they sign up. Administrators can create and manage courses, lessons, and quizzes from the protected admin area.

## Features

- Student-only public signup with Firebase Authentication
- Automatic enrollment in all published courses at signup
- Admin-only course and quiz management, enforced in both the UI and Firestore rules
- Draft and published course states
- Lesson progress, quiz attempts, randomized question pools, and awards
- Responsive student and admin interfaces

## Local setup

```bash
npm install
npm run dev
```

The repository includes the current Firebase web configuration as a fallback. To use a different Firebase project, copy `.env.example` to `.env.local` and fill in the `VITE_FIREBASE_*` values.

## Firebase setup

1. Open the Firebase project and enable **Authentication > Sign-in method > Email/Password**.
2. Create the Firestore database and ensure the Cloud Firestore API is enabled.
3. Deploy the checked-in security rules:

   ```bash
   npx firebase-tools deploy --only firestore:rules
   ```

4. Create the first administrator in Firebase Authentication.
5. Create `users/{uid}` in Firestore for that account:

   ```json
   {
     "name": "Admin Name",
     "email": "admin@example.com",
     "role": "admin"
   }
   ```

Admin status is never accepted from public signup or client input. Firestore rules read the signed-in user's profile and reject course, quiz, and administrative writes unless its role is `admin`.

When the database has no courses, an administrator can use **Add Starter Courses** on the admin dashboard to import the sample course and quiz content.

## Data model

- `users/{uid}`: name, email, role, creation time
- `courses/{courseId}`: metadata with nested units and lessons
- `quizzes/{quizId}`: quiz settings and question bank
- `progress/{userId}__{courseId}`: enrollment, lesson completion, and quiz attempts
- `userAwards/{userId}__{awardId}`: earned award records

The award catalog remains version-controlled in `src/data/seedData.js`; earned awards are stored in Firestore.

## Security notes

- Public signup always creates a `student` profile.
- Admin accounts must be provisioned through Firebase Console or a trusted Admin SDK environment.
- Client route guards improve the interface, while `firestore.rules` provide the actual database authorization boundary.
- Quiz answer checking currently happens in the browser. Move grading to a trusted backend if assessment integrity is important.

## Commands

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build
