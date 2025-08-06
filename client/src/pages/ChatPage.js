import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChats, createChat, predict, deleteChat, updateChat, transcribeAudio } from '../services/api';
import styles from './ChatPage.module.css';
import { FaMicrophone, FaPaperclip, FaPaperPlane, FaPlus, FaTrash, FaMoon, FaSun, FaSignOutAlt, FaRobot, FaLeaf, FaBars } from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';

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
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = React.createRef();
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

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
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

      // The final message list should include the previous messages, the new user message, and the bot's response.
      const finalMessages = [...(activeChat ? activeChat.messages : []), userMessage, botMessage];

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
      <div className={styles.sidebar}>
        <div className={styles.appHeader}>
          <div className={styles.appLogo}>
            <FaLeaf className={styles.logoIcon} />
          </div>
          <h1 className={styles.appTitle}>AgriChat</h1>
        </div>

        {userInfo && (
          <div className={styles.userSection}>
            <div className={styles.userName}>{userInfo.name || 'John Farmer'}</div>
          </div>
        )}

        <div className={styles.recentChatsSection}>
          <h2 className={styles.sectionTitle}>Recent Chats</h2>
          <button className={styles.newChatButton} onClick={handleNewChat}>
            <FaPlus className={styles.newChatIcon} />
            New Chat
          </button>
        </div>
        <div className={styles.chatHistory}>
          {chats.map(chat => (
            <div 
              key={chat._id} 
              className={`${styles.chatHistoryItem} ${currentChat?._id === chat._id ? styles.active : ''}`}
              onClick={() => setCurrentChat(chat)}
            >
              <div className={styles.chatInfo}>
                <p className={styles.chatTitle}>{chat.messages[0].content.substring(0, 30)+"..."}</p>
              </div>
              <button 
                className={styles.deleteButton}
                onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat._id); }}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.sidebarOptions}>
          <button className={`${styles.sidebarButton} ${styles.dangerButton}`} onClick={handleClearChats}>
            <FaTrash />
            Clear All Chats
          </button>
          <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
          <button className={styles.sidebarButton} onClick={handleLogout}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      <div className={styles.chatArea}>
        <div className={styles.chatHeader}>
          <FaRobot className={styles.chatHeaderIcon} />
          <h2 className={styles.chatHeaderTitle}>AgriChat Assistant</h2>
        </div>

        <div className={styles.messageArea} ref={messageAreaRef}>
          {currentChat === null ? (
            <div className={styles.welcomeContainer}>
              <h2 className={styles.welcomeTitle}>Welcome to AgriChat!</h2>
              <p className={styles.welcomeText}>
                Your AI-powered assistant for all things agriculture. Ask me about crop diseases, soil management, pest control, or the latest farming techniques.
              </p>
              <p className={styles.welcomeText}>
                To get started, type a message below or select a previous conversation.
              </p>
            </div>
          ) : (
            currentChat.messages.map((message, index) => (
              <div key={index} className={`${styles.messageWrapper} ${message.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper}`}>
                <div className={`${styles.message} ${message.sender === 'user' ? styles.userMessage : styles.botMessage}`}>
                  {message.content}
                </div>
                <div className={styles.messageTimestamp}>{formatTime(message.timestamp)}</div>
              </div>
            ))
          )}
          
          {isLoading && !isTranscribing && !isRecording && (
            <div className={`${styles.messageWrapper} ${styles.botMessageWrapper}`}>
              <div className={`${styles.message} ${styles.botMessage} ${styles.typingIndicator}`}>
                <div className={styles.typingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          {isTranscribing && (
            <div className={`${styles.messageWrapper} ${styles.botMessageWrapper}`}>
              <div className={`${styles.message} ${styles.botMessage} ${styles.processing}`}>
                <span>Processing audio...</span>
                <div className={styles.waveContainer}>
                  <div className={styles.wave}></div>
                  <div className={styles.wave}></div>
                  <div className={styles.wave}></div>
                  <div className={styles.wave}></div>
                  <div className={styles.wave}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.inputArea}>
          {selectedFile && (
            <div className={styles.fileIndicatorContainer}>
              <div className={`${styles.fileIndicator} ${theme === 'dark' ? styles.dark : ''}`}>
                <FaPaperclip />
                <span className={styles.fileName}>{selectedFile.name}</span>
              </div>
            </div>
          )}
          
          <div className={styles.inputContainer}>
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className={styles.inputForm}>
              <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="audio/*"
                ref={fileInputRef}
              />
              
              <button
                type="button"
                className={`${styles.iconButton} ${styles.clipButton}`}
                onClick={() => fileInputRef.current.click()}>
                <FaPaperclip />
              </button>

              <button
                type="button"
                className={`${styles.iconButton} ${styles.micButton} ${
                  isRecording ? styles.recording : ''
                }`}
                onClick={handleToggleRecording}>
                <FaMicrophone />
              </button>

              {isRecording ? (
                <div className={styles.recordingIndicatorInForm}>
                  <span>Recording...</span>
                  <div className={styles.waveContainer}>
                    <div className={`${styles.wave} ${styles.recordingWave}`}></div>
                    <div className={`${styles.wave} ${styles.recordingWave}`}></div>
                    <div className={`${styles.wave} ${styles.recordingWave}`}></div>
                    <div className={`${styles.wave} ${styles.recordingWave}`}></div>
                    <div className={`${styles.wave} ${styles.recordingWave}`}></div>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  className={styles.inputField}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything about agriculture..."
                  disabled={isLoading}
                />
              )}
              
              <button
                type="submit"
                className={styles.sendButton}
                disabled={isLoading || !message.trim()}>
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
