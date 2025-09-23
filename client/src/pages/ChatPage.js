import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChats, createChat, predict, deleteChat, updateChat, transcribeAudio, getAnswer } from '../services/api';
import { uploadImage as uploadChatImageSvc, removeImage as removeChatImageSvc, fetchImage as fetchChatImage, fetchAllImages, fetchImageById } from '../services/imageChatHandler';
import { useTheme } from '../contexts/ThemeContext';
import styles from './ChatPage.module.css';
import Sidebar from '../components/Chat/Sidebar';
import ChatArea from '../components/Chat/ChatArea';
import InputArea from '../components/Chat/InputArea';

import ConfirmationModal from '../components/common/ConfirmationModal';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messageAreaRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioFileInputRef = React.createRef();
  const imageFileInputRef = React.createRef();
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states moved from Sidebar
  const [showClearChatsModal, setShowClearChatsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (!storedUserInfo) {
      navigate('/login');
    } else {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      setUserInfo(parsedUserInfo);
      fetchChats();
      setCurrentChat(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [currentChat, isLoading]);


  useEffect(() => {
    const loadPersistedImages = async () => {
      if (currentChat && currentChat._id) {
        if (imagePreviewUrl) {
          URL.revokeObjectURL(imagePreviewUrl);
        }
        
        try {
          const images = await fetchAllImages(currentChat._id);
          const urlPromises = images.map(img => fetchImageById(currentChat._id, img._id));
          const urls = await Promise.all(urlPromises);
          
          // Match images to __image__ placeholders in chronological order
          let imageIdx = 0;
          const enhanced = {
            ...currentChat,
            messages: currentChat.messages.map((m) => {
              if (m.sender === 'user' && m.content === '__image__' && !m.imageUrl && urls[imageIdx]) {
                const msgWithUrl = { ...m, imageUrl: urls[imageIdx] };
                imageIdx++;
                return msgWithUrl;
              }
              return m;
            })
          };
          setCurrentChat(enhanced);
        } catch (error) {
          console.error('Failed to load images:', error);
        }
        
        setImagePreviewUrl(null);
        setSelectedImage(null);
      } else {
        if (imagePreviewUrl) {
          URL.revokeObjectURL(imagePreviewUrl);
        }
        setImagePreviewUrl(null);
        setSelectedImage(null);
      }
    };
    loadPersistedImages();
  }, [currentChat?._id]);

  useEffect(() => {
    // Clean up the object URL on component unmount
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Safety check to ensure recording state is properly reset
  useEffect(() => {
    if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'recording') {
      setIsRecording(false);
    }
  }, [isRecording]);

  const fetchChats = async () => {
    try {
      const response = await getChats();
      const reversedChats = response.data.reverse();
      setChats(reversedChats);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      // Ensure recording state is reset
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);

          try {
            setIsTranscribing(true);
            const response = await transcribeAudio(audioFile);
            setMessage(response.data.text);
          } catch (error) {
            console.error('Error transcribing audio:', error);
            alert('Failed to transcribe audio. Please try again.');
          } finally {
            setIsTranscribing(false);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access the microphone. Please check your browser permissions.');
        setIsRecording(false);
      }
    }
  };

  const handleAudioFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSelectedImage(null);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(null);
      try {
        setIsTranscribing(true);
        const response = await transcribeAudio(file);
        setMessage(response.data.text);
      } catch (error) {
        console.error('Error transcribing audio:', error);
        alert('Failed to transcribe audio. Please try again.');
      } finally {
        setIsTranscribing(false);
        setSelectedFile(null);
      }
    }
  };

  // Only remove image from DB when user explicitly clears attachment
  const handleClearAttachment = async () => {
    setSelectedFile(null);
    setSelectedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
  };

  // Do NOT call removeChatImageSvc anywhere else. Images are only deleted on explicit clear.

  const handleImageFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setSelectedFile(null);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
      // Only show local preview for now; upload and backend fetch will be handled in handleSendMessage
    }
  };

  const handleSendMessage = async () => {
    const hasImage = Boolean(selectedImage || imagePreviewUrl);
    if ((!message.trim() && !hasImage) || isLoading) return;

    const currentMessage = message;
    setMessage('');
    setIsLoading(true);

    const userMessage = currentMessage.trim() ? {
      sender: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString(),
    } : null;

    let activeChat = currentChat;
    let newChatCreated = false;
    const localImageUrl = imagePreviewUrl || null;
    const imagePlaceholderMsg = hasImage
      ? {
          sender: 'user',
          content: '__image__',
          timestamp: new Date().toISOString(),
        }
      : null;
    let replacedWithPersisted = false;

    try {
      // If there is no active chat, create one.
      if (!activeChat) {
        const initialMessages = [];
        if (userMessage) initialMessages.push(userMessage);
        if (imagePlaceholderMsg) initialMessages.push(imagePlaceholderMsg);
        
        const chatTitle = currentMessage.trim() 
          ? currentMessage.substring(0, 30) 
          : 'Image Chat';
          
        const newChatResponse = await createChat({
          title: chatTitle,
          messages: initialMessages,
        });
        activeChat = newChatResponse.data;
        // Enhance UI with imageUrl for the placeholder, if any
        if (imagePlaceholderMsg && localImageUrl) {
          const enhanced = {
            ...activeChat,
            messages: activeChat.messages.map(m =>
              m.sender === 'user' && m.content === '__image__'
                ? { ...m, imageUrl: localImageUrl }
                : m
            ),
          };
          setChats(prevChats => [enhanced, ...prevChats]);
          setCurrentChat(enhanced);
        } else {
          setChats(prevChats => [activeChat, ...prevChats]);
          setCurrentChat(activeChat);
        }
        newChatCreated = true;
      } else {
        // If a chat is active, update it with the new user message immediately.
        const updatedMessages = [...activeChat.messages];
        if (userMessage) updatedMessages.push(userMessage);
        if (imagePlaceholderMsg) updatedMessages.push(imagePlaceholderMsg);
        
        // Enhance UI with image bubble immediately
        const enhanced = imagePlaceholderMsg && localImageUrl
          ? {
              ...activeChat,
              messages: updatedMessages.map(m =>
                m.sender === 'user' && m.content === '__image__' && !m.imageUrl
                  ? { ...m, imageUrl: localImageUrl }
                  : m
              ),
            }
          : { ...activeChat, messages: updatedMessages };
        setCurrentChat(enhanced);
      }
      // If a new image is selected and not yet persisted (no chat before), upload now
      let botResponse;
      let persistedUrl = null;
      if (hasImage && activeChat && activeChat._id) {
        try {
          if (selectedImage) {
            await uploadChatImageSvc(activeChat._id, selectedImage);
            // Don't fetch persisted image yet; do it after bot answer
          }

          botResponse = await getAnswer(currentMessage, activeChat._id);
          // Now fetch persisted image URL and update chat UI
          if (selectedImage) {
            persistedUrl = await fetchChatImage(activeChat._id);
            if (persistedUrl) {
              setCurrentChat(prev => {
                if (!prev) return prev;
                const msgs = [...prev.messages];
                for (let i = msgs.length - 1; i >= 0; i--) {
                  if (msgs[i].sender === 'user' && msgs[i].content === '__image__') {
                    msgs[i] = { ...msgs[i], imageUrl: persistedUrl };
                    break;
                  }
                }
                return { ...prev, messages: msgs };
              });
              replacedWithPersisted = true;
            }
          }
        } catch (err) {
          console.error('Image-based prediction failed:', err);
          if (err?.response?.status === 404 || (err.message && err.message.includes('No persisted image'))) {
            console.warn('Falling back to text-only prediction.');
            botResponse = await predict(currentMessage, activeChat._id);
          } else {
            throw err;
          }
        }
      } else {
        botResponse = await predict(currentMessage, activeChat._id);
      }
      const botMessage = {
        sender: 'bot',
        content: botResponse.data.answer,
        timestamp: new Date().toISOString(),
      };

      // If a new chat was created, its messages are already up-to-date with the user message.
      // Otherwise, for an existing chat, we need to add the new user message.
      const baseMessages = newChatCreated
        ? activeChat.messages
        : imagePlaceholderMsg
          ? [...activeChat.messages, userMessage, imagePlaceholderMsg]
          : [...activeChat.messages, userMessage];
      const finalMessages = [...baseMessages, botMessage];

      // Update the chat on the server.
      const finalChatResponse = await updateChat(activeChat._id, { messages: finalMessages });

      // After the chat is updated, fetch all images and match to __image__ placeholders
      let enhancedFinal = finalChatResponse.data;
      try {
        if (imagePlaceholderMsg && activeChat && activeChat._id) {
          const images = await fetchAllImages(activeChat._id);
          const urlPromises = images.map(img => fetchImageById(activeChat._id, img._id));
          const urls = await Promise.all(urlPromises);
          let imageIdx = 0;
          enhancedFinal = {
            ...finalChatResponse.data,
            messages: finalChatResponse.data.messages.map(m => {
              if (m.sender === 'user' && m.content === '__image__' && urls[imageIdx]) {
                const msgWithUrl = { ...m, imageUrl: urls[imageIdx] };
                imageIdx++;
                return msgWithUrl;
              }
              return m;
            })
          };
        }
      } catch (e) {
        // fallback: use local preview if available
        if (imagePlaceholderMsg && localImageUrl) {
          enhancedFinal = {
            ...finalChatResponse.data,
            messages: finalChatResponse.data.messages.map(m =>
              m.sender === 'user' && m.content === '__image__'
                ? { ...m, imageUrl: localImageUrl }
                : m
            ),
          };
        }
      }
      setCurrentChat(enhancedFinal);
      setChats(prevChats => prevChats.map(c => (c._id === enhancedFinal._id ? enhancedFinal : c)));
    } catch (error) {
      console.error('Error during message sending:', error);
      // In case of an error, revert to a consistent state.
      fetchChats();
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      // Clear local image preview to simulate moving it to the chat bubble
      // Revoke only if we replaced with persisted blob to avoid breaking the chat bubble
      if (imagePreviewUrl && replacedWithPersisted) {
        try { URL.revokeObjectURL(imagePreviewUrl); } catch {}
      }
      setImagePreviewUrl(null);
      setSelectedImage(null);
    }
  };

  const handleNewChat = () => {
    setCurrentChat(null);
    setMessage('');
  };

  const handleDeleteChat = async (id) => {
    try {
      await deleteChat(id);
      const updatedChats = chats.filter((chat) => chat._id !== id);
      setChats(updatedChats);

      if (currentChat && currentChat._id === id) {
        setCurrentChat(updatedChats.length > 0 ? updatedChats[0] : null);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };

  const handleClearChats = async () => {
    setShowClearChatsModal(false);
    try {
      await Promise.all(chats.map(chat => deleteChat(chat._id)));
      setChats([]);
      setCurrentChat(null);
    } catch (error) {
      console.error('Failed to clear all chats:', error);
    }
  };

  // Theme toggle is now handled by the ThemeContext

  const handleLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Check if current chat already has an image (from persisted images or preview)
  const isImageUploadDisabled = (() => {
    if (imagePreviewUrl || selectedImage) return true; // image selected but not uploaded yet
    if (currentChat && currentChat.messages) {
      return currentChat.messages.some(m => m.sender === 'user' && m.content === '__image__' && m.imageUrl);
    }
    return false;
  })();

  return (
    <div className={`${styles.chatContainer} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
      <Sidebar 
        userInfo={userInfo}
        chats={chats}
        currentChat={currentChat}
        handleNewChat={handleNewChat}
        setCurrentChat={setCurrentChat}
        handleDeleteChat={handleDeleteChat}
        theme={theme}
        handleThemeToggle={toggleTheme}
        onClearChatsClick={() => setShowClearChatsModal(true)}
        onLogoutClick={() => setShowLogoutModal(true)}
      />
      <ChatArea 
        currentChat={currentChat}
        isLoading={isLoading}
        isTranscribing={isTranscribing}
        isRecording={isRecording}
        messageAreaRef={messageAreaRef}
        formatTime={formatTime}
        imagePreviewUrl={imagePreviewUrl}
        handleClearAttachment={handleClearAttachment}
        selectedFile={selectedFile}
        theme={theme}
        handleSendMessage={handleSendMessage}
        handleAudioFileChange={handleAudioFileChange}
        audioFileInputRef={audioFileInputRef}
        handleImageFileChange={handleImageFileChange}
        imageFileInputRef={imageFileInputRef}
        isAttachmentMenuOpen={isAttachmentMenuOpen}
        setIsAttachmentMenuOpen={setIsAttachmentMenuOpen}
        handleToggleRecording={handleToggleRecording}
        message={message}
        setMessage={setMessage}
        isImageUploadDisabled={isImageUploadDisabled}
      />
      {/* Clear Chats Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearChatsModal}
        onClose={() => setShowClearChatsModal(false)}
        onConfirm={handleClearChats}
        title="Clear All Chats"
        message="Are you sure you want to clear all your chat history? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        confirmVariant="danger"
      />
      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        confirmVariant="primary"
      />
    </div>
  );
};

export default ChatPage;
