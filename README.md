The Fix Nation site folder

Open `index.html` to view the page.

Main editable files:
- `index.html` - page markup and content
- `css/styles.css` - styling
- `js/script.js` - interactions and form handling
- `js/lead-config.js` - lead/form config
- `img/` - logo and service images
- `google-apps-script.gs` - Google Sheet lead capture backend

Verified locally on `http://127.0.0.1:4173` with CSS loaded and no broken images.

Google Sheet setup:
1. Use this Google Sheet: `https://docs.google.com/spreadsheets/d/1Czn3xP1VHtUHuMLaYfMG-b_VmvonSN2cpnDhfRFI4oo/edit`
2. Open Extensions > Apps Script in that Sheet.
3. Paste the code from `google-apps-script.gs`.
4. Deploy > New deployment > Web app.
5. Set "Execute as" to "Me".
6. Set "Who has access" to "Anyone".
7. Copy the Web App URL.
8. Paste that URL in `js/lead-config.js` inside the `all` field.

Only two website forms submit to Google Sheet now:
- customer callback
- worker join profile

Brand/seller enquiry is handled by direct call or WhatsApp.

The Apps Script is already configured with this Sheet ID:
`1Czn3xP1VHtUHuMLaYfMG-b_VmvonSN2cpnDhfRFI4oo`

Customer callback details will go to the `Customer Leads` tab. Worker profiles will go to the `Worker Leads` tab.

Example:
```js
window.FIX_NATION_LEADS = {
  all: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
  customer: "",
  worker: "https://script.google.com/macros/s/YOUR_WORKER_DEPLOYMENT_ID/exec"
};
```

Current configured endpoints:
- Customer callback: `https://script.google.com/macros/s/AKfycbzu5QACPONhQjj2HuTvUM10qNTWiLu0OBsqLi_Ca4KyMtv1py0cdZkIoQChZf8938EpJg/exec`
- Worker / Join a Pro: `https://script.google.com/macros/s/AKfycbwd9nG7596gM4sjHcTVGI9w9ghURHLnedtThJj0f_QfdpH1-nmQeaiP8tgSokCAe08SjQ/exec`

Booking payment flow:
- UPI ID: `9165867685-5@ybl`
- Booking confirmation charge: `Rs 49`
- Customer form generates an automatic booking reference.
- Details are saved to Google Sheet with `paymentStatus: Pending verification`.
- Current free payment flow opens the customer's installed UPI app with amount and reference prefilled.
- If the UPI app cannot open, the site shows the UPI ID, amount and auto reference for manual payment.
- Customer does not need to type a booking reference manually during booking.
- Redeploy the customer Apps Script after updating `google-apps-script.gs` so the new booking/payment columns are saved.

Day 1 stability update:
- Booking form validates phone, city, service and worker skill before sending.
- Payment uses direct UPI intent with fallback payment details.
- Manual payment reporting updates the saved booking on the same device.
- Pending leads are stored locally and retried when the device is online.
- Bookings page can fill the most recent reference automatically on the same device.

Day 2 backend update:
- Backend version is `2.4-day2`.
- Customer Sheet now has Paytm-ready columns: `paymentProvider`, `paymentGatewayOrderId`, `paymentGatewayTxnId`, `paymentGatewayStatus`.
- Worker applications get a saved reference receipt on the website.
- Apps Script now supports worker status lookup via `action=worker_status`.
- Ops menu includes worker review, approve and reject actions.

Day 4 free growth update:
- Homepage SEO title and description improved for priority service searches.
- FAQ schema and priority service ItemList schema added on the homepage.
- Customer confidence, local search intent and worker network growth sections added.
- Worker page improved for carpenter, handyman, AC technician, electrician and plumber applications.
- Customer-facing payment/reference language now uses automatic reference wording.
- Homepage service slider added for bed installation, sofa installation, sofa repair and bed repair.
- New SEO guide pages added for sofa installation, sofa repair and bed repair.
- Blogs page, homepage helpful links and sitemap now link to these new guides.
- Sitemap lastmod updated to `2026-08-09`.

Final free launch docs:
- `FINAL-FREE-LAUNCH-CHECKLIST.md`
- `SEARCH-CONSOLE-URLS-20260809.md`
- `GOOGLE-BUSINESS-FREE-SETUP.md`
- `PRIORITY-CITY-SEO-PLAN.md`
- `SEARCH-CONSOLE-PRIORITY-CITIES-20260809.md`

Paytm note:
- Paytm Merchant Key must stay on backend only.
- Do not paste Paytm Merchant Key in `index.html`, `js/script.js` or `js/lead-config.js`.
- Use `PAYTM-GATEWAY-SETUP.md` before adding the gateway.

City SEO expansion update:
- Added normalized service cities for dropdown support.
- Added city-wise SEO hub: `city-service-pages.html`.
- Added 70 cities x 6 service pages = 420 city-service SEO pages.
- Priority SEO cities: Chennai, Bangalore, Indore, Jaipur, Churu, Jodhpur, Kolkata, Bhubaneswar, Dewas, Rau, Mhow, Delhi, Delhi NCR, Noida and Gurugram.
- Services covered: bed assembly, bed repair, furniture assembly, furniture repair, sofa repair and sofa assembly.
- Sitemap updated with 421 generated SEO URLs.
