# The Fix Nation UrbanClap-Level Backend Roadmap

## Already strengthened in the free setup

- Google Sheet lead capture for customers and workers.
- Booking ID generation.
- Payment status tracking.
- Payment report action.
- Customer public booking status lookup.
- Status history.
- Ops Dashboard in Google Sheets.
- Selected-row menu actions for payment verification and professional assignment.
- Priority tagging for Chennai, Bangalore, Hyderabad and Mumbai.

## What is needed for a true UrbanClap-style backend

1. Real database: Supabase, Firebase, PostgreSQL or MySQL.
2. Admin panel: booking queue, worker assignment, payment verification, status timeline and filters.
3. Customer login: phone OTP or Google login, saved addresses, booking history and rebook flow.
4. Worker login: profile, document verification, skill-city mapping and job accept/reject.
5. Payment gateway: Razorpay, Cashfree, PhonePe PG or PayU with signed webhook verification.
6. Communication providers: SMS OTP, WhatsApp Business API or SMS booking updates.
7. Google Maps: API key, place autocomplete, geocoding and nearby professional matching.
8. Security: role-based access, private address/phone handling, rate limits, audit log and backups.

## Recommended build phases

Phase 1: Keep Google Sheets and improve operations.
Phase 2: Add hosted backend and admin panel.
Phase 3: Add customer and worker login.
Phase 4: Add real payment gateway and webhooks.
Phase 5: Add map-based matching and worker app flow.
