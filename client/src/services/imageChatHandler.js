// Encapsulates image logic: upload, fetch, store, retrieve, delete
// Uses API helpers from api.js
import { uploadChatImage, getChatImage, deleteChatImage } from './api';

// Upload image to a chat (persist in MongoDB)
export async function uploadImage(chatId, file) {
  if (!chatId || !file) throw new Error('chatId and file are required');
  return uploadChatImage(chatId, file);
}

// Fetch image for a chat; returns a Blob URL (caller should manage URL.revokeObjectURL)
export async function fetchImage(chatId) {
  if (!chatId) throw new Error('chatId is required');
  try {
    const res = await getChatImage(chatId);
    const blob = res.data;
    if (!blob || (blob.size !== undefined && blob.size === 0)) return null;
    return URL.createObjectURL(blob);
  } catch (err) {
    // Likely 404 if no image
    return null;
  }
}

// Remove persisted image for a chat
export async function removeImage(chatId) {
  if (!chatId) throw new Error('chatId is required');
  try {
    await deleteChatImage(chatId);
    return true;
  } catch (err) {
    return false;
  }
}

// Alias for clarity
export const getImageFromDB = fetchImage;
