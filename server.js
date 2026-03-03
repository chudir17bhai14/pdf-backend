const cors = require("cors");
app.use(cors());
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

app.post("/compress", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const inputPath = req.file.path;
    const outputPath = path.join("compressed", Date.now() + "-compressed.pdf");

    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Save with compression enabled
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

    fs.writeFileSync(outputPath, pdfBytes);

    res.download(outputPath);
  } catch (error) {
    console.log(error);
    res.status(500).send("Compression failed");
  }
});