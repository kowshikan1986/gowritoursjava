import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const EditorContainer = styled.div`
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.6rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const ToolButton = styled.button`
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 6px;
  padding: 0.35rem 0.6rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
  color: #374151;

  &:hover {
    background: #eef2ff;
    border-color: #c7d2fe;
    color: #4338ca;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const EditorSurface = styled.div`
  min-height: 240px;
  max-height: 480px;
  overflow-y: auto;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.6;
  color: #1f2937;
  outline: none;
  white-space: pre-wrap;

  h1, h2, h3, h4, h5, h6 { margin: 0.75rem 0 0.35rem; font-weight: 700; }
  p { margin: 0 0 0.65rem; }
  ul, ol { margin: 0 0 0.65rem 1.25rem; }
  strong { font-weight: 700; }
  em { font-style: italic; }
  u { text-decoration: underline; }
  img { max-width: 100%; height: auto; border-radius: 8px; margin: 0.5rem 0; }
`;

const Placeholder = styled.div`
  position: absolute;
  color: #9ca3af;
  pointer-events: none;
  padding: 1rem;
`;

const SurfaceWrapper = styled.div`
  position: relative;
`;

const RichTextEditor = ({ value = '', onChange, placeholder = 'Start typing…' }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Keep DOM in sync when external value changes
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const runCommand = (cmd, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange?.(editorRef.current?.innerHTML || '');
  };

  const handleInput = () => {
    onChange?.(editorRef.current?.innerHTML || '');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.path;
        editorRef.current?.focus();
        document.execCommand('insertImage', false, imageUrl);
        onChange?.(editorRef.current?.innerHTML || '');
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isEmpty = !value || value === '<br>' || value === '<div><br></div>';

  return (
    <EditorContainer>
      <Toolbar>
        <ToolButton type="button" onClick={() => runCommand('bold')}><strong>B</strong></ToolButton>
        <ToolButton type="button" onClick={() => runCommand('italic')}><em>I</em></ToolButton>
        <ToolButton type="button" onClick={() => runCommand('underline')}><u>U</u></ToolButton>
        <ToolButton type="button" onClick={() => runCommand('insertUnorderedList')}>• List</ToolButton>
        <ToolButton type="button" onClick={() => runCommand('insertOrderedList')}>1. List</ToolButton>
        <ToolButton type="button" onClick={() => runCommand('formatBlock', 'h3')}>H3</ToolButton>
        <ToolButton type="button" onClick={() => runCommand('formatBlock', 'h4')}>H4</ToolButton>
        <ToolButton type="button" onClick={() => runCommand('justifyLeft')} title="Align Left">⬛◻◻</ToolButton>
        <ToolButton type="button" onClick={() => runCommand('justifyCenter')} title="Align Center">◻⬛◻</ToolButton>
        <ToolButton type="button" onClick={() => runCommand('justifyRight')} title="Align Right">◻◻⬛</ToolButton>
        <ToolButton type="button" onClick={() => runCommand('justifyFull')} title="Justify">≡</ToolButton>
        <ToolButton type="button" onClick={() => {
          const url = window.prompt('Enter link URL');
          if (url) runCommand('createLink', url);
        }}>Link</ToolButton>
        <ToolButton type="button" onClick={() => {
          const url = window.prompt('Enter image URL');
          if (url) runCommand('insertImage', url);
        }}>URL Image</ToolButton>
        <ToolButton 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload image from your computer"
        >
          {uploading ? '⏳' : '📷'} Upload
        </ToolButton>
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </Toolbar>

      <SurfaceWrapper>
        {!isFocused && isEmpty && <Placeholder>{placeholder}</Placeholder>}
        <EditorSurface
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </SurfaceWrapper>
    </EditorContainer>
  );
};

export default RichTextEditor;
