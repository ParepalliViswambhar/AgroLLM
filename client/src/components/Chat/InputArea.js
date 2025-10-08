import React, { useState, useRef, useEffect } from 'react';
import styles from '../../pages/ChatPage.module.css';
import { FaMicrophone, FaPaperclip, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { IoImageOutline, IoMusicalNotesOutline, IoCloseCircle, IoTelescopeOutline } from 'react-icons/io5';
const InputArea = ({
  imagePreviewUrl,
  handleClearAttachment,
  selectedFile,
  theme,
  handleSendMessage,
  handleAudioFileChange,
  audioFileInputRef,
  handleImageFileChange,
  imageFileInputRef,
  isAttachmentMenuOpen,
  setIsAttachmentMenuOpen,
  isRecording,
  handleToggleRecording,
  message,
  setMessage,
  isLoading,
  isTranscribing,
  isImageUploadDisabled, // disables image upload if true
  userImageCount,
  maxImagesPerChat,
  onExpertClick, // new prop for expert analysis
  expertAnalysisRemaining, // remaining expert analysis count
}) => {
  const menuRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showImageTooltip, setShowImageTooltip] = useState(false);
  const [showExpertTooltip, setShowExpertTooltip] = useState(false);
  const inputRef = useRef(null);

  
  
  const onSendClick = async (e) => {
    e.preventDefault();
    await handleSendMessage();
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        // Create a synthetic event to reuse handleImageFileChange
        const syntheticEvent = { target: { files: [file] } };
        handleImageFileChange(syntheticEvent);
      } else if (file && file.type.startsWith('audio/')) {
        // Create a synthetic event to reuse handleAudioFileChange
        const syntheticEvent = { target: { files: [file] } };
        handleAudioFileChange(syntheticEvent);
      }
      e.dataTransfer.clearData();
    }
  };

  useEffect(() => {
    if (!isAttachmentMenuOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsAttachmentMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAttachmentMenuOpen, setIsAttachmentMenuOpen]);

  return (
    <>
      <div
        className={styles.inputArea + (isDragActive ? ' ' + styles.dragActive : '')}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {imagePreviewUrl && (
        <div className={styles.imagePreviewContainer}>
          <img src={imagePreviewUrl} alt="Preview" className={styles.imagePreview} />
          <button onClick={handleClearAttachment} className={styles.clearAttachmentButton}>
            <IoCloseCircle />
          </button>
        </div>
      )}
      {isTranscribing && (
        <div className={styles.audioProcessingContainer}>
          <FaSpinner className={styles.spinner} />
          <span>Processing audio...</span>
        </div>
      )}
      <div className={styles.inputContainer}>
        <form
          onSubmit={onSendClick}
          className={styles.inputForm}>
          <input
            type="file"
            id="audio-file-upload"
            style={{ display: 'none' }}
            onChange={handleAudioFileChange}
            accept="audio/*"
            ref={audioFileInputRef}
          />
          <input
            type="file"
            id="image-file-upload"
            style={{ display: 'none' }}
            onChange={handleImageFileChange}
            accept="image/*"
            ref={imageFileInputRef}
          />
          
          <div className={styles.attachmentContainer} ref={menuRef}>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.clipButton}`}
              onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}>
              <FaPaperclip />
            </button>
            {isAttachmentMenuOpen && (
              <div className={styles.attachmentMenu} >
                <button onClick={() => { audioFileInputRef.current.click(); setIsAttachmentMenuOpen(false); }}>
                  <IoMusicalNotesOutline />
                  <span>Audio</span>
                </button>
                <div
  style={{ position: 'relative', display: 'inline-block' }}
  onMouseEnter={() => setShowImageTooltip(true)}
  onMouseLeave={() => setShowImageTooltip(false)}
  onFocus={() => setShowImageTooltip(true)}
  onBlur={() => setShowImageTooltip(false)}
>
  <button
    onClick={() => { imageFileInputRef.current.click(); setIsAttachmentMenuOpen(false); }}
    disabled={isImageUploadDisabled}
    style={isImageUploadDisabled ? { cursor: 'not-allowed' } : {}}
  >
    <IoImageOutline />
    <span>Image</span>
  </button>
  {showImageTooltip && (
    <div style={{
      position: 'absolute',
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      background: '#222',
      color: '#fff',
      padding: '6px 14px',
      borderRadius: '8px',
      fontSize: '0.93rem',
      whiteSpace: 'nowrap',
      marginLeft: '10px',
      zIndex: 9999,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      {Math.max(0, maxImagesPerChat - userImageCount)} image{Math.max(0, maxImagesPerChat - userImageCount) === 1 ? '' : 's'} left
    </div>
  )}
</div>
              </div>
            )}
          </div>

          <div 
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setShowExpertTooltip(true)}
            onMouseLeave={() => setShowExpertTooltip(false)}
          >
            <button
              type="button"
              className={`${styles.iconButton} ${styles.expertButton} ${expertAnalysisRemaining === 0 ? styles.expertButtonDisabled : ''}`}
              onClick={onExpertClick}
              disabled={expertAnalysisRemaining === 0}>
              <IoTelescopeOutline />
            </button>
            {showExpertTooltip && (
              <div className={styles.expertTooltip}>
                Deep Research
                <span className={styles.expertTooltipCount}>
                  {expertAnalysisRemaining} {expertAnalysisRemaining === 1 ? 'left' : 'left'} today
                </span>
              </div>
            )}
          </div>

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
            <div className={styles.inputFieldWrapper}>
              {message.trim().startsWith('@expert') && (
                <span className={styles.expertBadge}>
                  <IoTelescopeOutline style={{ marginRight: '0.25rem', fontSize: '0.9rem' }} />
                  Deep Research
                  <button
                    type="button"
                    className={styles.expertBadgeClose}
                    onClick={() => setMessage(message.substring(7).trim())}
                    title="Exit Deep Research mode"
                  >
                    <IoCloseCircle />
                  </button>
                </span>
              )}
              <input
                type="text"
                className={styles.inputField}
                value={message.trim().startsWith('@expert') ? message.substring(8) : message}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (message.trim().startsWith('@expert')) {
                    setMessage('@expert ' + newValue);
                  } else {
                    setMessage(newValue);
                  }
                }}
                placeholder="Ask me anything about agriculture..."
                disabled={isLoading}
                ref={inputRef}
              />
            </div>
          )}
          
          <button
            type="submit"
            className={`${styles.sendButton} ${message.trim() ? styles.active : ''}`}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default InputArea;
