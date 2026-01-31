import React, { useState, ReactNode } from 'react';
import { Modal, Button } from 'antd';
import '../css/confirmation.css'; // Import the CSS file for custom styles

interface ConfirmationModalProps {
  title: string;
  content: string;
  okText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  trigger?: ReactNode; // Accept a custom trigger component
  position?: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'center'; // Position prop
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  content,
  okText = 'Yes',
  cancelText = 'No',
  onConfirm,
  onCancel,
  trigger,
  position = 'center' // Default to 'center'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const showModal = () => {
    setIsVisible(true);
  };

  const handleOk = () => {
    setIsVisible(false);
    onConfirm();
  };

  const handleCancel = () => {
    setIsVisible(false);
    onCancel();
  };

  return (
    <>
      {/* If a custom trigger is passed, render it; otherwise, default to a button */}
      {trigger ? (
        React.cloneElement(trigger as React.ReactElement, { onClick: showModal })
      ) : (
        <Button type="primary" onClick={showModal}>
          Open Confirmation
        </Button>
      )}

      <Modal
        title={title}
        open={isVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={okText}
        cancelText={cancelText}
        footer={null} // Hide footer if you want only a custom action
        centered={false} // Disable the default centering
        className={`confirmation-modal ${position}`} // Apply dynamic class for position
      >
        <p>{content}</p>
        <div style={{ textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 10 }}>
            {cancelText}
          </Button>
          <Button type="primary" onClick={handleOk}>
            {okText}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ConfirmationModal;
