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
      className={`relative flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 transition-colors ${
        isRecording ? 'bg-red-100 text-red-600 border-red-300' : 'text-blue-500 hover:bg-blue-50'
      } ${isDisabled ? 'cursor-not-allowed opacity-60 hover:bg-transparent' : ''}`}
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={label}
      aria-pressed={isRecording}
      title={label}
      {...rest}
    >
      <i className={`fas fa-microphone${isRecording ? '' : '-alt'} text-lg`}></i>
      {isRecording ? (
        <>
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500"></span>
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500/40 animate-ping"></span>
        </>
      ) : null}
      {isRecording ? <span className="sr-only">停止语音输入</span> : <span className="sr-only">开始语音输入</span>}
    </button>
  );
}
