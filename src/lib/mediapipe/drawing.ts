
import { DrawingUtils, GestureRecognizer } from "@mediapipe/tasks-vision";
import { Landmark } from "@/types/mediapipe";

// Helper function to ensure landmarks have visibility property
const ensureVisibility = (landmark: Landmark): Required<Landmark> => ({
  ...landmark,
  visibility: landmark.visibility ?? 1.0
});

export const drawHandLandmarks = (
  canvas: HTMLCanvasElement,
  landmarksArray: Landmark[][]
): void => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const drawingUtils = new DrawingUtils(ctx);
  
  landmarksArray.forEach((landmarks) => {
    const normalizedLandmarks = landmarks.map(ensureVisibility);
    
    // Draw connections with futuristic cyan glow
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 3;
    drawingUtils.drawConnectors(normalizedLandmarks, GestureRecognizer.HAND_CONNECTIONS, {
      color: "#00ffff",
      lineWidth: 1,
    });
    
    // Draw small glowing dots
    ctx.shadowBlur = 5;
    drawingUtils.drawLandmarks(normalizedLandmarks, { 
      color: "#00ffff", 
      lineWidth: 0.5,
      radius: 1
    });
    
    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  });
};

export const drawFaceMeshLandmarks = (
  canvas: HTMLCanvasElement,
  faceDetections: any
): void => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (!faceDetections.faceLandmarks || faceDetections.faceLandmarks.length === 0)
    return;

  const landmarks = faceDetections.faceLandmarks[0];
  if (!landmarks || landmarks.length === 0) return;

  // Draw face tracking grid
  ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
  ctx.lineWidth = 0.5;
  
  // Create face bounding box
  const minX = Math.min(...landmarks.map((l: Landmark) => l.x)) * canvas.width;
  const maxX = Math.max(...landmarks.map((l: Landmark) => l.x)) * canvas.width;
  const minY = Math.min(...landmarks.map((l: Landmark) => l.y)) * canvas.height;
  const maxY = Math.max(...landmarks.map((l: Landmark) => l.y)) * canvas.height;
  
  // Draw grid lines within face bounds
  const gridSpacing = 20;
  for (let x = minX; x <= maxX; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, minY);
    ctx.lineTo(x, maxY);
    ctx.stroke();
  }
  for (let y = minY; y <= maxY; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(minX, y);
    ctx.lineTo(maxX, y);
    ctx.stroke();
  }

  // Draw face outline
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 1;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 2;
  ctx.strokeRect(minX - 5, minY - 5, maxX - minX + 10, maxY - minY + 10);

  // Draw key facial points with smaller dots
  landmarks.forEach((landmark: Landmark, index: number) => {
    const x = landmark.x * canvas.width;
    const y = landmark.y * canvas.height;
    
    ctx.beginPath();
    ctx.shadowBlur = 3;
    
    // Different colors for different facial features
    if (index >= 468 && index < 478) { // Iris points
      ctx.fillStyle = "#ff0080";
      ctx.shadowColor = "#ff0080";
      ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
    } else if (index >= 0 && index < 17) { // Face contour
      ctx.fillStyle = "#00ffff";
      ctx.shadowColor = "#00ffff";
      ctx.arc(x, y, 0.8, 0, 2 * Math.PI);
    } else {
      // Skip most interior points for cleaner look
      return;
    }
    
    ctx.fill();
  });
  
  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
};

export const drawPoseLandmarkers = (
  canvas: HTMLCanvasElement,
  poseLandmarks: Landmark[][]
): void => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  poseLandmarks.forEach((landmarks) => {
    // Draw pose connections
    const connections = [
      [11, 12], // Shoulders
      [11, 13], [13, 15], // Left arm
      [12, 14], [14, 16], // Right arm
      [11, 23], [12, 24], // Torso
      [23, 24], // Hip line
    ];

    ctx.strokeStyle = "#00ff80";
    ctx.lineWidth = 1;
    ctx.shadowColor = "#00ff80";
    ctx.shadowBlur = 2;

    connections.forEach(([start, end]) => {
      if (landmarks[start] && landmarks[end]) {
        ctx.beginPath();
        ctx.moveTo(landmarks[start].x * canvas.width, landmarks[start].y * canvas.height);
        ctx.lineTo(landmarks[end].x * canvas.width, landmarks[end].y * canvas.height);
        ctx.stroke();
      }
    });

    // Draw key pose points with small glowing dots
    landmarks.forEach((landmark, index) => {
      // Only draw important pose points
      const importantPoints = [0, 11, 12, 13, 14, 15, 16, 23, 24]; // Head, shoulders, arms, hips
      if (!importantPoints.includes(index)) return;

      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;
      
      ctx.beginPath();
      ctx.fillStyle = index === 0 ? "#ff0080" : "#00ff80"; // Head in pink, body in green
      ctx.shadowColor = index === 0 ? "#ff0080" : "#00ff80";
      ctx.shadowBlur = 4;
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  });
};
