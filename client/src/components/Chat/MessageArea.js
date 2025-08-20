import React from 'react';
import styles from '../../pages/ChatPage.module.css';

const MessageArea = ({
  currentChat,
  isLoading,
  isTranscribing,
  isRecording,
  messageAreaRef,
  formatTime,
}) => {
  return (
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
              {message.imageUrl ? (
                <img src={message.imageUrl} alt="Attachment" className={styles.imagePreview} />
              ) : (
                message.content
              )}
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
  );
};

export default MessageArea;
