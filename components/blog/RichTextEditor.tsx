"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote, Image as ImageIcon } from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: () => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, onImageUpload, placeholder = "Write your anime review..." }: RichTextEditorProps) {
  // Initialize editor with null content first
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 text-gray-100',
      },
    },
    immediatelyRender: false,
  });

  // Update content when it changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return <div className="bg-gray-700 rounded-lg h-64 animate-pulse"></div>;
  }

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-700">
      <div className="flex items-center gap-1 p-3 bg-gray-800 border-b border-gray-600">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive('bold') ? 'bg-purple-600 text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive('italic') ? 'bg-purple-600 text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive('bulletList') ? 'bg-purple-600 text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive('orderedList') ? 'bg-purple-600 text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <ListOrdered size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive('blockquote') ? 'bg-purple-600 text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <Quote size={18} />
        </button>
        {onImageUpload && (
          <button 
            onClick={onImageUpload} 
            type="button"
            className="p-2 rounded hover:bg-gray-700 transition-colors text-gray-300"
          >
            <ImageIcon size={18} />
          </button>
        )}
      </div>
      <EditorContent editor={editor} className="text-gray-100 bg-gray-700 [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:p-4 [&_.ProseMirror]:focus:outline-none" />
    </div>
  );
}