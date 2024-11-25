import { useState, useEffect } from 'react';
import { BlobFile } from '../types';
import { Loader2 } from 'lucide-react';

interface FileEditorProps {
  file: BlobFile | null;
  content: string;
  onSave: (content: string) => void;
  isLoading?: boolean;
}

const ZERO_WIDTH_SPACE = '\u200B';

export default function FileEditor({
  file,
  content,
  onSave,
  isLoading = false,
}: FileEditorProps) {
  const [editedContent, setEditedContent] = useState(content);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleSave = () => {
    const contentToSave =
      editedContent.trim() === '' ? ZERO_WIDTH_SPACE : editedContent;
    onSave(contentToSave);
  };

  if (!file) {
    return <div className="text-gray-500">Select a file to edit</div>;
  }

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-2">Editing: {file.pathname}</h2>
        <div className="w-full h-96 border rounded p-2 mb-2 flex items-center justify-center bg-muted/50">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Editing: {file.pathname}</h2>
      <textarea
        className="w-full h-96 border rounded p-2 mb-2 font-mono"
        value={editedContent}
        onChange={(e) => {
          setEditedContent(e.target.value);
        }}
      />
      <button
        className="bg-green-500 text-white rounded px-4 py-2"
        onClick={handleSave}
      >
        Save
      </button>
    </div>
  );
}
