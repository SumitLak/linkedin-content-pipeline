'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import data from '@emoji-mart/data';
import { Smile } from 'lucide-react';

// Dynamically import to avoid SSR issues
const Picker = dynamic(() => import('@emoji-mart/react').then(m => m.default as any), { ssr: false });

interface EmojiPickerButtonProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsert: (newValue: string, newCursorPos: number) => void;
}

export default function EmojiPickerButton({ textareaRef, onInsert }: EmojiPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleEmojiSelect = useCallback((emoji: { native: string }) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const newValue = ta.value.slice(0, start) + emoji.native + ta.value.slice(end);
    const newCursor = start + emoji.native.length;
    onInsert(newValue, newCursor);
    // Restore focus + cursor after state update
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newCursor, newCursor);
    });
    setOpen(false);
  }, [textareaRef, onInsert]);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        title="Insert emoji"
      >
        <Smile className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-1 z-[9999]">
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="light"
            set="native"
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      )}
    </div>
  );
}
