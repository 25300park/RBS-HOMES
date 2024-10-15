'use client'

import { useModalStore } from "@/store/use-modal-store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AuthModal from "@/components/modals/auth-modal";
import FilterModal from "@/components/modals/filter-modal";
import PreviewModal from "@/components/modals/preview-modal";
// import ConfirmModal from "@/components/modals/ConfirmModal";
// import AlertModal from "@/components/modals/AlertModal";

export const ModalProvider = () => {
  const { isOpen, modalType, modalProps, closeModal } = useModalStore();
  if (!isOpen) return null;
  let content;
  switch (modalType) {
    case 'login':
    case 'signup':
      content = <AuthModal onClose={closeModal} />;
      break;
    case 'filter':
      content = <FilterModal onClose={closeModal} modalProps={modalProps}/>;
      break;
    case 'preview':
      content = <PreviewModal modalProps={modalProps} onClose={closeModal} />;
      break;
    default:
      return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogTitle></DialogTitle>
      <DialogContent className="" >
        {content}
      </DialogContent>
    </Dialog>
  );
};
