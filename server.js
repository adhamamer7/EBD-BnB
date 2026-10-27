import express from "express";
const app = express();

// Our fake database for now: a plain array that lives in memory
const listings = [
 { id: 1, title: "Nile View Apartment", pricePerNight: 85 },
 { id: 2, title: "Beach House", pricePerNight: 140 },
 { id: 3, title: "Desert Eco-Lodge", pricePerNight: 60 },
];

app.get("/api/listings", (req, res) => 
    { res.json(listings); }); 

app.get("/api/listings/:id", (req, res) => {
 const id = Number(req.params.id); // URL params are always strings
 const listing = listings.find((listing) => listing.id === id);
 if (!listing) {
 return res.status(404).json({ error: "Listing not found" });
 }
 res.json(listing);
});

app.listen(3000, () => {
 console.log("Server running on http://localhost:3000");
});