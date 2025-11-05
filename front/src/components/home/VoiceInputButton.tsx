import type { ButtonHTMLAttributes } from 'react';

type VoiceInputButtonProps = {
  status: 'idle' | 'recording' | 'unsupported' | 'error';
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

export function VoiceInputButton({
  status,
  onStart,
  onStop,
  disabled,
  ...rest
}: VoiceInputButtonProps) {
  const isRecording = status === 'recording';
  const isSupported = status !== 'unsupported';
  const isDisabled = disabled || !isSupported;

  const handleClick = () => {
    if (isDisabled) return;
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  };

  const label = !isSupported
    ? '浏览器不支持语音输入'
    : isRecording
      ? '点击停止语音输入'
      : '点击开始语音输入';

  return (
    <button
      type="button"
      className={`flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 transition-colors ${
        isRecording ? 'bg-red-50 text-red-500 border-red-200' : 'text-blue-500 hover:bg-blue-50'
      } ${isDisabled ? 'cursor-not-allowed opacity-60 hover:bg-transparent' : ''}`}
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={label}
      title={label}
      {...rest}
    >
      <i className={`fas fa-microphone${isRecording ? '' : '-alt'}`}></i>
      {isRecording ? <span className="sr-only">停止语音输入</span> : <span className="sr-only">开始语音输入</span>}
    </button>
  );
}
