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
  // Function to format AI response content for better readability
  const formatAIResponse = (content) => {
    if (!content) return content;

    // Clean up the content first - remove markdown artifacts and clean formatting
    let cleanContent = content
      .replace(/\*\*LLM-Classified Agriculture Answer\*\*/g, 'Agriculture Analysis')
      .replace(/\*\*Agriculture Classification Result\*\*/g, 'Analysis Result')
      .replace(/\*\*/g, '') // Remove all remaining markdown bold
      .replace(/\(EN\):/g, '') // Remove language indicators
      .replace(/\n\n+/g, '\n\n') // Clean up multiple line breaks
      .trim();

    // Split content into logical sections
    const sections = cleanContent.split(/(?=\n\n|Management strategies:|Symptoms:|Causes:|Prevention:|Treatment:|In summary|Summary:|Conclusion:)/);
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      
      if (trimmedSection.length === 0) return null;
      
      // Handle section headers
      if (trimmedSection.toLowerCase().includes('management strategies') ||
          trimmedSection.toLowerCase().includes('symptoms') ||
          trimmedSection.toLowerCase().includes('causes') ||
          trimmedSection.toLowerCase().includes('prevention') ||
          trimmedSection.toLowerCase().includes('treatment') ||
          trimmedSection.toLowerCase().includes('identification') ||
          trimmedSection.toLowerCase().includes('diagnosis')) {
        return (
          <div key={index} className={styles.aiSectionHeader}>
            {trimmedSection}
          </div>
        );
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(trimmedSection)) {
        return (
          <div key={index} className={styles.aiListItem}>
            {trimmedSection}
          </div>
        );
      }
      
      // Handle bullet points
      if (trimmedSection.startsWith('•') || trimmedSection.startsWith('-')) {
        return (
          <div key={index} className={styles.aiListItem}>
            {trimmedSection}
          </div>
        );
      }
      
      // Handle summary/conclusion sections
      if (trimmedSection.toLowerCase().includes('summary') || 
          trimmedSection.toLowerCase().includes('conclusion') ||
          trimmedSection.toLowerCase().includes('in summary')) {
        return (
          <div key={index} className={styles.aiSummary}>
            {trimmedSection}
          </div>
        );
      }
      
      // Handle regular paragraphs
      if (trimmedSection.length > 0) {
        return (
          <div key={index} className={styles.aiParagraph}>
            {trimmedSection}
          </div>
        );
      }
      
      return null;
    }).filter(Boolean); // Remove null entries
  };

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
              ) : message.sender === 'bot' ? (
                <div className={styles.aiResponseContent}>
                  {formatAIResponse(message.content)}
                </div>
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
      
    </div>
  );
};

export default MessageArea;
