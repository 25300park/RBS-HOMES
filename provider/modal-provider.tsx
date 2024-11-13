"use client";

import { useModalStore } from "@/store/use-modal-store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import AuthModal from "@/components/modals/auth-modal";
import FilterModal from "@/components/modals/filter-modal";
import PreviewModal from "@/components/modals/preview-modal";
import ScheduleModal from "@/components/modals/schedule-modal";
import EditPasswordModal from "@/components/modals/edit-password-modal";
import { useState, useEffect } from "react";

export const ModalProvider = () => {
  const { isOpen, modalType, modalProps, closeModal } = useModalStore();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [drawerHeight, setDrawerHeight] = useState("85vh");

  if (!isOpen) return null;

  let content;
  switch (modalType) {
    case "login":
    case "signup":
      content = <AuthModal onClose={closeModal} />;
      break;
    case "filter":
      content = <FilterModal onClose={closeModal} modalProps={modalProps} />;
      break;
    case "preview":
      content = <PreviewModal modalProps={modalProps} onClose={closeModal} />;
      break;
    case "schedule":
      content = <ScheduleModal modalProps={modalProps} onClose={closeModal} />;
      break;
    case "editPassword":
      content = <EditPasswordModal onClose={closeModal} />;
      break;
    default:
      return null;
  }

  if (isDesktop || modalType === "login" || modalType === "signup") {
    return (
      <Dialog open={isOpen} onOpenChange={closeModal}>
        <DialogTitle></DialogTitle>
        <DialogContent className="sm:max-w-[500px]">{content}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={closeModal}>
      <DrawerContent
        className="overscroll-contain scrollbar-none"
        style={{ height: drawerHeight }}
      >
        {content}
      </DrawerContent>
    </Drawer>
  );
};
