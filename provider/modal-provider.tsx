'use client'

import { useModalStore } from "@/store/use-modal-store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AuthModal from "@/components/modals/auth-modal";
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
    // case 'confirm':
    //   content = <ConfirmModal onClose={closeModal} />;
    //   break;
    // case 'alert':
    //   content = <AlertModal message={modalProps.message || "Something happened!"} onClose={closeModal} />;
    //   break;
    default:
      return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogTitle></DialogTitle>
      <DialogContent className="sm:max-w-[1024px]" >
        {content}
      </DialogContent>
    </Dialog>
  );
};
