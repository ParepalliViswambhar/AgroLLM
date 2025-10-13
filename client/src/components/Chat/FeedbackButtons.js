import React, { useState, useEffect } from 'react';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { submitFeedback } from '../../services/api';
import styles from '../../pages/ChatPage.module.css';

const FeedbackButtons = ({ messageId, messageContent, chatId, isParentHovered }) => {
  const [feedback, setFeedback] = useState(null); // 'positive', 'negative', or null
  const [showNegativeModal, setShowNegativeModal] = useState(false);
  const [issueDetails, setIssueDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load feedback from localStorage when component mounts or messageId changes
  useEffect(() => {
    const feedbackKey = `feedback_${chatId}_${messageId}`;
    const storedFeedback = localStorage.getItem(feedbackKey);
    if (storedFeedback) {
      setFeedback(storedFeedback);
    } else {
      setFeedback(null);
    }
  }, [messageId, chatId]);

  const handleThumbsUp = async () => {
    if (feedback === 'positive') return; // Already submitted

    try {
      setIsSubmitting(true);
      await submitFeedback({
        rating: 'positive',
        chatId,
        messageId,
        messageContent: messageContent.substring(0, 200), // Limit length
      });
      setFeedback('positive');
      // Store feedback in localStorage
      const feedbackKey = `feedback_${chatId}_${messageId}`;
      localStorage.setItem(feedbackKey, 'positive');
    } catch (error) {
      console.error('Error submitting positive feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThumbsDown = () => {
    if (feedback === 'negative') return; // Already submitted
    setShowNegativeModal(true);
  };

  const handleSubmitNegative = async () => {
    if (!issueDetails.trim()) {
      alert('Please describe the issue');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFeedback({
        rating: 'negative',
        chatId,
        messageId,
        messageContent: messageContent.substring(0, 200),
        message: issueDetails,
      });
      setFeedback('negative');
      // Store feedback in localStorage
      const feedbackKey = `feedback_${chatId}_${messageId}`;
      localStorage.setItem(feedbackKey, 'negative');
      setShowNegativeModal(false);
      setIssueDetails('');
    } catch (error) {
      console.error('Error submitting negative feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {(isParentHovered || feedback) && (
          <>
            <button
              className={styles.copyButton}
              title="Good response"
              aria-label="Thumbs up"
              onClick={handleThumbsUp}
              disabled={isSubmitting || feedback === 'positive'}
              onMouseEnter={(e) => {
                if (!feedback) {
                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!feedback) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 0 rgba(0, 0, 0, 0)';
                }
              }}
              onMouseDown={(e) => {
                if (!feedback) {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }
              }}
              onMouseUp={(e) => {
                if (!feedback) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              style={{
                background: feedback === 'positive' ? 'rgba(16, 185, 129, 0.12)' : 'none',
                border: 'none',
                cursor: feedback === 'positive' ? 'default' : 'pointer',
                opacity: feedback === 'negative' ? 0.3 : 1,
                padding: '8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                transform: 'scale(1)',
                boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
              }}
            >
              <FiThumbsUp
                size={16}
                color={feedback === 'positive' ? '#10b981' : 'currentColor'}
              />
            </button>
            <button
              className={styles.copyButton}
              title="Bad response"
              aria-label="Thumbs down"
              onClick={handleThumbsDown}
              disabled={isSubmitting || feedback === 'negative'}
              onMouseEnter={(e) => {
                if (!feedback) {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!feedback) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 0 rgba(0, 0, 0, 0)';
                }
              }}
              onMouseDown={(e) => {
                if (!feedback) {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }
              }}
              onMouseUp={(e) => {
                if (!feedback) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              style={{
                background: feedback === 'negative' ? 'rgba(239, 68, 68, 0.12)' : 'none',
                border: 'none',
                cursor: feedback === 'negative' ? 'default' : 'pointer',
                opacity: feedback === 'positive' ? 0.3 : 1,
                padding: '8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                transform: 'scale(1)',
                boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
              }}
            >
              <FiThumbsDown
                size={16}
                color={feedback === 'negative' ? '#ef4444' : 'currentColor'}
              />
            </button>
          </>
        )}
      </div>

      {showNegativeModal && (
        <div className={styles.feedbackModalOverlay} onClick={() => setShowNegativeModal(false)}>
          <div className={styles.feedbackModalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.feedbackModalTitle}>What was the issue?</h3>
            <textarea
              className={styles.feedbackModalTextarea}
              value={issueDetails}
              onChange={(e) => setIssueDetails(e.target.value)}
              placeholder="Please describe what was wrong with this response..."
              rows="4"
              maxLength={500}
              autoFocus
            />
            <div className={styles.feedbackModalCharCount}>
              {issueDetails.length}/500 characters
            </div>
            <div className={styles.feedbackModalActions}>
              <button
                className={styles.feedbackModalCancelBtn}
                onClick={() => {
                  setShowNegativeModal(false);
                  setIssueDetails('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className={styles.feedbackModalSubmitBtn}
                onClick={handleSubmitNegative}
                disabled={isSubmitting || !issueDetails.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButtons;
