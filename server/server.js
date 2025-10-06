import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer"; // Import multer
import chat from "./chat.js";

// Used in chat.js, process.env.XXX
dotenv.config();

const app = express();
// Add in response headers
// Access-Control-Allow-Origin: *
app.use(cors());

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save the uploaded file on server
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Keep the original file name
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const PORT = 5001;

let filePath;

// POST: going to send back the res, after req
app.post("/upload", upload.single("file"), async (req, res) => {
  // Use multer to handle file upload
  filePath = req.file.path; // The path where the file is temporarily saved
  res.send(filePath + " upload successfully.");
});

app.get("/chat", async (req, res) => {
  const resp = await chat(filePath, req.query.question); // Pass the file path to your main function
  res.send(resp.text);
});

// Start listening incoming (HTTP) requests
// Listen for connections
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
