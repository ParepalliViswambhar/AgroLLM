const express = require('express');
const router = express.Router();
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/transcribe', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded.' });
  }

  const inputFilePath = req.file.path;
  const outputFilePath = `${inputFilePath}.wav`;

  ffmpeg(inputFilePath)
    .toFormat('wav')
    .on('error', (err) => {
      console.error('Conversion error: ' + err.message);
      fs.unlink(inputFilePath, () => {}); // Clean up original file
      return res.status(500).json({ error: 'Failed to convert audio file.' });
    })
    .on('end', () => {
      const pythonScriptPath = path.join(__dirname, '..', 'scripts', 'transcribe.py');
      const pythonProcess = spawn('python', [pythonScriptPath, outputFilePath]);

      let transcribedText = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        transcribedText += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        // Clean up both the original and the converted file
        fs.unlink(inputFilePath, () => {});
        fs.unlink(outputFilePath, () => {});

        if (code !== 0) {
          console.error(`Transcription Error: ${errorOutput}`);
          return res.status(500).json({ error: 'Failed to transcribe audio.', details: errorOutput });
        }
        
        res.json({ text: transcribedText.trim() });
      });
    })
    .save(outputFilePath);
});

module.exports = router;
