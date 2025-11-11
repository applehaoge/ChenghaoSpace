import { useMemo } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

type CodeEditorProps = {
  value: string;
  onChange: (nextValue: string) => void;
  language?: string;
  theme: string;
  fontSize: number;
  options?: editor.IStandaloneEditorConstructionOptions;
  onMount?: (editorInstance: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
};

export function CodeEditor({
  value,
  onChange,
  language = 'python',
  theme,
  fontSize,
  options,
  onMount,
}: CodeEditorProps) {
  const mergedOptions = useMemo<editor.IStandaloneEditorConstructionOptions>(
    () => ({
      fontSize,
      wordWrap: 'on',
      automaticLayout: true,
      smoothScrolling: true,
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      lineNumbersMinChars: 3,
      padding: { top: 0, bottom: 0 },
      renderLineHighlight: 'all',
      ...options,
    }),
    [fontSize, options],
  );

  return (
    <Editor
      value={value}
      language={language}
      theme={theme}
      onChange={next => onChange(next ?? '')}
      onMount={onMount}
      options={mergedOptions}
      height="100%"
      width="100%"
      loading={
        <div className="flex h-full items-center justify-center text-sm text-slate-500">加载编辑器...</div>
      }
    />
  );
}
