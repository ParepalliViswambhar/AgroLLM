import React from 'react';
import styles from '../../pages/ChatPage.module.css';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
        </div>
        <div className={styles.modalBody}>
          <p>{message}</p>
        </div>
        <div className={styles.modalFooter}>
          <button 
            className={`${styles.modalButton} ${styles.cancelButton}`}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`${styles.modalButton} ${styles[`${confirmVariant}Button`]}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
