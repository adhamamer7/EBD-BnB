
// Configure DNS for MongoDB Atlas
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Import Express + Mongoose to create our app
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";

const app = express();

// Connect to MongoDB
async function connectDB() {
    console.log("Connecting to MongoDB...");

    // The connection string, from .env
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGODB_URI is missing from the .env file");
    }

    // dbName picks the database inside your cluster
    await mongoose.connect(uri, { dbName: "EBD-BnB" });

    console.log("Connected to MongoDB");
}

// Log every request, then pass it on
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

// Read JSON request bodies into req.body
app.use(express.json());

// Model

// The shape of one listing
const listingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
});

// The model: our handle on the "listings" collection
const Listing = mongoose.model("Listing", listingSchema);

// The only code that touches the listings collection
async function getAllListings() {
    return Listing.find();
}

async function getListingById(id) {
    // "abc" can never be an _id: not found
    if (!mongoose.isValidObjectId(id)) return null;
    return Listing.findById(id);
}

async function addListing(data) {
    // The schema keeps only the fields it knows
    return Listing.create(data);
}

async function updateListing(id, data) {
    if (!mongoose.isValidObjectId(id)) return null;
    // new: true sends back the listing after the update
    return Listing.findByIdAndUpdate(id, data, { new: true });
}

async function removeListing(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Listing.findByIdAndDelete(id);
}

// Controllers
async function handleGetAll(req, res) {
    res.json(await getAllListings());
}

async function handleGetOne(req, res) {
    const listing = await getListingById(req.params.id);

    if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
    }

    res.json(listing);
}


async function handleCreate(req, res) {
    try {
        const listing = await addListing(req.body);
        res.status(201).json(listing);
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: "Internal server error" });
    }
}

async function handleUpdate(req, res) {
    const listing = await updateListing(req.params.id, req.body);

    if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
    }

    res.json(listing);
}

async function handleDelete(req, res) {
    const listing = await removeListing(req.params.id);

    if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
    }

    res.json(listing);
}

// Routes
app.get("/", (req, res) => {
    res.send("Welcome to the EBD-BnB");
});

app.get("/api/listings", handleGetAll);
app.get("/api/listings/:id", handleGetOne);
app.post("/api/listings", handleCreate);
app.put("/api/listings/:id", handleUpdate);
app.delete("/api/listings/:id", handleDelete);

// Connect to the database before starting the server
try {
    await connectDB();

    // Start application
    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
} catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
}
