import React from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from './button';
import Image from 'next/image';

interface FileUploadProps {
  id: string;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  preview?: string | null;
  uploadText: string;
  chooseText: string;
  supportedFormats: string;
  maxSize: string;
  showUploadButton?: boolean;
  uploadButtonText?: string;
  isUploading?: boolean;
  error?: string;
  imageType: 'profile' | 'organization';
}

export function FileUpload({
  id,
  accept,
  onChange,
  onUpload,
  onRemove,
  disabled = false,
  preview,
  uploadText,
  chooseText,
  supportedFormats,
  maxSize,
  showUploadButton = false,
  uploadButtonText = 'Upload',
  isUploading = false,
  error,
  imageType,
}: FileUploadProps) {
  const imageSize = imageType === 'profile' 
    ? { width: 128, height: 128, containerClass: 'w-32 h-32' }
    : { width: 96, height: 80, containerClass: 'w-24 h-20' };

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="relative mx-auto" style={{ width: 'fit-content' }}>
          <div className={`relative ${imageSize.containerClass} flex items-center justify-center overflow-hidden`}>
            <Image
              src={preview}
              alt={`${imageType} preview`}
              width={imageSize.width}
              height={imageSize.height}
              className="rounded-lg object-cover border border-border/50 w-full h-full"
            />
          </div>
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 cursor-pointer hover:bg-red-600 hover:scale-110 transition-all duration-200"
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {showUploadButton && onUpload && (
          <Button
            type="button"
            onClick={onUpload}
            className="w-full"
            disabled={disabled || isUploading}
          >
            {isUploading ? 'Uploading...' : uploadButtonText}
          </Button>
        )}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-border/80 transition-colors">
        <div className="text-center">
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <div className="mt-2">
            <label htmlFor={id} className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-foreground">
                {uploadText}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {chooseText}
              </span>
            </label>
            <input
              id={id}
              type="file"
              accept={accept}
              onChange={onChange}
              disabled={disabled}
              className="sr-only"
            />
          </div>
        </div>
      </div>
      
      {!preview && (
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(id)?.click()}
          className="w-full"
          disabled={disabled}
        >
          {chooseText.split(' ').slice(0, 2).join(' ')}
        </Button>
      )}
      
      <p className="text-xs text-muted-foreground">
        {supportedFormats}. Max size: {maxSize}
      </p>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
} 