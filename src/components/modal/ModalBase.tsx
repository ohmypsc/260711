import "./modal.scss";

interface ModalBaseProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalBase({ onClose, children }: ModalBaseProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
