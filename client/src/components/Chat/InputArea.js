import React from 'react';
import styles from '../../pages/ChatPage.module.css';
import { FaMicrophone, FaPaperclip, FaPaperPlane } from 'react-icons/fa';
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
}) => {
  return (
    <div className={styles.inputArea}>
      {imagePreviewUrl && (
        <div className={styles.imagePreviewContainer}>
          <img src={imagePreviewUrl} alt="Preview" className={styles.imagePreview} />
          <button onClick={handleClearAttachment} className={styles.clearAttachmentButton}>
            <IoCloseCircle />
          </button>
        </div>
      )}
      {selectedFile && (
        <div className={styles.fileIndicatorContainer}>
          <div className={`${styles.fileIndicator} ${theme === 'dark' ? styles.dark : ''}`}>
            <IoMusicalNotesOutline />
            <span className={styles.fileName}>Audio file attached</span>
            <button onClick={handleClearAttachment} className={styles.clearAttachmentButton}>
              <IoCloseCircle />
            </button>
          </div>
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
          
          <div className={styles.attachmentContainer}>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.clipButton}`}
              onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}>
              <FaPaperclip />
            </button>
            {isAttachmentMenuOpen && (
              <div className={styles.attachmentMenu}>
                <button onClick={() => { audioFileInputRef.current.click(); setIsAttachmentMenuOpen(false); }}>
                  <IoMusicalNotesOutline />
                  <span>Audio</span>
                </button>
                <button onClick={() => { imageFileInputRef.current.click(); setIsAttachmentMenuOpen(false); }}>
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
            className={styles.sendButton}
            disabled={isLoading || !message.trim()}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputArea;
