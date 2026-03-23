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

## Data and Persistence
- Mock seed data + `localStorage`
- Active mock user: `user_1`

Storage keys:
- `borrowbox_items`
- `borrowbox_bookings`
- `borrowbox_reviews`
- `borrowbox_notifications`
- `borrowbox_favorites_user_1`

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
Planned next phase: backend auth, database, and server-side business-rule enforcement.
