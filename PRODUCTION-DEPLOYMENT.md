# The Fix Nation Production Deployment

## Website

Upload every file in this folder to the domain root. Keep the existing file names unchanged. Confirm these URLs open after upload:

- `https://thefixnation.com/`
- `https://thefixnation.com/worker.html`
- `https://thefixnation.com/bookings.html`
- `https://thefixnation.com/sitemap.xml`
- `https://thefixnation.com/robots.txt`

## Google Apps Script Backend

1. Open the Apps Script project currently used by the customer endpoint.
2. Replace its code with `google-apps-script.gs`.
3. Save and run `setupBackend` once from the editor. Approve access to both Google Sheets and email notifications.
4. Use **Deploy > Manage deployments > Edit > New version > Deploy**.
5. Execute as **Me** and allow access to **Anyone**.
6. Keep the existing web app URL if the deployment ID has not changed.

The central endpoint routes customer bookings to the customer spreadsheet and professional applications to the worker spreadsheet.

## Payment Operations

Plain UPI does not provide an automatic success webhook. New bookings remain `Pending verification`. After matching the payment, run:

`markPaymentVerified('TFN-YYYYMMDD-XXXX', 'UPI-TRANSACTION-ID')`

The function updates payment status to `Verified` and booking status to `Confirmed`. A payment gateway is required for fully automatic verification.

## Search Console

Submit `https://thefixnation.com/sitemap.xml` once. After uploading major changes, request indexing for the homepage, worker page and a small set of priority city pages. Do not repeatedly submit the same URL.
