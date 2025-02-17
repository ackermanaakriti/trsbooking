import React from 'react';

const DeleteModal = ({ isOpen, onClose, onConfirm, roomName }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-content">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete the room "{roomName}"?</p>
        <div className="delete-modal-buttons">
          <button onClick={onConfirm} className="delete-modal-confirm">Delete</button>
          <button onClick={onClose} className="delete-modal-cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
