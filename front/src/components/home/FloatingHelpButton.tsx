import { toast } from 'sonner';

export type FloatingHelpButtonProps = {
  show?: boolean;
};

export function FloatingHelpButton({ show = true }: FloatingHelpButtonProps) {
  const handleHelpClick = () => {
    toast.info('客服团队将很快与您联系');
  };

  if (!show) return null;

  return (
    <button
      className="fixed bottom-7 right-7 w-[54px] h-[54px] rounded-full border-2 border-white bg-gradient-to-r from-blue-400 to-indigo-400 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-10"
      onClick={handleHelpClick}
    >
      <i className="fas fa-headset text-lg"></i>
    </button>
  );
}
