import React, { useState, useRef, useEffect } from 'react';
import styles from '../../pages/ChatPage.module.css';
import { FaMicrophone, FaPaperclip, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { IoImageOutline, IoMusicalNotesOutline, IoCloseCircle, IoTelescopeOutline, IoCameraOutline } from 'react-icons/io5';
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
  handleOpenCamera, // camera handlers
  isCameraOpen,
  handleCloseCamera,
  handleCapturePhoto,
  videoRef,
  canvasRef,
}) => {
  const menuRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showImageTooltip, setShowImageTooltip] = useState(false);
  const [showExpertTooltip, setShowExpertTooltip] = useState(false);
  const inputRef = useRef(null);
  
  // Check if expert mode is active
  const isExpertMode = message.trim().startsWith('@expert');
  
  // Check if mobile device
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Reset textarea height when message is cleared
  useEffect(() => {
    if (message === '' || message === '@expert ') {
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  }, [message]);

  
  
  const onSendClick = async (e) => {
    e.preventDefault();
    await handleSendMessage();
    // Reset textarea height and remove focus glow after sending
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.blur();
    }
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
      {/* Camera Modal */}
      {isCameraOpen && (
        <div className={styles.cameraModal}>
          <div className={styles.cameraContainer}>
            <div className={styles.cameraHeader}>
              <h3>Take a Photo</h3>
              <button 
                className={styles.cameraCloseButton}
                onClick={handleCloseCamera}
              >
                <IoCloseCircle />
              </button>
            </div>
            <div className={styles.cameraViewport}>
              <video 
                ref={videoRef}
                autoPlay 
                playsInline
                className={styles.cameraVideo}
              />
              <canvas 
                ref={canvasRef}
                style={{ display: 'none' }}
              />
            </div>
            <div className={styles.cameraControls}>
              <button 
                className={styles.cameraCaptureButton}
                onClick={handleCapturePhoto}
              >
                <IoCameraOutline />
                <span>Capture</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
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
                <button 
                  onClick={() => { handleOpenCamera(); setIsAttachmentMenuOpen(false); }}
                  disabled={isImageUploadDisabled}
                  style={isImageUploadDisabled ? { cursor: 'not-allowed' } : {}}
                >
                  <IoCameraOutline />
                  <span>Camera</span>
                </button>
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
              className={`${styles.iconButton} ${styles.expertButton} ${isExpertMode ? styles.expertButtonActive : ''} ${expertAnalysisRemaining === 0 ? styles.expertButtonDisabled : ''}`}
              onClick={() => {
                if (isExpertMode) {
                  // Disable expert mode - remove @expert prefix
                  setMessage(message.substring(7).trim());
                } else {
                  // Enable expert mode - add @expert prefix
                  onExpertClick();
                }
              }}
              disabled={expertAnalysisRemaining === 0}>
              <IoTelescopeOutline />
            </button>
            {showExpertTooltip && (
              <div className={styles.expertTooltip}>
                {isExpertMode ? 'Exit Deep Research' : 'Deep Research'}
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
              <textarea
                className={`${styles.inputField} ${isExpertMode ? styles.inputFieldExpertMode : ''}`}
                value={isExpertMode ? message.substring(8) : message}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (isExpertMode) {
                    setMessage('@expert ' + newValue);
                  } else {
                    setMessage(newValue);
                  }
                }}
                placeholder={
                  isExpertMode 
                    ? (isMobile ? "Deep Research mode..." : "Deep Research mode - Ask anything...") 
                    : (isMobile ? "Ask about agriculture..." : "Ask me anything about agriculture...")
                }
                disabled={isLoading}
                ref={inputRef}
                rows={1}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
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
