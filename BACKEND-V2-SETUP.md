# The Fix Nation Backend v2.2 Ops

This backend uses Google Apps Script and the existing customer and worker Google Sheets.

## Deploy the update

1. Open the existing Apps Script project.
2. Replace `Code.gs` with the complete contents of `google-apps-script.gs`.
3. Save and run `setupBackend` once. Approve the requested Google permissions.
4. Refresh the Sheet. A **The Fix Nation** menu will appear for selected-row actions.
5. Select **Deploy > Manage deployments > Edit**.
6. Choose **New version**, execute as **Me**, and access **Anyone**.
7. Deploy. If Google gives a new `/exec` URL, replace the `all` URL in `js/lead-config.js`.

## Booking workflow

1. `New`: request has reached the customer Sheet.
2. `Callback pending`: team is checking the requirement.
3. `Confirmed`: payment and visit request are confirmed.
4. `Assigned`: a professional has been assigned.
5. `Professional on the way`: professional is travelling.
6. `Work in progress`: work has started after quote approval.
7. `Completed`: job is closed.
8. `Cancelled`: booking will not continue.

Customers track a booking using Booking ID plus the last four digits of their phone number. Address and complete phone number are not returned by the public status API.

## Operations helpers

Run these from Apps Script when needed:

```javascript
markPaymentVerified('TFN-20260615-AB12', 'UPI-REFERENCE');
assignProfessional('TFN-20260615-AB12', 'Professional name', '9876543210', '2026-06-16 10:00 AM');
updateLeadStatus('TFN-20260615-AB12', 'Professional on the way', 'Professional started travel');
updateLeadStatus('TFN-20260615-AB12', 'Completed', 'Customer confirmed completion');
cancelBooking('TFN-20260615-AB12', 'Customer requested cancellation');
```

## Sheet menu actions

Open `Customer Leads`, select a booking row, then use:

- `The Fix Nation > Verify selected payment`
- `The Fix Nation > Assign selected professional`
- `The Fix Nation > Mark selected callback pending`

`setupBackend` also creates an `Ops Dashboard` sheet for quick counts.

## Payment fallback

Mobile users can open the UPI app directly. Desktop users should copy payment details, pay from their phone UPI app, and submit the payment report with the Booking ID in the note.

Payment is not automatically verified by a plain UPI link. The customer can report payment, but the team must match the transaction and mark it `Verified`. Automatic verification requires a payment gateway with a signed webhook.
