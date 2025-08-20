import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChats, createChat, predict, deleteChat, updateChat, transcribeAudio } from '../services/api';
import styles from './ChatPage.module.css';
import Sidebar from '../components/Chat/Sidebar';
import ChatArea from '../components/Chat/ChatArea';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
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

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

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
    // Clean up the object URL on component unmount or when the URL changes
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

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

  const handleClearAttachment = () => {
    setSelectedFile(null);
    setSelectedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setSelectedFile(null);
      setMessage(''); // Clear message when image is selected
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const currentMessage = message;
    setMessage('');
    setIsLoading(true);

    const userMessage = {
      sender: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString(),
    };

    let activeChat = currentChat;
    let newChatCreated = false;

    try {
      // If there is no active chat, create one.
      if (!activeChat) {
        const newChatResponse = await createChat({
          title: currentMessage.substring(0, 30),
          messages: [userMessage],
        });
        activeChat = newChatResponse.data;
        setChats(prevChats => [activeChat, ...prevChats]);
        setCurrentChat(activeChat);
        newChatCreated = true;
      } else {
        // If a chat is active, update it with the new user message immediately.
        const updatedMessages = [...activeChat.messages, userMessage];
        setCurrentChat({ ...activeChat, messages: updatedMessages });
      }

      // Get the bot's response.
      const botResponse = await predict(currentMessage);
      const botMessage = {
        sender: 'bot',
        content: botResponse.data.answer,
        timestamp: new Date().toISOString(),
      };

      // If a new chat was created, its messages are already up-to-date with the user message.
      // Otherwise, for an existing chat, we need to add the new user message.
      const baseMessages = newChatCreated ? activeChat.messages : [...activeChat.messages, userMessage];
      const finalMessages = [...baseMessages, botMessage];

      // Update the chat on the server.
      const finalChatResponse = await updateChat(activeChat._id, { messages: finalMessages });

      // Update the UI with the final, complete state.
      setCurrentChat(finalChatResponse.data);
      setChats(prevChats =>
        prevChats.map(c => (c._id === finalChatResponse.data._id ? finalChatResponse.data : c))
      );
    } catch (error) {
      console.error('Error during message sending:', error);
      // In case of an error, revert to a consistent state.
      fetchChats();
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      setSelectedImage(null);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(null);
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
    try {
      await Promise.all(chats.map(chat => deleteChat(chat._id)));
      setChats([]);
      setCurrentChat(null);
    } catch (error) {
      console.error('Failed to clear all chats:', error);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className={`${styles.chatContainer} ${theme} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
      <Sidebar 
        userInfo={userInfo}
        chats={chats}
        currentChat={currentChat}
        handleNewChat={handleNewChat}
        setCurrentChat={setCurrentChat}
        handleDeleteChat={handleDeleteChat}
        handleClearChats={handleClearChats}
        theme={theme}
        handleThemeToggle={handleThemeToggle}
        handleLogout={handleLogout}
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
      />
    </div>
  );
};

export default ChatPage;
