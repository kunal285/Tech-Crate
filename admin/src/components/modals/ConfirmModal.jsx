import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Action'}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{message || 'Are you sure you want to proceed with this destructive action?'}</span>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Proceed
          </Button>
        </div>
      </div>
    </Modal>
  );
}
