import type { TaskAttachment } from "../types";

export const getAttachmentUrl = (
  attachment: TaskAttachment
): string | undefined => {
  return (
    attachment.url ??
    attachment.previewUrl ??
    attachment.fileUrl ??
    undefined
  );
};

export const getAttachmentDisplayName = (
  attachment: TaskAttachment
): string => {
  return (
    attachment.fileName ??
    attachment.originalFileName ??
    attachment.url ??
    attachment.id
  );
};