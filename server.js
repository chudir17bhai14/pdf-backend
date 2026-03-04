const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Ensure folders exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

if (!fs.existsSync("compressed")) {
  fs.mkdirSync("compressed");
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Test route
app.get("/", (req, res) => {
  res.send("PDF Compression API is running");
});

// Compress route
app.post("/compress", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const inputPath = req.file.path;
    const outputPath = path.join(
      "compressed",
      Date.now() + "-compressed.pdf"
    );

    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

    fs.writeFileSync(outputPath, pdfBytes);

    res.download(outputPath);
  } catch (error) {
    console.error(error);
    res.status(500).send("Compression failed");
  }
});

app.listen(PORT, () => {
  console.log('Server is running');
});
