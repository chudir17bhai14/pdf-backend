
const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors({
  origin: ['https//wix.com',
 'https://*.wix.com']
}));

/* Upload configuration */
const upload = multer({
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files allowed"));
    }
    cb(null, true);
  },
  dest: "uploads/"
});

/* Create folders if not exist */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

if (!fs.existsSync("compressed")) {
  fs.mkdirSync("compressed");
}

/* Compression Route */
app.post("/compress", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const inputPath = req.file.path;
  const outputPath = path.join("compressed", Date.now() + "-compressed.pdf");

  const command = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

  exec(command, (error) => {
    if (error) {
      return res.status(500).send("Compression failed. Make sure Ghostscript is installed.");
    }

    res.download(outputPath, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

/* Start server */
app.get('/', (req, res) => {
  res.send("PDF Compression API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});