// src/contexts/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext(null);

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 3000) => {
    const newToast = {
      id: Date.now(), // Use a more unique ID
      type,
      message,
      duration,
      show: true,
    };
    setToasts(prevToasts => [...prevToasts, newToast]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const contextValue = {
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 1050 }}
      >
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            show={toast.show}
            onClose={() => removeToast(toast.id)}
            delay={toast.duration}
            autohide
            bg={toast.type === 'danger' ? 'danger' : toast.type === 'success' ? 'success' : toast.type === 'info' ? 'info' : 'warning'}
            animation={true}
          >
            <Toast.Header>
              <strong className="me-auto text-capitalize">{toast.type}</strong>
              <small>Now</small>
            </Toast.Header>
            <Toast.Body className={toast.type === 'danger' ? 'text-white' : ''}>
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};
