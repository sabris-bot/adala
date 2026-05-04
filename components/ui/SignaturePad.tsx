
import React, { useRef, useEffect, useState } from 'react';
import Button from './Button';
import { PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '../../constants';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onCancel: () => void;
  title?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel, title = "التوقيع الإلكتروني" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Set canvas size based on parent container width, fixed height for consistency
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth - 20; // minor padding
        canvas.height = 200;
      }
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault(); // Prevent scrolling on touch
    setIsDrawing(true);
    const { x, y } = getCoordinates(event);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    event.preventDefault();
    const { x, y } = getCoordinates(event);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      if (!hasSignature) setHasSignature(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const saveSignature = () => {
    if (!hasSignature) {
        alert("يرجى التوقيع أولاً.");
        return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  return (
    <div className="bg-white dark:bg-dm-card border rounded-lg p-4 shadow-sm w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-dm-text flex items-center">
            <PencilIcon className="w-4 h-4 me-2 text-primary"/>
            {title}
        </h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <XCircleIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded bg-gray-50 dark:bg-gray-800 cursor-crosshair touch-none mb-3">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full"
        />
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={clearCanvas} leftIcon={<TrashIcon className="w-4 h-4"/>}>
            مسح
        </Button>
        <div className="space-x-2 space-x-reverse">
            <Button variant="ghost" size="sm" onClick={onCancel}>إلغاء</Button>
            <Button variant="primary" size="sm" onClick={saveSignature} disabled={!hasSignature} leftIcon={<CheckCircleIcon className="w-4 h-4"/>}>
                اعتماد التوقيع
            </Button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
