import type { ReactNode } from "react";
import BaseModal from "@/shared/components/ui/BaseModal";
import { btnPrimary } from "@/styles/buttonStyles";

type HeaderActionModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  loading: boolean;
  onConfirm: () => void;
  children: ReactNode;
};

export default function HeaderActionModal({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  loading,
  onConfirm,
  children,
}: HeaderActionModalProps) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={btnPrimary}
          >
            {loading ? `${confirmLabel}...` : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="mb-4 text-sm text-gray-500">{description}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </BaseModal>
  );
}
