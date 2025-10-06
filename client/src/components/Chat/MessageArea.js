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

  // Helper component for copy button
  const CopyButton = ({ content, className = '', style = {} }) => {
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(content);
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };

    return (
      <button
        className={`${styles.copyButton} ${className}`}
        title={isCopied ? "Copied!" : "Copy"}
        onClick={handleCopy}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '6px',
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          transform: 'scale(1)',
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
          ...style 
        }}
        onMouseEnter={(e) => {
          if (!isCopied) {
            e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 0 0 rgba(0, 0, 0, 0)';
        }}
        onMouseDown={(e) => {
          e.target.style.transform = isCopied ? 'scale(1)' : 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          if (!isCopied) {
            e.target.style.transform = 'scale(1.1)';
          }
        }}
      >
        {isCopied ? (
          // Checkmark/tick icon
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ color: '#10b981' }}
          >
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        ) : (
          // Copy icon
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ color: '#6b7280' }}
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        )}
      </button>
    );
  };

  // Function to group messages
  const groupMessages = (messages) => {
    const grouped = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      
      // If this is a user text message and next is a user image message, group them
      if (
        m.sender === 'user' && m.content !== '__image__' &&
        messages[i + 1] && messages[i + 1].sender === 'user' && 
        messages[i + 1].content === '__image__' && messages[i + 1].imageUrl
      ) {
        grouped.push({
          type: 'user-text-image',
          text: m.content,
          imageUrl: messages[i + 1].imageUrl,
          timestamp: messages[i + 1].timestamp,
        });
        i++; // skip the next message since it's grouped
      }
      // If this is a user image message and next is a user text message, group them
      else if (
        m.sender === 'user' && m.content === '__image__' && m.imageUrl &&
        messages[i + 1] && messages[i + 1].sender === 'user' && 
        messages[i + 1].content !== '__image__'
      ) {
        grouped.push({
          type: 'user-image-text',
          imageUrl: m.imageUrl,
          text: messages[i + 1].content,
          timestamp: messages[i + 1].timestamp,
        });
        i++; // skip the next message since it's grouped
      } 
      else if (m.sender === 'user' && m.content === '__image__' && m.imageUrl) {
        grouped.push({
          type: 'user-image',
          imageUrl: m.imageUrl,
          timestamp: m.timestamp,
        });
      } 
      else if (m.sender === 'user' && m.content !== '__image__') {
        grouped.push({
          type: 'user-text',
          text: m.content,
          timestamp: m.timestamp,
        });
      } 
      else if (m.sender === 'bot') {
        grouped.push({
          type: 'bot',
          text: m.content,
          timestamp: m.timestamp,
        });
      }
    }
    return grouped;
  };

  // Function to render grouped messages
  const renderGroupedMessages = (groupedMessages) => {
    return groupedMessages.map((item, idx) => {
      // Determine what content to copy
      let copyContent = '';
      if (item.type === 'user-image-text' || item.type === 'user-text-image') {
        copyContent = item.text; // Only text, not image URL
      } else if (item.type === 'user-image') {
        copyContent = item.imageUrl;
      } else if (item.type === 'user-text') {
        copyContent = item.text;
      } else if (item.type === 'bot') {
        copyContent = item.text;
      }

      const handleMouseEnter = (e) => {
        const btn = e.currentTarget.querySelector('.userCopyBtn');
        if (btn) btn.style.display = 'flex';
      };

      const handleMouseLeave = (e) => {
        const btn = e.currentTarget.querySelector('.userCopyBtn');
        if (btn) btn.style.display = 'none';
      };

      switch (item.type) {
        case 'user-image-text':
        case 'user-text-image':
          return (
            <div 
              key={idx} 
              className={`${styles.messageWrapper} ${styles.userMessageWrapper}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className={`${styles.message} ${styles.userMessage}`}>
                <img src={item.imageUrl} alt="Attachment" className={styles.imagePreview} />
                <div style={{marginTop: '0.75rem'}}>
                  {item.text}
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: '24px'}}>
                <span 
                  className="userCopyBtn" 
                  style={{
                    display: 'none',
                    marginRight: '8px'
                  }}
                >
                  <CopyButton content={copyContent} />
                </span>
              </div>
              <div className={styles.messageTimestamp}>{formatTime(item.timestamp)}</div>
            </div>
          );

        case 'user-image':
          return (
            <div key={idx} className={`${styles.messageWrapper} ${styles.userMessageWrapper}`}>
              <div className={`${styles.message} ${styles.userMessage}`}>
                <img src={item.imageUrl} alt="Attachment" className={styles.imagePreview} />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <CopyButton content={copyContent} />
              </div>
              <div className={styles.messageTimestamp}>{formatTime(item.timestamp)}</div>
            </div>
          );

        case 'user-text':
          return (
            <div 
              key={idx} 
              className={`${styles.messageWrapper} ${styles.userMessageWrapper}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className={`${styles.message} ${styles.userMessage}`}>
                {item.text}
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: '24px'}}>
                <span 
                  className="userCopyBtn" 
                  style={{
                    display: 'none',
                    marginRight: '8px'
                  }}
                >
                  <CopyButton content={copyContent} />
                </span>
              </div>
              <div className={styles.messageTimestamp}>{formatTime(item.timestamp)}</div>
            </div>
          );

        case 'bot':
          return (
            <div key={idx} className={`${styles.messageWrapper} ${styles.botMessageWrapper}`}>
              <div className={`${styles.message} ${styles.botMessage}`}>
                <div className={styles.aiResponseContent}>
                  {formatAIResponse(item.text)}
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: '24px', gap: '4px'}}>
                <SpeakerButton answer={item.text} />
                <CopyButton content={copyContent} />
              </div>
              <div className={styles.messageTimestamp}>{formatTime(item.timestamp)}</div>
            </div>
          );

        default:
          return null;
      }
    });
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
        renderGroupedMessages(groupMessages(currentChat.messages))
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

// Speaker button for reading bot answers aloud
const SpeakerButton = ({ answer }) => {
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const synthRef = React.useRef(window.speechSynthesis);
  const utterRef = React.useRef(null);

  const handleSpeak = () => {
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!answer) return;
    const utter = new window.SpeechSynthesisUtterance(answer);
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    utterRef.current = utter;
    setIsSpeaking(true);
    synthRef.current.speak(utter);
  };

  React.useEffect(() => {
    return () => {
      if (isSpeaking) synthRef.current.cancel();
    };
  }, [isSpeaking]);

  return (
    <button
      className={styles.copyButton}
      title={isSpeaking ? 'Stop speaking' : 'Read answer'}
      aria-label="Read answer"
      onClick={handleSpeak}
      style={{
        background: hovered ? 'rgba(16, 185, 129, 0.12)' : 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
        boxShadow: hovered ? '0 4px 12px rgba(16, 185, 129, 0.12)' : '0 0 0 rgba(0,0,0,0)',
        marginRight: '8px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={e => e.target.style.transform = 'scale(0.95)'}
      onMouseUp={e => e.target.style.transform = 'scale(1.1)'}
    >
      {/* Speaker icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isSpeaking ? '#10b981' : '#6b7280' }}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
    </button>
  );
};

export default MessageArea;