import { create } from "zustand";

type ModalType = "login" | "signup" | "confirm" | "alert" | "filter" | 'preview' | 'schedule' | null;

interface ModalState {
  isOpen: boolean;
  modalType: ModalType;
  modalProps: any;
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: null,
  modalProps: null,
  openModal: (type, props = {}) =>
    set({ isOpen: true, modalType: type, modalProps: props }),
  closeModal: () => set({ isOpen: false, modalType: null, modalProps: null }), // 모달 타입 초기화
}));
