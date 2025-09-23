const Chat = require('../models/chatModel');
const Image = require('../models/imageModel');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const getChats = async (req, res) => {
  const chats = await Chat.find({ user: req.user._id });
  res.json(chats);
};

// Predict using text + image via Gradio /get_answer
const predictWithImage = async (req, res) => {
  try {
    const { question_text, chatId } = req.body;

    if (!question_text || !chatId) {
      return res.status(400).json({ message: 'Missing required fields: question_text, chatId' });
    }

    // Ensure the chat belongs to the user
    const chat = await Chat.findById(chatId);
    if (!chat || chat.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Pre-check: if no image persisted for this chat, skip Python call
    const hasImage = await Image.exists({ chat: chatId });
    if (!hasImage) {
      return res.status(404).json({ message: 'No persisted image found for this chat.' });
    }

    const chatDoc = await Chat.findById(chatId);
    if (!chatDoc) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    const sessionId = chatDoc.sessionId;

    const pythonProcess = spawn('python', ['./scripts/predict.py', 'get_answer', question_text, chatId, sessionId], {
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        GRADIO_URL: process.env.GRADIO_URL,
        MONGO_URI: process.env.MONGO_URI,
      },
    });

    let result = '';
    let error = '';
    let responseSent = false;

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (responseSent) return;
      responseSent = true;

      const lowerErr = (error || '').toLowerCase();
      if (code !== 0 || error) {
        if (lowerErr.includes('no persisted image found')) {
          return res.status(404).json({ message: 'No persisted image found for this chat.' });
        }
        return res.status(500).json({ message: 'Prediction script failed', error });
      }
      res.json({ answer: result.trim() });
    });

    pythonProcess.on('error', (err) => {
      if (responseSent) return;
      responseSent = true;
      console.error(`Failed to start subprocess: ${err}`);
      res.status(500).json({ message: 'Failed to start prediction script' });
    });
  } catch (err) {
    console.error('predictWithImage error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// Validate mime type for images
const isAllowedImageType = (mimetype) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return allowed.includes(mimetype);
};

// Upload a new image for a chat (multiple images supported)
const uploadChatImage = async (req, res) => {
  try {
    const { id: chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat || chat.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    if (!isAllowedImageType(req.file.mimetype)) {
      return res.status(415).json({ message: 'Unsupported image type' });
    }

    const result = await Image.create({
      user: req.user._id,
      chat: chatId,
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer,
    });
    console.log('[UPLOAD IMAGE] For chatId:', chatId, 'User:', req.user._id, 'Result:', !!result);
    res.json({ message: 'Image uploaded', image: !!result });
  } catch (error) {
    console.error('uploadChatImage error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all images for a chat
const getAllChatImages = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat || chat.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    const images = await Image.find({ chat: chatId }).sort({ createdAt: 1 });
    if (!images || images.length === 0) {
      return res.status(404).json({ message: 'No images for this chat' });
    }
    // Return metadata only (not raw data) for listing
    const meta = images.map(img => ({
      _id: img._id,
      filename: img.filename,
      contentType: img.contentType,
      createdAt: img.createdAt,
      updatedAt: img.updatedAt
    }));
    res.json({ images: meta });
  } catch (error) {
    console.error('getAllChatImages error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get image binary for a chat or by imageId
const getChatImage = async (req, res) => {
  try {
    const { id: chatId, imageId } = req.params;
    let img;
    if (imageId) {
      img = await Image.findById(imageId);
      if (!img) {
        return res.status(404).json({ message: 'Image not found' });
      }
      // Optionally, check user owns the chat
      const chat = await Chat.findById(img.chat);
      if (!chat || chat.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Chat not found' });
      }
    } else {
      const chat = await Chat.findById(chatId);
      if (!chat || chat.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      img = await Image.findOne({ chat: chatId }).sort({ createdAt: -1 }); // latest
    }
    console.log('[GET IMAGE] For chatId:', chatId, 'User:', req.user._id, 'Found:', !!img, 'HasData:', !!(img && img.data));
    if (!img || !img.data) {
      return res.status(404).json({ message: 'No image for this chat' });
    }
    res.set('Content-Type', img.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'private, max-age=0, must-revalidate');
    return res.send(img.data);
  } catch (error) {
    console.error('getChatImage error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Remove image for a chat

const deleteChatImage = async (req, res) => {
  try {
    const { id: chatId, imageId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat || chat.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (imageId) {
      // Delete specific image by ID
      const deletedImage = await Image.findOneAndDelete({ 
        _id: imageId, 
        chat: chatId 
      });
      if (!deletedImage) {
        return res.status(404).json({ message: 'Image not found' });
      }
    } else {
      // Fallback: delete all images for chat (use carefully)
      await Image.deleteMany({ chat: chatId });
    }
    
    res.json({ message: 'Image(s) removed' });
  } catch (error) {
    console.error('deleteChatImage error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const createChat = async (req, res) => {
  const { messages } = req.body;

  const sessionId = uuidv4();

  const chat = new Chat({
    user: req.user._id,
    sessionId,
    messages,
  });

  const createdChat = await chat.save();
  res.status(201).json(createdChat);
};

const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (chat && chat.user.toString() === req.user._id.toString()) {
      await Chat.findByIdAndDelete(req.params.id);
      res.json({ message: 'Chat removed' });
    } else {
      res.status(404).json({ message: 'Chat not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const clearChats = async (req, res) => {
  await Chat.deleteMany({ user: req.user._id });
  res.json({ message: 'All chats removed' });
};

const predict = async (req, res) => {
  const { question, chatId } = req.body;
  if (!question || !chatId) {
    return res.status(400).json({ message: 'Missing required fields: question, chatId' });
  }

  const chat = await Chat.findById(chatId);
  if (!chat || chat.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Chat not found' });
  }

  const sessionId = chat.sessionId;
  const pythonProcess = spawn('python', ['./scripts/predict.py', question, sessionId], {
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      GRADIO_URL: process.env.GRADIO_URL,
    },
  });

  let result = '';
  let error = '';
  let responseSent = false;

  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    error += data.toString();
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (responseSent) return;
    responseSent = true;

    if (code !== 0) {
      return res.status(500).json({ message: 'Prediction script failed', error });
    }
    if (error) {
      return res.status(500).json({ message: 'Error from prediction script', error });
    }
    res.json({ answer: result });
  });

  pythonProcess.on('error', (err) => {
    if (responseSent) return;
    responseSent = true;
    console.error(`Failed to start subprocess: ${err}`);
    res.status(500).json({ message: 'Failed to start prediction script' });
  });
};

const updateChat = async (req, res) => {
  const { messages } = req.body;
  const chat = await Chat.findById(req.params.id);

  if (chat && chat.user.toString() === req.user._id.toString()) {
    chat.messages = messages;
    const updatedChat = await chat.save();
    res.json(updatedChat);
  } else {
    res.status(404);
    throw new Error('Chat not found');
  }
};

const clearAllChats = async (req, res) => {
  try {
    await Chat.deleteMany({ user: req.user._id });
    res.json({ message: 'All chats cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};



const transcribeAudio = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No audio file uploaded.' });
  }

  const audioFilePath = req.file.path;

  const pythonProcess = spawn('python', ['./scripts/transcribe.py', audioFilePath], {
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });

  let result = '';
  let error = '';

  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    error += data.toString();
    console.error(`Python stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    fs.unlink(audioFilePath, (err) => {
      if (err) console.error('Failed to delete audio file:', err);
    });

    if (code !== 0) {
      return res.status(500).json({ message: 'Transcription script failed.', error });
    }
    res.json({ transcribedText: result.trim() });
  });

  pythonProcess.on('error', (err) => {
    console.error(`Failed to start subprocess: ${err}`);
    res.status(500).json({ message: 'Failed to start transcription script.' });
  });
};

module.exports = {
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
  getAllChatImages,
  deleteChatImage,
};
