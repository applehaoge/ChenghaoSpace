export type VisualizationPixelFormat = 'RGB';

export interface VisualizationFramePayload {
  type: 'frame';
  width: number;
  height: number;
  format: VisualizationPixelFormat;
  data: string; // base64 encoded pixel buffer
  timestamp?: number;
}
