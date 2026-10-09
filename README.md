# MendCrew Customer App — Run Notes

**MendCrew | Local Service. Lasting Care.**

## Project Overview

MendCrew Customer App helps customers discover local home services, request appointments, and track bookings.

Initial service areas: Nagercoil and Suchindram, Tamil Nadu, India.

## Technology Stack

- Expo
- React Native
- TypeScript
- Axios
- NestJS REST API
- Prisma ORM
- PostgreSQL

## 1. Existing Project History

Previously verified:

- Expo app connects to the NestJS backend.
- Six service categories load from PostgreSQL.
- Customer Home screen displays services.
- Selecting a service opens the booking flow.

Previously discussed but not confirmed fully tested:

- Native date/time picker
- Successful booking persistence
- My Bookings screen
- Local booking storage

Check the current repository to determine which features are implemented.

## 2. Requirements

- Node.js LTS
- npm
- VS Code
- Android phone with Expo Go or compatible development build
- Running MendCrew backend

## 3. Install Dependencies

```cmd
cd /d D:\MendCrew\mendcrew-customer-app
npm install
```

## 4. Configure API URL

Create `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:3000
```

Use `ipconfig` to find your computer's current IPv4 address.

The previous development IP was `10.12.179.126`, but it may have changed.

Do not append `/services` to the base URL.

## 5. Start PostgreSQL and Backend

Open CMD:

```cmd
cd /d D:\MendCrew\mendcrew-backend
docker compose up -d
npm run start:dev
```

This assumes `docker-compose.yml` is located in the backend repository.

Expected API:

```text
http://localhost:3000
```

## 6. Start Customer App

Open another CMD terminal:

```cmd
cd /d D:\MendCrew\mendcrew-customer-app
npx expo start -c
```

Scan the QR code with Expo Go if compatible.

## 7. Customer Screens

### Home
- MendCrew branding
- Local service categories
- Booking shortcuts

### Service Booking
- Selected service
- Customer name
- Phone number
- Address
- Issue description
- Preferred date and time

### Booking Confirmation
- Booking reference
- Booking status
- Next steps

### My Bookings
- Upcoming requests
- Previous bookings
- Status information
- Pull-to-refresh

### Fix Journey
- Booking requested
- Request confirmed
- Technician assigned
- Work in progress
- Completed

### Crew Match
- Assigned technician details when available

### Home Carebook
- Previous home repairs and service history

### Profile & Support
- Customer profile
- Saved addresses
- Help and support

Authentication, Crew Match, and Home Carebook require additional backend functionality before production use.

## 8. Existing API Endpoints

Known backend endpoints:

```http
GET /services
POST /bookings
GET /bookings/:id
```

`GET /bookings/:id` must be protected by customer authentication and ownership checks before production use.

## 9. Test Booking Flow

1. Open MendCrew.
2. Confirm all six services load.
3. Select Electrician.
4. Enter valid booking details.
5. Choose a future date and time.
6. Submit the booking.
7. Confirm the API returns a booking reference.
8. Verify the record exists in PostgreSQL.
9. Verify the booking appears in My Bookings if that feature is implemented.

## 10. Prisma Studio

From the backend folder:

```cmd
npx prisma studio
```

Inspect the `Booking` table to verify records.

## 11. Troubleshooting

### Services not loading

Check:

- Backend is running.
- Phone can reach the PC's LAN IP.
- `.env` contains only the API base URL.
- Expo was restarted after environment changes.

### Booking fails

Check:

- Service ID is valid.
- Phone number has 10 digits.
- Address is provided.
- Preferred date is in the future.
- Backend logs for validation errors.

### Prisma errors

From the backend folder:

```cmd
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Avoid destructive database resets.

## 12. Useful Commands

```cmd
npm install
npx expo start -c
npx tsc --noEmit
```

## 13. GitHub Commands

```cmd
git status
git add .
git commit -m "Update MendCrew customer app"
git push
```

Ensure `.env` and credentials are excluded.

## 14. Development Checklist

- [x] Connect mobile app to backend
- [x] Display six services
- [x] Navigate to booking form
- [ ] Verify native date/time picker on device
- [ ] Verify booking submission and database persistence
- [ ] Verify My Bookings
- [ ] Implement customer authentication
- [ ] Implement Fix Journey tracking
- [ ] Implement Crew Match
- [ ] Implement Home Carebook
- [ ] Add automated tests
- [ ] Prepare Android release build

Update the checklist when testing confirms completion.

---

**MendCrew Customer App**  
*Your home. Our crew.*