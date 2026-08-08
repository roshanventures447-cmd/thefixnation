window.FIX_NATION_LEADS = {
  // Paste your Google Apps Script Web App URL here to send every form to one Sheet.
  all: "https://script.google.com/macros/s/AKfycbzu5QACPONhQjj2HuTvUM10qNTWiLu0OBsqLi_Ca4KyMtv1py0cdZkIoQChZf8938EpJg/exec",

  // Optional: use separate Web App URLs per form type.
  customer: "",
  worker: ""
};

window.FIX_NATION_PAYMENT = {
  bookingFee: 49,
  upiId: "9165867685-5@ybl",
  payeeName: "The Fix Nation"
};

window.FIX_NATION_PAYTM = {
  enabled: false,
  // Paytm secret/Merchant Key must stay on backend only. Never paste it in this file.
  createOrderUrl: "",
  verifyPaymentUrl: "",
  mode: "production"
};

// Add approved B2B brand names here. Example:
// window.FIX_NATION_BRANDS = ["Brand One", "Brand Two", "Brand Three"];
window.FIX_NATION_BRANDS = [];

window.FIX_NATION_CITIES = [
  "Ahmedabad",
  "Amritsar",
  "Balotra",
  "Bangalore",
  "Benaulim",
  "Berhampur",
  "Bhagalpur",
  "Bhopal",
  "Bhubaneswar",
  "Bokaro",
  "Bulandshahr",
  "Chennai",
  "Churu",
  "Chhindwara",
  "Coimbatore",
  "Dehradun",
  "Delhi",
  "Delhi NCR",
  "Dewas",
  "Dhanbad",
  "Ernakulam",
  "Ghaziabad",
  "Giridih",
  "Gorakhpur",
  "Greater Noida",
  "Gurugram",
  "Guwahati",
  "Gwalior",
  "Howrah",
  "Hyderabad",
  "Indore",
  "Jaipur",
  "Jalandhar",
  "Jamshedpur",
  "Jodhpur",
  "Kadapa",
  "Kalyan",
  "Kanpur",
  "Kochi",
  "Kolkata",
  "Lucknow",
  "Madurai",
  "Malur Industrial Area",
  "Mangaluru",
  "Mhow",
  "Morena",
  "Mumbai",
  "Mysore",
  "Nagpur",
  "Nellore",
  "Noida",
  "Pathankot",
  "Patna",
  "Prayagraj",
  "Pudupattinam",
  "Pune",
  "Raigarh",
  "Ranchi",
  "Rangareddy",
  "Rau",
  "Rishikesh",
  "Thane",
  "Tonk",
  "Trivandrum",
  "Udaipur",
  "Vadodara",
  "Varanasi",
  "Vijayawada",
  "Visakhapatnam",
  "Wadi"
];
