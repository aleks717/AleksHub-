import React, { useMemo } from 'react';

export const RobloxTopoBackground: React.FC = () => {
  // 1:1 Vector Topographic Terrain Mesh replicating Roblox Robux Page header (IMG_0370.jpeg)
  // Re-creates the exact elevation contours and warped isometric wireframe grid behind "Sichere dir bis zu 25% mehr Robux"

  const { horizontalPaths, verticalPaths } = useMemo(() => {
    const width = 1920;
    const height = 440;
    const cols = 42; // Number of vertical longitudinal lines (~45px spacing)
    const rows = 18; // Number of horizontal latitude contour lines (~25px spacing)

    // 3D elevation field H(x, y) matching the exact topography in Roblox screenshot
    const getElevation = (x: number, y: number) => {
      // Primary peak: Centered above/behind "Sichere dir" (center-left of main header)
      const dx1 = (x - 940) / 260;
      const dy1 = (y - 85) / 130;
      const peak1 = 92 * Math.exp(-(dx1 * dx1 + dy1 * dy1));

      // Secondary ridge: Flowing up towards top-right (behind the Robux Senden pill)
      const dx2 = (x - 1480) / 360;
      const dy2 = (y - 50) / 140;
      const peak2 = 48 * Math.exp(-(dx2 * dx2 + dy2 * dy2));

      // Tertiary gentle contour: Left flank towards sidebar
      const dx3 = (x - 420) / 320;
      const dy3 = (y - 140) / 150;
      const peak3 = 28 * Math.exp(-(dx3 * dx3 + dy3 * dy3));

      // Saddle valley dip between left flank and center peak
      const dx4 = (x - 660) / 180;
      const dy4 = (y - 120) / 110;
      const dip1 = -22 * Math.exp(-(dx4 * dx4 + dy4 * dy4));

      // Micro-terrace wave for organic topological realism
      const wave = Math.sin(x * 0.004 + y * 0.006) * 6;

      return peak1 + peak2 + peak3 + dip1 + wave;
    };

    // 3D perspective projection
    const project = (gx: number, gy: number): [number, number] => {
      const z = getElevation(gx, gy);
      // Perspective shift: height displaces point upward (-Z) and slightly along perspective angle
      const px = gx - z * 0.22;
      const py = gy - z * 0.88;
      return [px, py];
    };

    // Build smooth SVG Catmull-Rom cubic bezier spline through points
    const pointsToPath = (points: [number, number][]) => {
      if (points.length < 2) return '';
      let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1[0] + (p2[0] - p0[0]) / 5.5;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 5.5;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 5.5;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 5.5;

        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
      }
      return d;
    };

    // 1. Horizontal Contour Curves (Latitude lines)
    const hPaths: string[] = [];
    const yStep = (height + 80) / rows;
    for (let r = 0; r <= rows; r++) {
      const gy = -40 + r * yStep;
      const pts: [number, number][] = [];
      const samples = 70;
      for (let s = 0; s <= samples; s++) {
        const gx = -120 + (s / samples) * (width + 240);
        pts.push(project(gx, gy));
      }
      hPaths.push(pointsToPath(pts));
    }

    // 2. Vertical Longitudinal Curves (Longitude lines)
    const vPaths: string[] = [];
    const xStep = (width + 240) / cols;
    for (let c = 0; c <= cols; c++) {
      const gx = -120 + c * xStep;
      const pts: [number, number][] = [];
      const samples = 45;
      for (let s = 0; s <= samples; s++) {
        const gy = -40 + (s / samples) * (height + 80);
        pts.push(project(gx, gy));
      }
      vPaths.push(pointsToPath(pts));
    }

    return { horizontalPaths: hPaths, verticalPaths: vPaths };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-[440px] pointer-events-none overflow-hidden select-none z-0">
      <svg
        className="w-full h-full text-[#CBD2DB] dark:text-[#282C32]"
        viewBox="0 0 1920 440"
        preserveAspectRatio="xMidYMin slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
      >
        <defs>
          {/* Vertical fade to blend smoothly into page background */}
          <linearGradient id="robloxTopoGradV" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="60%" stopColor="currentColor" stopOpacity="0.85" />
            <stop offset="85%" stopColor="currentColor" stopOpacity="0.45" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
          </linearGradient>

          {/* Horizontal soft blend */}
          <linearGradient id="robloxTopoGradH" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="8%" stopColor="white" stopOpacity="1.0" />
            <stop offset="92%" stopColor="white" stopOpacity="1.0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.3" />
          </linearGradient>

          <mask id="robloxTopoMask">
            <rect x="0" y="0" width="1920" height="440" fill="url(#robloxTopoGradH)" />
          </mask>
        </defs>

        <g
          stroke="url(#robloxTopoGradV)"
          strokeWidth="1.0"
          strokeLinecap="round"
          strokeLinejoin="round"
          mask="url(#robloxTopoMask)"
        >
          {/* Vertical longitudinal grid curves */}
          {verticalPaths.map((d, index) => (
            <path key={`v-${index}`} d={d} />
          ))}

          {/* Horizontal elevation contour curves */}
          {horizontalPaths.map((d, index) => (
            <path key={`h-${index}`} d={d} />
          ))}
        </g>
      </svg>
    </div>
  );
};

