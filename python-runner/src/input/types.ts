export type InputEventType =
  | 'keydown'
  | 'keyup'
  | 'keypress'
  | 'mousedown'
  | 'mouseup'
  | 'mousemove'
  | 'wheel';

export interface InputEventDTO {
  type: InputEventType;
  key?: string;
  code?: string;
  keyCode?: number;
  button?: number;
  x?: number;
  y?: number;
  relX?: number;
  relY?: number;
  deltaX?: number;
  deltaY?: number;
  modifiers?: {
    shift?: boolean;
    alt?: boolean;
    ctrl?: boolean;
    meta?: boolean;
  };
  timestamp?: number;
  seq?: number;
}
