"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './button';
import { Slider } from './slider';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';

interface ProfilePictureUploadProps {
  id?: string;
  value?: string | null; // Current profile image URL
  onChange: (croppedImageBlob: Blob, croppedImageUrl: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

// Helper function to create image from URL
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// Helper function to get cropped image
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<{ blob: Blob; url: string }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const url = URL.createObjectURL(blob);
      resolve({ blob, url });
    }, 'image/jpeg', 0.95);
  });
}

export function ProfilePictureUpload({
  id = 'profile-picture-upload',
  value,
  onChange,
  onRemove,
  disabled = false,
  className = '',
}: ProfilePictureUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setIsEditMode(true);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleApplyCrop = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const { blob, url } = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      onChange(blob, url);
      setIsEditMode(false);
      setImageSrc(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      setError('Failed to crop image. Please try again.');
    }
  }, [imageSrc, croppedAreaPixels, onChange]);

  const handleCancel = useCallback(() => {
    setIsEditMode(false);
    setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setError(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove();
    }
    setImageSrc(null);
    setIsEditMode(false);
    setError(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onRemove]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Edit mode - show cropper
  if (isEditMode && imageSrc) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="relative w-full h-[400px] bg-muted rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Zoom Controls */}
        <div className="space-y-3 px-2">
          <div className="flex items-center gap-4 py-2">
            <button
              type="button"
              onClick={() => setZoom(Math.max(1, zoom - 0.1))}
              disabled={disabled || zoom <= 1}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5 text-foreground" />
            </button>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={1}
              max={3}
              step={0.05}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              disabled={disabled || zoom >= 3}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={disabled}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApplyCrop}
            disabled={disabled}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            Apply
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Drag to reposition • Use slider or buttons to zoom
        </p>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>
    );
  }

  // Display mode - show current image or upload prompt
  if (value) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="relative mx-auto w-32 h-32">
          <div className="relative w-full h-full rounded-full overflow-hidden bg-muted border-2 border-border">
            <Image
              src={value}
              alt="Profile picture"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0 shadow-lg border-2 border-background"
              disabled={disabled}
              title="Remove profile picture"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={triggerFileInput}
          disabled={disabled}
          className="w-full"
        >
          Change Picture
        </Button>

        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={disabled}
          className="sr-only"
        />

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>
    );
  }

  // Upload mode - no image selected
  return (
    <div className={`space-y-4 ${className}`}>
      <div 
        className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors cursor-pointer group"
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Click to upload profile picture</p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG or WebP (max. 5MB)
            </p>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={triggerFileInput}
        disabled={disabled}
        className="w-full"
      >
        Choose Picture
      </Button>

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled}
        className="sr-only"
      />

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}
