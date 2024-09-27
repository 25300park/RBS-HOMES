import React from 'react';
import Spinner from '@/components/ui/spinner';

interface SubmitButtonProps {
  isSubmitting: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  isSubmitting, 
  onClick, 
  label,
  disabled = false,
}) => {
  return (
    <button
      className={`bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 text-base rounded-md mt-6 w-46 md:w-auto flex items-center justify-center ${
        isSubmitting || disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={onClick}
      disabled={isSubmitting || disabled} 
    >
      {isSubmitting ? (
        <Spinner className="border-white h-6 w-6" />
      ) : (
        label
      )}
    </button>
  );
};
