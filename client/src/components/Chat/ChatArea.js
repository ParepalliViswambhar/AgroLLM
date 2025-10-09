import React from 'react';
import styles from '../../pages/ChatPage.module.css';
import { FaRobot, FaBars } from 'react-icons/fa';
import MessageArea from './MessageArea';
import InputArea from './InputArea';

const ChatArea = (props) => {
  const { isTranscribing, onToggleSidebar, ...messageAreaProps } = props;
  
  return (
    <div className={styles.chatArea}>
      <div className={styles.chatHeader}>
        <button 
          className={styles.mobileMenuButton} 
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <FaBars />
        </button>
        <FaRobot className={styles.chatHeaderIcon} />
        <h2 className={styles.chatHeaderTitle}>AgriChat Assistant</h2>
      </div>

      <MessageArea 
        {...messageAreaProps} 
        isTranscribing={isTranscribing} 
      />
      <InputArea 
        {...messageAreaProps} 
        isTranscribing={isTranscribing} 
      />
    </div>
  );
};

export default ChatArea;
