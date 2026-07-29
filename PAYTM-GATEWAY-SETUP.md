The Fix Nation Paytm Gateway Setup

Use this only after the Paytm Business / Payment Gateway account is approved.

Do not share publicly:
- Merchant Key
- Salt / secret
- Dashboard password
- Bank or KYC private files

Safe to share for integration:
- MID
- Website name
- Industry/category
- Test or production mode
- Paytm callback URL requirement

Current website state:
- The site uses direct UPI as the temporary free payment option.
- Customer does not need to type Booking ID.
- Booking reference is generated automatically and sent with payment note.
- Google Sheet backend is Paytm-ready with gateway columns.

Required backend for Paytm:
- Create Paytm order on server/backend.
- Generate checksum on server/backend.
- Open Paytm checkout from frontend.
- Verify payment response on server/backend.
- Update Google Sheet with `paymentGatewayOrderId`, `paymentGatewayTxnId`, `paymentGatewayStatus` and `paymentStatus`.

Recommended next backend choices:
- Google Apps Script for low-cost MVP if Paytm checksum APIs are implemented carefully.
- Firebase Functions / Cloud Run / Render if you want a stronger production backend.

Frontend config placeholder:
```js
window.FIX_NATION_PAYTM = {
  enabled: false,
  createOrderUrl: "",
  verifyPaymentUrl: "",
  mode: "production"
};
```

Only set `enabled: true` after backend order creation and verification endpoints are live.
