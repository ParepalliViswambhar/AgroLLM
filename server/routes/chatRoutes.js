const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getChats,
  createChat,
  updateChat,
  deleteChat,
  clearChats,
  predict,
  transcribeAudio,
} = require('../controllers/chatController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.route('/').get(protect, getChats).post(protect, createChat);
router.route('/:id').put(protect, updateChat).delete(protect, deleteChat);
router.route('/clear').delete(protect, clearChats);
router.route('/predict').post(protect, predict);
router.post('/chats/transcribe', protect, upload.single('audio'), transcribeAudio);

module.exports = router;
