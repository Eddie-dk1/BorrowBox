# BorrowBox MVP Spec v1

## 1. Scope
MVP supports peer-to-peer rental requests without payments:
- Browse and search listings
- View item details
- Send booking request for date range
- Add listing
- Save/remove favorites
- Manage own listings and booking requests in dashboard

Out of scope:
- Authentication backend
- Real payments
- Chat and notifications

## 2. Assumptions
- Single-device MVP with localStorage persistence
- A mock active user is used (`currentUserId = user_1`)
- City-level discovery only (no map)

## 3. Data Contracts

### 3.1 User
```ts
{
  id: string
  name: string
  city: string
  avatar?: string
}
```

### 3.2 Item
```ts
{
  id: string
  title: string
  category: 'Cameras' | 'Gaming' | 'Audio' | 'Laptops' | 'Projectors' | 'Other'
  pricePerDay: number
  city: string
  condition: 'new' | 'good' | 'used'
  description: string
  image: string
  ownerId: string
  ownerName: string
  deposit?: number
  createdAt: string // ISO 8601
  isActive: boolean
}
```

### 3.3 Booking
```ts
{
  id: string
  itemId: string
  renterId: string
  ownerId: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  totalDays: number
  totalPrice: number
  status: 'pending' | 'approved' | 'declined' | 'cancelled'
  createdAt: string // ISO 8601
}
```

## 4. Business Rules

### 4.1 Date Rules
- `startDate` and `endDate` are required for request creation.
- `endDate >= startDate`.
- `totalDays = diffInCalendarDays(endDate, startDate) + 1` (inclusive rental period).
- Minimum rental is `1` day.

### 4.2 Pricing Rules
- `totalPrice = totalDays * pricePerDay`.
- `deposit` is not added to `totalPrice`; it is informational in MVP.

### 4.3 Availability / Conflict Rules
- New booking request cannot overlap any booking with status `pending` or `approved` for the same `itemId`.
- Overlap formula:
  `newStart <= existingEnd && existingStart <= newEnd`

### 4.4 Ownership Rules
- User cannot create booking for own item.
- Only owner can change status for incoming requests.

### 4.5 Favorites Rules
- Favorites are unique by `itemId`.
- Toggling favorite is idempotent.

## 5. Page Acceptance Criteria

### Home
- Header navigation links render and work.
- Hero, search bar, category chips, featured items, and “How it works” are visible.
- Search action routes to catalog with query params.

### Catalog
- Supports search by title/description.
- Filters: category, city, price range.
- Sort: cheapest, most expensive, newest.
- Card click opens item details.

### Item Details
- Displays core metadata and owner info.
- Booking box validates dates and price.
- `Send request` creates `pending` booking when valid.

### Add Listing
- Required fields validated.
- On submit, item persists and appears in catalog + my listings.

### Favorites
- Shows saved items only.
- Remove action updates immediately.

### Dashboard
- My Listings: items where `ownerId == currentUserId`.
- My Requests: bookings where `renterId == currentUserId`.
- Incoming Requests: bookings where `ownerId == currentUserId`.
- Owner can approve/decline incoming pending requests.

## 6. Persistence Keys
- `borrowbox_items`
- `borrowbox_bookings`
- `borrowbox_favorites_user_1`

## 7. Non-Functional Targets
- Mobile responsive (>= 320px)
- Route transition time under 200ms on local data
- Inputs and buttons keyboard accessible
