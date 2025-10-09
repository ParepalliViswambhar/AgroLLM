import React, { useState, useRef, useEffect } from 'react';
import styles from '../../pages/ChatPage.module.css';
import { FaPlus, FaTrash, FaSignOutAlt, FaLeaf, FaChevronDown, FaSun, FaMoon, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Sidebar = ({
  userInfo,
  chats,
  currentChat,
  handleNewChat,
  setCurrentChat,
  handleDeleteChat,
  theme,
  handleThemeToggle,
  onClearChatsClick,
  onLogoutClick,
  isSidebarOpen,
  onCloseSidebar,
  isSidebarCollapsed,
  onToggleCollapse,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    if (typeof onClearChatsClick === 'function') onClearChatsClick();
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    if (typeof onLogoutClick === 'function') onLogoutClick();
  };

  const handleChatSelect = (chat) => {
    setCurrentChat(chat);
    // Close sidebar on mobile after selecting a chat
    if (onCloseSidebar) onCloseSidebar();
  };

  const handleNewChatClick = () => {
    handleNewChat();
    // Close sidebar on mobile after creating new chat
    if (onCloseSidebar) onCloseSidebar();
  };

  return (
    <div className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.appHeader}>
        <div className={styles.appLogo}>
          <FaLeaf className={styles.logoIcon} />
        </div>
        <h1 className={styles.appTitle}>AgroLLM</h1>
        <button 
          className={styles.collapseButton}
          onClick={onToggleCollapse}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      <div className={styles.chatHistory}>
        <div className={styles.chatActions}>
          <button 
            className={styles.newChatButton} 
            onClick={handleNewChatClick}
            title="New Chat"
          >
            <FaPlus className={styles.newChatIcon} />
            <span className={styles.buttonText}>New Chat</span>
          </button>
          <button 
            className={`${styles.clearChatsButton}`} 
            onClick={handleClearChatsClick}
            title="Clear Chats"
          >
            <FaTrash />
            <span className={styles.buttonText}>Clear Chats</span>
          </button>
        </div>
        {!isSidebarCollapsed && chats.map(chat => (
          <div
            key={chat._id}
            className={`${styles.chatHistoryItem} ${currentChat?._id === chat._id ? styles.active : ''}`}
            onClick={() => handleChatSelect(chat)}
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
          <button 
            className={styles.userButton} 
            onClick={toggleDropdown}
            title={isSidebarCollapsed ? userInfo?.name || 'User' : ''}
          >
            <div className={styles.userInitials}>
              {userInfo?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isSidebarCollapsed && (
              <>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{userInfo?.name || 'User'}</div>
                  <div className={styles.userEmail}>{userInfo?.email || ''}</div>
                </div>
                <FaChevronDown className={`${styles.dropdownIcon} ${isDropdownOpen ? styles.rotated : ''}`} />
              </>
            )}
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

    </div>
  );
};

export default Sidebar;
