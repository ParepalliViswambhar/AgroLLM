import React, { useState } from 'react';
import styles from '../../pages/ChatPage.module.css';
import { FaMicrophone, FaPaperclip, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { IoImageOutline, IoMusicalNotesOutline, IoCloseCircle } from 'react-icons/io5';

import { useEffect, useRef } from 'react';
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
}) => {
  const menuRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Drag and drop handlers
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
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
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
                <button onClick={() => { imageFileInputRef.current.click(); setIsAttachmentMenuOpen(false); }} disabled={isImageUploadDisabled}>
                  <IoImageOutline />
                  <span>Image</span>
                </button>
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
            <input
              type="text"
              className={styles.inputField}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about agriculture..."
              disabled={isLoading}
            />
          )}
          
          <button
            type="submit"
            className={`${styles.sendButton} ${message.trim() ? styles.active : ''}`}
            disabled={isLoading || !message.trim()}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputArea;
