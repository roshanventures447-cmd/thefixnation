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
  worker: ""
};
```
