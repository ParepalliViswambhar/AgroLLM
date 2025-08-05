import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChats, createChat, predict, deleteChat, clearChats, updateChat, transcribeAudio } from '../services/api';
import styles from './ChatPage.module.css';
import { FaMicrophone, FaPaperclip, FaPaperPlane } from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [theme, setTheme] = useState('dark');
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

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
    } else {
      fetchChats();
      setCurrentChat(null); // Start with a new chat
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [currentChat, isLoading]);

  const fetchChats = () => {
    getChats().then(response => {
      const reversedChats = response.data.reverse();
      setChats(reversedChats);
    });
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
        setSelectedFile(null); // Reset after processing
      }
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === '' || isLoading) return;

    setIsLoading(true);

    const userMessage = { sender: 'user', content: message };
    let updatedMessages = currentChat ? [...currentChat.messages, userMessage] : [userMessage];

    if (currentChat) {
      setCurrentChat({ ...currentChat, messages: updatedMessages });
    } else {
      const newChat = { user: JSON.parse(localStorage.getItem('userInfo'))._id, messages: updatedMessages };
      setCurrentChat(newChat);
    }

    setMessage('');

    predict(message).then(response => {
      const botMessage = { sender: 'bot', content: response.data.answer };
      updatedMessages = [...updatedMessages, botMessage];
      
      if (currentChat && currentChat._id) {
        updateChat(currentChat._id, { messages: updatedMessages }).then(res => {
            const updatedChats = chats.map(chat => chat._id === res.data._id ? res.data : chat);
            setChats(updatedChats);
            setCurrentChat(res.data);
        });
      } else {
        createChat({ messages: updatedMessages }).then(res => {
            setChats([res.data, ...chats]);
            setCurrentChat(res.data);
        });
      }
    }).finally(() => {
        setIsLoading(false);
    });
  };

  const handleNewChat = () => {
    setCurrentChat(null);
  };

  const handleDeleteChat = (id) => {
    deleteChat(id)
      .then(() => {
        setChats(chats.filter((chat) => chat._id !== id));
        if (currentChat && currentChat._id === id) {
          setCurrentChat(chats.length > 1 ? chats.filter(chat => chat._id !== id)[0] : null);
        }
      })
      .catch((error) => {
        console.error('Failed to delete chat:', error);
      });
  };

  const handleClearChats = async () => {
    try {
      const chatsToDelete = [...chats];
      const deletePromises = chatsToDelete.map(chat => deleteChat(chat._id));
      await Promise.all(deletePromises);
      setChats([]);
      setCurrentChat(null);
    } catch (error) {
      console.error('Failed to clear all chats:', error);
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className={`${styles.chatContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.sidebar}>
        <h2 className={styles.sidebarHeading}>Chats</h2>
        <button onClick={handleNewChat} className={styles.sidebarButton}>
          + New Chat
        </button>
        <div className={styles.chatHistory}>
          {chats.map(chat => (
            <div
              key={chat._id}
              className={`${styles.chatHistoryItem} ${currentChat && currentChat._id === chat._id ? styles.active : ''}`}
              onClick={() => setCurrentChat(chat)}
            >
              <span>{chat.messages.length > 0 ? chat.messages[0].content.substring(0, 20) || 'New Chat' : 'New Chat'}...</span>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat._id); }} className={styles.deleteButton}>
                &#x1F5D1;
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleClearChats} className={`${styles.sidebarButton} ${styles.dangerButton}`}>
          Clear All Chats
        </button>
        <button onClick={handleLogout} className={styles.sidebarButton}>
          Logout
        </button>
        <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
      </div>

      <div className={styles.chatArea}>
        <div className={styles.messageArea} ref={messageAreaRef}>
          {(!currentChat || currentChat.messages.length === 0) && !isLoading ? (
            <div className={styles.welcomeContainer}>
              <h2 className={styles.welcomeTitle}>🌾 AgroRAG Assistant with AI Classification</h2>
              <p className={styles.welcomeText}>
                Ask questions about agriculture, farming practices, and crop management.
                The system uses an AI language model to intelligently classify whether questions are agriculture-related.
              </p>
              <p className={styles.welcomeText}>
                <strong>Agriculture Topics Include:</strong> Crops, Farming, Livestock, Soil, Irrigation, Fertilizers, Pest Control, etc.
              </p>
            </div>
          ) : (
            currentChat?.messages.map((message, index) => (
              <div key={index} className={`${styles.message} ${message.sender === 'user' ? styles.userMessage : styles.botMessage}`}>
                {message.content}
              </div>
            ))
          )}
          {isTranscribing && (
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
          )}
          {isLoading && !isTranscribing && !isRecording && (
            <div className={`${styles.message} ${styles.botMessage} ${styles.loading}`}>
              Bot is typing...
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
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className={`${styles.inputForm} ${theme === 'dark' ? styles.dark : ''}`}>
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
                placeholder="Ask me anything..."
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
  );
};

export default ChatPage;
