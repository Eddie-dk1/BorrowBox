# BorrowBox

BorrowBox is a peer-to-peer rental marketplace MVP for tech and useful items.

## Current Product Scope
BorrowBox currently supports a full local MVP flow:
- Browse and search listings
- View item details and owner profile
- Create booking requests with date validation and conflict protection
- Approve/decline incoming requests from an operations-focused dashboard
- Save favorites
- Add and edit your own listings (including local photo upload)
- View notifications (bell dropdown + notifications page)
- Use a personal `My Profile` page for owner/renter summary
- Authentication gate with `Sign in / Sign up` page before accessing app routes

## Key Features Implemented

### Listings
- Add listing with required validation
- Edit listing from `My Profile`
- Upload image from local file or provide image URL
- Listing data persisted in `localStorage`

### Booking
- Inclusive date logic (`days = end - start + 1`)
- Prevents overlapping bookings against `pending` + `approved`
- Live conflict feedback in booking box
- Auto-declines conflicting pending requests when one is approved

### Dashboard
- Operations-first dashboard
- Queue/History tabs for incoming requests
- Approve/decline actions
- KPIs + recent activity

### Profiles
- `My Profile` page with:
  - owner performance
  - listings with quick actions (view/edit)
  - recent reviews
- `Owner Profile` page with public stats, reviews, and active listings

### Auth (MVP Local)
- First-time visitors are redirected to `/auth`
- Sign in with email + password
- Sign up creates a local user profile with name, city, email, and password
- City input accepts any city text
- Session is persisted in `localStorage`
- Log out returns user to auth screen

### Notifications
- Header bell with unread badge
- Notification dropdown and full notifications page
- Filters: `all`, `unread`, `booking`, `system`
- Mark one/all as read
- Toast popup for new notifications relevant to current user

## Routes
- `/` Home
- `/catalog`
- `/item/:itemId`
- `/add-listing`
- `/edit-listing/:itemId`
- `/favorites`
- `/dashboard`
- `/notifications`
- `/my-profile`
- `/owner/:ownerId`
- `/auth`

## Data and Persistence
- Mock seed data + `localStorage`
- Active user comes from local auth session (`borrowbox_session_user_id`)

Storage keys:
- `borrowbox_users`
- `borrowbox_items`
- `borrowbox_bookings`
- `borrowbox_reviews`
- `borrowbox_notifications`
- `borrowbox_favorites_<userId>`

## Tech Stack
- React + Vite
- React Router
- Tailwind CSS
- lucide-react
- Vitest (tests)

## Run Locally
```bash
npm install
npm run dev
```

Build and tests:
```bash
npm run test:run
npm run build
```

## Project Status
MVP is functional on the frontend with local persistence.
TypeScript migration (Step 1) is complete across app entrypoints, pages, components, store, and seed data with `allowJs: false`.
Current focus before backend: architecture hardening and test expansion.

## Commit Strategy
Use small, scoped commits so history stays clean and reviewable.

Recommended commit types:
- `feat(ui): ...` for layout/components/UI-only updates
- `feat(logic): ...` for store/business rules/data-flow updates
- `test: ...` for test additions or test-only changes
- `docs: ...` for README/spec/documentation updates

## TypeScript Plan
TypeScript migration has been completed.

Why now:
- The MVP has enough flows and entities to benefit from strict typing.
- It will reduce bugs in booking/state logic and make refactors safer.
- It will simplify future backend/API integration.

Migration approach used (incremental, not big-bang):
1. Add React + TypeScript setup (`.tsx`, `tsconfig`, typed Vite config).
2. Define core domain types first (`Item`, `Booking`, `Review`, `Notification`).
3. Migrate store logic and then pages/components step by step.

Progress completed:
- TypeScript tooling added (`tsconfig.json`, `typecheck` script).
- Core domain types introduced in `src/types/domain.ts`.
- UI/store coupling reduced via API adapter: `src/api/marketplaceApi.ts`.
- Existing pages/components switched to use the API adapter.
- Core utility/business modules migrated to TypeScript:
  `src/utils/storage.ts`, `src/utils/date.ts`, `src/utils/price.ts`, `src/utils/store.ts`.
- App entrypoints migrated: `src/App.tsx`, `src/main.tsx`.
- Mock data migrated: `src/data/mockItems.ts`, `src/data/mockNotifications.ts`,
  `src/data/mockReviews.ts`, `src/data/mockUsers.ts`.
- Strict TS mode now enforced with `allowJs: false`.

## Next Steps
1. Backend-ready architecture hardening without full backend:
   split API services, typed DTOs, standardized error/result handling, storage migration versioning.
2. Testing hardening:
   auth flow tests, listing add/edit integration tests, booking/notification integration tests.
