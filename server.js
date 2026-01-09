import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { verifyBearerToken } from "./middleware/auth.js";
dotenv.config();

const app = express();

// Enable CORS for all origins
app.use(cors());

// Optional: If you want more control
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get("/api/google-reviews/:city", verifyBearerToken, async (req, res) => {
  const { city } = req.params;

  // Map city to corresponding PLACE_ID
  const placeIds = {
    chennai: process.env.PLACE_ID_CHENNAI,
    coimbatore: process.env.PLACE_ID_COIMBATORE,
    pondicherry: process.env.PLACE_ID_PONDICHERRY,
    mayiladuthurai: process.env.PLACE_ID_MAYILADUTHURAI,
  };

  const placeId = placeIds[city.toLowerCase()];

  if (!placeId) {
    return res.status(400).json({ error: "Invalid city parameter" });
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${process.env.API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res.status(400).json({
        error: data.status,
        message: data.error_message,
      });
    }

    const result = data.result;

    const formatted = {
      name: result.name,
      rating: result.rating,
      totalReviews: result.user_ratings_total,
      reviews: result.reviews.map((review) => ({
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.relative_time_description,
        profilePhoto: review.profile_photo_url,
      })),
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({
      error: "Server fetch failed",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

