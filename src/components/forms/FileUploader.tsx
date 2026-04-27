// File: components/FileUploader.tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { X, Upload, ImageIcon, VideoIcon, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FileUploaderProps = {
  fieldChange: (url: string | null, file?: File) => void;
  mediaUrl: string | null;
  className?: string;
  label?: string;
  description?: string;
};

const FileUploader = ({ 
  fieldChange, 
  mediaUrl, 
  className,
  label = "Share with Corps Members...",
  description = "Drag photos/videos here or click to browse" 
}: FileUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Manage preview URL and cleanup
  useEffect(() => {
    let objectUrl: string | undefined;
    if (file) {
      objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else if (mediaUrl) {
      setPreviewUrl(mediaUrl);
    } else {
      setPreviewUrl("");
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file, mediaUrl]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setIsDragging(false);
      if (acceptedFiles.length === 0) return;
      const chosen = acceptedFiles[0];
      setFile(chosen);
      fieldChange(null, chosen);
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".gif", ".webp"],
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
    },
    multiple: false,
    noClick: true,
    onDragEnter: () => setIsDragging(true),
    onDragOver: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    setPreviewUrl("");
    fieldChange(null);
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <ImageIcon className="w-5 h-5" />;
    if (fileType.startsWith("image/")) return <ImageIcon className="w-5 h-5" />;
    if (fileType.startsWith("video/")) return <VideoIcon className="w-5 h-5" />;
    return <FileIcon className="w-5 h-5" />;
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl transition-all duration-200",
          "border-gray-300 dark:border-gray-700",
          "bg-white dark:bg-gray-900",
          "hover:border-primary hover:bg-primary/5",
          "cursor-pointer relative min-h-[200px]",
          isDragging && "border-primary bg-primary/10",
          previewUrl && "border-transparent"
        )}
      >
        <input {...getInputProps()} className="hidden" />

        {previewUrl ? (
          <div className="relative w-full h-full rounded-xl overflow-hidden group">
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 z-10" />
            
            {/* Preview */}
            <div className="flex flex-1 justify-center w-full p-4">
              {file && file.type.startsWith("video/") ? (
                <div className="relative w-full">
                  <video
                    controls
                    src={previewUrl}
                    className="h-[300px] lg:h-[400px] w-full rounded-lg object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                    <VideoIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
              ) : (
                <div className="relative w-full">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-[300px] lg:h-[400px] w-full rounded-lg object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                type="button"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-gray-900 shadow-md"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  open();
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="bg-red-500/90 hover:bg-red-600 text-white shadow-md"
                onClick={handleRemove}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              Click or drag to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 h-full">
            <div className={cn(
              "p-4 rounded-full mb-4 transition-all duration-200",
              isDragging ? "bg-primary/20" : "bg-gray-100 dark:bg-gray-800"
            )}>
              <Upload className={cn(
                "w-8 h-8 transition-all duration-200",
                isDragging ? "text-primary" : "text-gray-500 dark:text-gray-400"
              )} />
            </div>
            
            <div className="text-center max-w-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {label}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {description}
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">PNG, JPG, GIF</span>
                </div>
                <div className="flex items-center gap-2">
                  <VideoIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">MP4, MOV</span>
                </div>
              </div>

              <Button
                type="button"
                variant="default"
                className={cn(
                  "px-6 transition-all duration-200",
                  isDragging && "scale-105"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  open();
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select from device
              </Button>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                Or drag and drop files here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File info */}
      {file && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded">
              {getFileIcon(file.type)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-500"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;