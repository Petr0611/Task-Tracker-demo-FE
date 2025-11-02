import { createPortal } from "react-dom";
import { useEffect, type MouseEvent } from "react";
import type { TaskAttachment } from "../types";
import {
  getAttachmentDisplayName,
  getAttachmentUrl,
} from "../utils/attachments";

interface TaskAttachmentPreviewModalProps {
  attachment: TaskAttachment;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskAttachmentPreviewModal({
  attachment,
  isOpen,
  onClose,
}: TaskAttachmentPreviewModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const attachmentUrl = getAttachmentUrl(attachment);
  const attachmentName = getAttachmentDisplayName(attachment);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Attachment</h2>
            <p className="text-sm text-gray-500">{attachmentName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="Close attachment preview"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-auto bg-gray-50">
          {attachmentUrl ? (
            <img
              src={attachmentUrl}
              alt={attachmentName}
              className="mx-auto h-full max-h-[80vh] w-full max-w-full object-contain"
            />
          ) : (
            <div className="flex h-full min-h-[50vh] items-center justify-center px-6 py-10 text-center text-sm text-gray-600">
              We couldn't display this attachment. Try downloading it via the link below
            </div>
          )}
        </div>

        {!attachmentUrl && (
          <div className="border-t border-gray-200 bg-white px-6 py-4 text-sm text-gray-600">
            <a
              href={attachment.url ?? attachment.previewUrl ?? attachment.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline hover:text-blue-700"
            >
              Open attachment in a new tab
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}