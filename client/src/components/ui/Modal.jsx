import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { fadeIn, fadeOut } from "../../utils/animations";

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  className = "",
  ...props
}) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full",
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      // Animate in
      if (modalRef.current) fadeIn(modalRef.current, 0.1);
      if (overlayRef.current) fadeIn(overlayRef.current, 0);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleClose = async () => {
    // Animate out
    if (modalRef.current) await fadeOut(modalRef.current, 0).then();
    if (overlayRef.current) await fadeOut(overlayRef.current, 0.1).then();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm opacity-0"
        onClick={handleClose}
      />
      <div
        ref={modalRef}
        className={`relative z-50 w-full ${sizeClasses[size]} rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900 opacity-0 ${className}`}
        {...props}
      >
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          )}
          <button
            onClick={handleClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
