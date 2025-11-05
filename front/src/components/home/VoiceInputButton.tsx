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

  const baseClasses =
    'group relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 active:translate-y-px';
  const interactiveIdleClasses =
    'border border-blue-100 shadow-sm hover:border-rose-200 hover:shadow-md';
  const disabledIdleClasses =
    'border border-gray-200 shadow-none cursor-not-allowed opacity-60';
  const recordingClasses = 'border border-rose-300 shadow-md focus:ring-rose-200';

  const iconBaseClasses = `fas ${isRecording ? 'fa-microphone' : 'fa-microphone-alt'} text-lg transition-all`;
  const idleIconClasses =
    'bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 bg-clip-text text-transparent group-hover:from-orange-400 group-hover:via-pink-500 group-hover:to-rose-500';
  const recordingIconClasses =
    'bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 bg-clip-text text-transparent';
  const disabledIconClasses = 'text-gray-300';
  const iconClasses = isRecording
    ? recordingIconClasses
    : isDisabled
      ? disabledIconClasses
      : idleIconClasses;

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
      className={`${baseClasses} ${
        isRecording ? recordingClasses : isDisabled ? disabledIdleClasses : interactiveIdleClasses
      }`}
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={label}
      aria-pressed={isRecording}
      title={label}
      {...rest}
    >
      <i className={`${iconBaseClasses} ${iconClasses}`}></i>
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
