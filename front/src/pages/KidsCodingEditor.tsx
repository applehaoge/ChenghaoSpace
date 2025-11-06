import { KidsCodingEditorPage, KidsCodingProvider } from '@/features/kidsCoding';

export default function KidsCodingEditor() {
  return (
    <KidsCodingProvider>
      <KidsCodingEditorPage />
    </KidsCodingProvider>
  );
}
