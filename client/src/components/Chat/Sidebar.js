import React, { useState, useRef, useEffect } from 'react';
import styles from '../../pages/ChatPage.module.css';
import { FaPlus, FaTrash, FaSignOutAlt, FaLeaf, FaChevronDown, FaSun, FaMoon } from 'react-icons/fa';
import ConfirmationModal from '../common/ConfirmationModal';

const Sidebar = ({
  userInfo,
  chats,
  currentChat,
  handleNewChat,
  setCurrentChat,
  handleDeleteChat,
  handleClearChats,
  theme,
  handleThemeToggle,
  handleLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showClearChatsModal, setShowClearChatsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleThemeChange = () => {
    handleThemeToggle();
    // Don't close the dropdown when toggling theme
  };

  const handleClearChatsClick = () => {
    setIsDropdownOpen(false);
    setShowClearChatsModal(true);
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const handleConfirmClearChats = () => {
    setShowClearChatsModal(false);
    handleClearChats();
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.appHeader}>
        <div className={styles.appLogo}>
          <FaLeaf className={styles.logoIcon} />
        </div>
        <h1 className={styles.appTitle}>AgroLLM</h1>
      </div>

      <div className={styles.chatHistory}>
        <div className={styles.chatActions}>
          <button className={styles.newChatButton} onClick={handleNewChat}>
            <FaPlus className={styles.newChatIcon} />
            New Chat
          </button>
          <button 
            className={`${styles.clearChatsButton}`} 
            onClick={handleClearChatsClick}
          >
            <FaTrash />
            Clear Chats
          </button>
        </div>
        {chats.map(chat => (
          <div
            key={chat._id}
            className={`${styles.chatHistoryItem} ${currentChat?._id === chat._id ? styles.active : ''}`}
            onClick={() => setCurrentChat(chat)}
          >
            <div className={styles.chatInfo}>
              <p className={styles.chatTitle}>{(chat.messages && chat.messages.length > 0) ? chat.messages[0].content.substring(0, 20) + "..." : 'New Chat'}</p>
            </div>
            <button
              className={styles.deleteButton}
              onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat._id); }}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.userDropdown} ref={dropdownRef}>
          <button className={styles.userButton} onClick={toggleDropdown}>
            <div className={styles.userInitials}>
              {userInfo?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{userInfo?.name || 'User'}</div>
              <div className={styles.userEmail}>{userInfo?.email || ''}</div>
            </div>
            <FaChevronDown className={`${styles.dropdownIcon} ${isDropdownOpen ? styles.rotated : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <button 
                className={styles.dropdownItem} 
                onClick={handleThemeChange}
              >
                {theme === 'dark' ? (
                  <>
                    <FaSun className={styles.dropdownIcon} />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <FaMoon className={styles.dropdownIcon} />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              <button 
                className={`${styles.dropdownItem} ${styles.logoutButton}`} 
                onClick={handleLogoutClick}
              >
                <FaSignOutAlt className={styles.dropdownIcon} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clear Chats Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearChatsModal}
        onClose={() => setShowClearChatsModal(false)}
        onConfirm={handleConfirmClearChats}
        title="Clear All Chats"
        message="Are you sure you want to clear all your chat history? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        confirmVariant="danger"
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        confirmVariant="primary"
      />
    </div>
  );
};

export default Sidebar;
