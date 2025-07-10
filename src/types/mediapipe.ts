
export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface TranscriptionChunk {
  transcription: string;
  timestamp: string;
  device: string;
  is_input: boolean;
  is_final: boolean;
}

export interface MediaPipeAnalysis {
  handPresence: boolean;
  facePresence: boolean;
  posePresence: boolean;
  handDetectionCounter: number;
  handDetectionDuration: number;
  notFacingCounter: number;
  notFacingDuration: number;
  badPostureDetectionCounter: number;
  badPostureDuration: number;
}
