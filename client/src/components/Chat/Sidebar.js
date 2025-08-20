import React from 'react';
import styles from '../../pages/ChatPage.module.css';
import { FaPlus, FaTrash, FaSignOutAlt, FaLeaf } from 'react-icons/fa';
import ThemeToggle from '../ThemeToggle';

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
  return (
    <div className={styles.sidebar}>
      <div className={styles.appHeader}>
        <div className={styles.appLogo}>
          <FaLeaf className={styles.logoIcon} />
        </div>
        <h1 className={styles.appTitle}>AgriChat</h1>
      </div>

      {userInfo && (
        <div className={styles.userSection}>
          <div className={styles.userName}>{userInfo.name || 'John Farmer'}</div>
        </div>
      )}

      <div className={styles.recentChatsSection}>
        <h2 className={styles.sectionTitle}>Recent Chats</h2>
        <button className={styles.newChatButton} onClick={handleNewChat}>
          <FaPlus className={styles.newChatIcon} />
          New Chat
        </button>
      </div>
      <div className={styles.chatHistory}>
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

      <div className={styles.sidebarOptions}>
        <button className={`${styles.sidebarButton} ${styles.dangerButton}`} onClick={handleClearChats}>
          <FaTrash />
          Clear All Chats
        </button>
        <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
        <button className={styles.sidebarButton} onClick={handleLogout}>
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
