import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import './common.css';
function ConfirmationModal({ 
  show, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  confirmVariant = 'danger',
  cancelVariant = 'outline-secondary',
  size = 'md',
  icon = '⚠️',
  isLoading = false,
  children
}) {
  return (
    <Modal 
      show={show} 
      onHide={onCancel} 
      centered 
      size={size}
      backdrop="static"
      className="confirmation-modal-premium"
    >
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="w-100 text-center">
          <div className="modal-icon mb-3">
            {icon}
          </div>
          <h5 className="fw-bold text-dark mb-0">{title}</h5>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="text-center pt-0">
        <p className="text-muted mb-4">{message}</p>
        {children}
      </Modal.Body>
      
      <Modal.Footer className="border-top-0 pt-0">
        <Row className="w-100 g-2">
          <Col>
            <Button 
              variant={cancelVariant}
              onClick={onCancel}
              disabled={isLoading}
              className="w-100 py-2"
            >
              {cancelText}
            </Button>
          </Col>
          <Col>
            <Button 
              variant={confirmVariant}
              onClick={onConfirm}
              disabled={isLoading}
              className="w-100 py-2 fw-semibold"
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </Col>
        </Row>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmationModal;