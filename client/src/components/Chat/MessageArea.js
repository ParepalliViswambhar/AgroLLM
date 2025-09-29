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
        // Group user image + text messages together
        (() => {
          const grouped = [];
          const msgs = currentChat.messages;
          for (let i = 0; i < msgs.length; i++) {
            const m = msgs[i];
            // If this is a user text message and next is a user image message, group them
            if (
              m.sender === 'user' && m.content !== '__image__' &&
              msgs[i + 1] && msgs[i + 1].sender === 'user' && msgs[i + 1].content === '__image__' && msgs[i + 1].imageUrl
            ) {
              grouped.push({
                type: 'user-text-image',
                text: m.content,
                imageUrl: msgs[i + 1].imageUrl,
                timestamp: msgs[i + 1].timestamp,
              });
              i++; // skip the next message since it's grouped
            }
            // If this is a user image message and next is a user text message, group them
            else if (
              m.sender === 'user' && m.content === '__image__' && m.imageUrl &&
              msgs[i + 1] && msgs[i + 1].sender === 'user' && msgs[i + 1].content !== '__image__'
            ) {
              grouped.push({
                type: 'user-image-text',
                imageUrl: m.imageUrl,
                text: msgs[i + 1].content,
                timestamp: msgs[i + 1].timestamp,
              });
              i++; // skip the next message since it's grouped
            } else if (m.sender === 'user' && m.content === '__image__' && m.imageUrl) {
              grouped.push({
                type: 'user-image',
                imageUrl: m.imageUrl,
                timestamp: m.timestamp,
              });
            } else if (m.sender === 'user' && m.content !== '__image__') {
              // Only user text
              grouped.push({
                type: 'user-text',
                text: m.content,
                timestamp: m.timestamp,
              });
            } else if (m.sender === 'bot') {
              grouped.push({
                type: 'bot',
                text: m.content,
                timestamp: m.timestamp,
              });
            }
          }
          console.log('DEBUG: original messages', msgs);
          console.log('DEBUG: grouped array', grouped);
          return grouped.map((item, idx) => {
            if (item.type === 'user-image-text' || item.type === 'user-text-image') {
              return (
                <div key={idx} className={`${styles.messageWrapper} ${styles.userMessageWrapper}`}>
                  <div className={`${styles.message} ${styles.userMessage}`}>
                    <img src={item.imageUrl} alt="Attachment" className={styles.imagePreview} />
                    <div style={{marginTop: '0.75rem'}}>{item.text}</div>
                  </div>
                  <div className={styles.messageTimestamp}>{formatTime(item.timestamp)}</div>
                </div>
              );
            } else if (item.type === 'user-image') {
              return (
                <div key={idx} className={`${styles.messageWrapper} ${styles.userMessageWrapper}`}>
                  <div className={`${styles.message} ${styles.userMessage}`}>
                    <img src={item.imageUrl} alt="Attachment" className={styles.imagePreview} />
                  </div>
                  <div className={styles.messageTimestamp}>{formatTime(item.timestamp)}</div>
                </div>
              );
            } else if (item.type === 'user-text') {
              return (
                <div key={idx} className={`${styles.messageWrapper} ${styles.userMessageWrapper}`}>
                  <div className={`${styles.message} ${styles.userMessage}`}>{item.text}</div>
                  <div className={styles.messageTimestamp}>{formatTime(item.timestamp)}</div>
                </div>
              );
            } else if (item.type === 'bot') {
              return (
                <div key={idx} className={`${styles.messageWrapper} ${styles.botMessageWrapper}`}>
                  <div className={`${styles.message} ${styles.botMessage}`}>
                    <div className={styles.aiResponseContent}>{formatAIResponse(item.text)}</div>
                  </div>
                  <div className={styles.messageTimestamp}>{formatTime(item.timestamp)}</div>
                </div>
              );
            } else {
              return null;
            }
          });
        })()
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
