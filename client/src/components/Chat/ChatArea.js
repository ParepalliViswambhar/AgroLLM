  import React from 'react';
import styles from '../../pages/ChatPage.module.css';
import { FaRobot } from 'react-icons/fa';
import MessageArea from './MessageArea';
import InputArea from './InputArea';

const ChatArea = (props) => {
  const { isTranscribing, ...messageAreaProps } = props;
  
  return (
    <div className={styles.chatArea}>
      <div className={styles.chatHeader}>
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
