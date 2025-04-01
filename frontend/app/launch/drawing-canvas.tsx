"use client";

import { useRef, useState, useEffect } from "react";
import {
  Pencil,
  Eraser,
  RefreshCw,
  RotateCcw,
  X,
  Check,
  Paintbrush,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DrawingCanvasProps {
  onImageCreated: (imageBlob: Blob) => void;
  onCancel: () => void;
  stylizeWithAI: (image: Blob, prompt: string) => Promise<void>;
  tokenName?: string;
  isProcessing?: boolean;
}

type Tool = "brush" | "eraser";
type StyleOption =
  | "pixel"
  | "futuristic"
  | "ghibli"
  | "cute"
  | "abstract"
  | "neon";

export function DrawingCanvas({
  onImageCreated,
  onCancel,
  stylizeWithAI,
  tokenName = "",
  isProcessing = false,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#c9804a");
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>("pixel");
  const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match container width with 1:1 aspect ratio
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetWidth;

    // Fill canvas with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory([initialState]);
    setHistoryIndex(0);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Store the current image data
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const currentImageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Resize canvas
      const newWidth = canvas.offsetWidth;
      canvas.width = newWidth;
      canvas.height = newWidth;

      // Draw the stored image data back to the canvas with scaling
      ctx.putImageData(currentImageData, 0, 0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Drawing functions
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);

    // Set brush properties
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (currentTool === "brush") {
      ctx.strokeStyle = brushColor;
      ctx.globalCompositeOperation = "source-over";
    } else {
      // Eraser
      ctx.strokeStyle = "#ffffff";
      ctx.globalCompositeOperation = "destination-out";
    }

    ctx.beginPath();

    let x, y;
    if ("touches" in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx.moveTo(x, y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let x, y;
    if ("touches" in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);

    // Save the current state to history
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Remove any "redo" states
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    newHistory.push(currentState);

    setCanvasHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Prevent scrolling when drawing on touch devices
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventDefault, { passive: false });
    return () => {
      document.removeEventListener("touchmove", preventDefault);
    };
  }, [isDrawing]);

  // Handle undo
  const handleUndo = () => {
    if (historyIndex <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    ctx.putImageData(canvasHistory[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  // Handle redo
  const handleRedo = () => {
    if (historyIndex >= canvasHistory.length - 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newIndex = historyIndex + 1;
    ctx.putImageData(canvasHistory[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  // Handle clear canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save the cleared state to history
    const clearedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    newHistory.push(clearedState);

    setCanvasHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Handle saving the image
  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        onImageCreated(blob);
      }
    }, "image/png");
  };

  // Handle AI stylization
  const handleStylize = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Generate a style description based on the selected style and token name
      const stylePrompt = `${tokenName} logo in ${selectedStyle} art style. High quality, professional token logo.`;

      // Call the stylization function
      await stylizeWithAI(blob, stylePrompt);
    }, "image/png");
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-[#e0d6cf]">
          Draw Your Token Logo
        </h3>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative aspect-square w-full bg-white rounded-lg overflow-hidden border-2 border-[#2a2422]">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Drawing Tools */}
      <div className="flex flex-wrap justify-between items-center gap-2 bg-[#231f1c] p-3 rounded-lg">
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === "brush" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentTool("brush")}
                  className={currentTool === "brush" ? "bg-[#c9804a]" : ""}
                >
                  <Paintbrush className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Brush Tool</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === "eraser" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentTool("eraser")}
                  className={currentTool === "eraser" ? "bg-[#c9804a]" : ""}
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eraser Tool</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-8 mx-1" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRedo}
                  disabled={historyIndex >= canvasHistory.length - 1}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleClear}>
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear Canvas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center space-x-2">
          {/* Color Picker */}
          <div className="flex items-center">
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-8 h-8 rounded-md overflow-hidden cursor-pointer border border-[#2a2422]"
            />
          </div>

          {/* Brush Size */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#e0d6cf]">Size:</span>
            <input
              type="range"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-20 accent-[#c9804a]"
            />
          </div>
        </div>
      </div>

      {/* Style Selection and Action Buttons */}
      <div className="bg-[#231f1c] p-3 rounded-lg">
        <div className="mb-3">
          <label className="block text-sm font-medium text-[#e0d6cf] mb-2">
            AI Enhancement
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "pixel", label: "Pixel Art" },
              { id: "futuristic", label: "Futuristic" },
              { id: "ghibli", label: "Ghibli" },
              { id: "cute", label: "Cute" },
              { id: "abstract", label: "Abstract" },
              { id: "neon", label: "Neon" },
            ].map((style) => (
              <Button
                key={style.id}
                variant={selectedStyle === style.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStyle(style.id as StyleOption)}
                className={`text-xs ${
                  selectedStyle === style.id
                    ? "bg-[#c9804a] text-[#1c1917]"
                    : "border-[#2a2422] text-[#e0d6cf]"
                }`}
              >
                {style.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleSave}
            className="border-[#2a2422] text-[#e0d6cf] hover:bg-[#2a2422]"
          >
            <Save className="h-4 w-4 mr-2" />
            Use As Is
          </Button>
          <Button
            onClick={handleStylize}
            disabled={isProcessing}
            className="bg-[#c9804a] text-[#1c1917] hover:bg-[#b77440]"
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Enhance Drawing
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
