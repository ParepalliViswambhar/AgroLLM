const Chat = require('../models/chatModel');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const getChats = async (req, res) => {
  const chats = await Chat.find({ user: req.user._id });
  res.json(chats);
};

const createChat = async (req, res) => {
  const { messages } = req.body;

  const chat = new Chat({
    user: req.user._id,
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

const predict = (req, res) => {
  const { question } = req.body;

  const pythonProcess = spawn('python', ['./scripts/predict.py', question], {
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
  transcribeAudio,
};
