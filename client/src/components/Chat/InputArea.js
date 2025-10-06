import React, { useState, useRef, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../../pages/ChatPage.module.css';
import { FaMicrophone, FaPaperclip, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { IoImageOutline, IoMusicalNotesOutline, IoCloseCircle } from 'react-icons/io5';
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
}) => {
  const menuRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  // Toast after send button
  const showImageToast = () => {
    if (typeof userImageCount === 'number' && typeof maxImagesPerChat === 'number') {
      // Subtract 1 for the image being sent now (if an image is attached)
      const left = maxImagesPerChat - userImageCount - (imagePreviewUrl ? 1 : 0);
      // Show on all sends where at least 1 image slot remains after this send
      if (left >= 1) {
        toast(
          <div style={{
            color: '#fff',
            background: 'linear-gradient(90deg, #1f8a4c 0%, #17633b 100%)',
            borderRadius: '8px',
            padding: '12px 20px',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 2px 12px rgba(31,138,76,0.15)'
          }}>
            <span style={{marginRight: 8}}>🖼️</span>
            {left} image{left === 1 ? '' : 's'} left this chat
          </div>,
          {
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            position: 'bottom-center',
            style: { background: 'transparent', boxShadow: 'none' },
            bodyStyle: { padding: 0, margin: 0 }
          }
        );
      }
    }
  };

  // Show toast when a new image is selected
  useEffect(() => {
    if (imagePreviewUrl) {
      showImageToast();
    }
    // Only run when imagePreviewUrl changes
  }, [imagePreviewUrl]);

  const onSendClick = async (e) => {
    e.preventDefault();
    showImageToast();
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
            ref={inputRef}
          />
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
