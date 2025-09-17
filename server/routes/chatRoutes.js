const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getChats,
  createChat,
  updateChat,
  deleteChat,
  clearChats,
  predict,
  predictWithImage,
  transcribeAudio,
  uploadChatImage,
  getChatImage,
  deleteChatImage,
  getAllChatImages, 
} = require('../controllers/chatController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Multer setup for audio uploads to disk (legacy)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Multer setup for image uploads kept in memory for Mongo persistence
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Unsupported image type'));
  },
});

router.route('/').get(protect, getChats).post(protect, createChat);
router.route('/:id').put(protect, updateChat).delete(protect, deleteChat);
router.route('/clear').delete(protect, clearChats);
router.route('/predict').post(protect, predict);
router.post('/chats/transcribe', protect, upload.single('audio'), transcribeAudio);

// Image persistence routes per chat
router.post('/:id/image', protect, imageUpload.single('image'), uploadChatImage);
router.get('/:id/image/:imageId', protect, getChatImage); // get image by imageId
router.get('/:id/image', protect, getChatImage); // fallback: latest image for chat
router.get('/:id/images', protect, getAllChatImages); // get all image metadata for chat
router.delete('/:id/image/:imageId', protect, deleteChatImage); // delete by imageId
router.delete('/:id/image', protect, deleteChatImage); // fallback: delete latest

// Text + image prediction via Gradio /get_answer
router.post('/get_answer', protect, predictWithImage);

module.exports = router;
