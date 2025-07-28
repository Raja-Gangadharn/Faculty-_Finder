import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, Nav, Container, Image, OverlayTrigger, Popover, ListGroup, Button } from 'react-bootstrap';
import { FaBell, FaEnvelope, FaUser, FaSun, FaMoon, FaBars } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../../assets/faculty/TopNavbar.css';

const NOTIFICATIONS_PER_PAGE = 10;

const TopNavbar = ({ onToggleSidebar }) => {
  const { firstName, lastName, email } = useAuth();

  // Theme state handling
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('facultyTheme') === 'dark';
  });

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  useEffect(() => {
    const facultyPortal = document.querySelector('.faculty-portal');
    if (facultyPortal) {
      if (isDarkMode) {
        facultyPortal.classList.add('dark-mode');
        localStorage.setItem('facultyTheme', 'dark');
      } else {
        facultyPortal.classList.remove('dark-mode');
        localStorage.setItem('facultyTheme', 'light');
      }
    }
  }, [isDarkMode]);
  // Dummy notifications; replace with real data later
  const [notifications, setNotifications] = useState(() => 
    Array.from({ length: 120 }).map((_, i) => ({
      id: i + 1,
      text: `Dummy notification #${i + 1}`,
      time: `${i + 1}m ago`,
      read: i < 5 ? false : true,
    }))
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(5);

  const loadMoreNotifications = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Simulate API call with timeout
    setTimeout(() => {
      const startIndex = page * NOTIFICATIONS_PER_PAGE;
      const nextPage = page + 1;
      
      // In a real app, you would fetch the next page from your API
      const newNotifications = Array.from({ length: NOTIFICATIONS_PER_PAGE }).map((_, i) => ({
        id: startIndex + i + 1,
        text: `Dummy notification #${startIndex + i + 1}`,
        time: `${startIndex + i + 1}m ago`,
        read: startIndex + i >= 5, // First 5 are unread
      }));
      
      setNotifications(prev => [...prev, ...newNotifications]);
      setPage(nextPage);
      setHasMore(startIndex + NOTIFICATIONS_PER_PAGE < 200); // Stop after 200 items for demo
      setIsLoading(false);
    }, 500);
  }, [page, isLoading, hasMore]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const userInitials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <Navbar 
      bg={isDarkMode ? 'dark' : 'light'} 
      variant={isDarkMode ? 'dark' : 'light'} 
      expand="lg" 
      className="top-navbar"
      fixed="top"
    >
      <Container fluid>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="align-items-center">
            <Nav.Link className="position-relative me-3" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </Nav.Link>
            <OverlayTrigger
              trigger="click"
              placement="bottom"
              rootClose
              overlay={
                <Popover id="notifications-popover" className="shadow" style={{ width: '320px' }}>
                  <Popover.Header as="div" className="d-flex justify-content-between align-items-center notifications-header px-3 py-2">
                    <div>
                      <span className="fw-semibold">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="badge bg-primary ms-2">{unreadCount} unread</span>
                      )}
                    </div>
                    <div>
                      <button 
                        className="btn btn-sm btn-link p-0 text-decoration-none me-2"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                      >
                        Mark all as read
                      </button>
                      <button 
                        className="btn btn-sm btn-link p-0 text-decoration-none"
                        onClick={() => console.log('Clear all')}
                      >
                        Clear all
                      </button>
                    </div>
                  </Popover.Header>
                  <Popover.Body style={{ padding: 0 }}>
                    <div 
                      style={{ maxHeight: '400px', overflowY: 'auto' }}
                      onScroll={(e) => {
                        const { scrollTop, scrollHeight, clientHeight } = e.target;
                        if (scrollHeight - scrollTop <= clientHeight + 20) {
                          loadMoreNotifications();
                        }
                      }}
                    >
                      {notifications.length ? (
                        <ListGroup variant="flush">
                          {notifications.map((n) => (
                            <ListGroup.Item 
                              key={n.id} 
                              className={`d-flex justify-content-between align-items-start ${!n.read ? 'unread' : ''}`}
                              onClick={() => !n.read && markAsRead(n.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex align-items-center">
                                {!n.read && (
                                  <span className="me-2" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0d6efd' }} />
                                )}
                                <span>{n.text}</span>
                              </div>
                              <small className="text-muted ms-2" style={{ whiteSpace: 'nowrap' }}>{n.time}</small>
                            </ListGroup.Item>
                          ))}
                          {isLoading && (
                            <div className="text-center py-2">
                              <div className="spinner-border spinner-border-sm text-muted" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div>
                          )}
                          {!hasMore && (
                            <div className="text-center py-2 text-muted small">
                              No more notifications
                            </div>
                          )}
                        </ListGroup>
                      ) : (
                        <div className="text-center py-4 text-muted">
                          <FaBell className="mb-2" size={24} />
                          <div>No notifications yet</div>
                        </div>
                      )}
                    </div>
                    <div className="text-center py-2 border-top">
                      <button 
                        className="btn btn-link btn-sm text-decoration-none" 
                        onClick={() => console.log('View all')}
                      >
                        View all notifications
                      </button>
                    </div>
                  </Popover.Body>
                </Popover>
              }
            >
              <Nav.Link as="span" className="position-relative me-3" style={{ cursor: 'pointer' }}>
                <FaBell size={20} />
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Nav.Link>
            </OverlayTrigger>
            <Nav.Link className="position-relative me-3">
              <FaEnvelope size={20} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                5
              </span>
            </Nav.Link>
            <div className="user-profile d-flex align-items-center">
              <div className="avatar me-2 bg-primary text-white d-flex align-items-center justify-content-center rounded-circle" style={{ width: '36px', height: '36px' }}>
                {userInitials || <FaUser size={16} />}
              </div>
              <div className="d-none d-md-flex flex-column">
                <span className="fw-bold">{`${firstName || ''} ${lastName || ''}`.trim() || 'User'}</span>
                <small className="text-muted" style={{ fontSize: '0.8rem' }}>{email || ''}</small>
              </div>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
