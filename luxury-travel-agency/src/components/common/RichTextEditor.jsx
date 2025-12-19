import React, { useState } from 'react';
import styled from 'styled-components';

const EditorContainer = styled.div`
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
`;

const Toolbar = styled.div`
  background: #f9fafb;
  border-bottom: 1px solid #d1d5db;
  padding: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ToolButton = styled.button`
  padding: 0.4rem 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
  }
  
  &.active {
    background: #6A1B82;
    color: white;
    border-color: #6A1B82;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  border: none;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
  }
`;

const Preview = styled.div`
  padding: 1rem;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  background: white;
  
  h1, h2, h3 { margin-top: 1rem; margin-bottom: 0.5rem; }
  p { margin-bottom: 0.5rem; }
  ul, ol { margin-left: 1.5rem; margin-bottom: 0.5rem; }
  img { max-width: 100%; border-radius: 8px; margin: 0.5rem 0; }
`;

const RichTextEditor = ({ value, onChange, placeholder = 'Write detailed description here...' }) => {
  const [mode, setMode] = useState('edit');

  const insertTag = (tag) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'text';
    
    let insertText = '';
    switch(tag) {
      case 'h1':
        insertText = `<h1>${selectedText}</h1>`;
        break;
      case 'h2':
        insertText = `<h2>${selectedText}</h2>`;
        break;
      case 'h3':
        insertText = `<h3>${selectedText}</h3>`;
        break;
      case 'bold':
        insertText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        insertText = `<em>${selectedText}</em>`;
        break;
      case 'ul':
        insertText = `<ul>\n  <li>${selectedText}</li>\n</ul>`;
        break;
      case 'ol':
        insertText = `<ol>\n  <li>${selectedText}</li>\n</ol>`;
        break;
      case 'link':
        insertText = `<a href="URL">${selectedText}</a>`;
        break;
      case 'image':
        insertText = `<img src="IMAGE_URL" alt="${selectedText}" />`;
        break;
      default:
        insertText = selectedText;
    }
    
    const newValue = value.substring(0, start) + insertText + value.substring(end);
    onChange(newValue);
  };

  return (
    <EditorContainer>
      <Toolbar>
        <ToolButton 
          type="button"
          className={mode === 'edit' ? 'active' : ''}
          onClick={() => setMode('edit')}
        >
          Edit HTML
        </ToolButton>
        <ToolButton 
          type="button"
          className={mode === 'preview' ? 'active' : ''}
          onClick={() => setMode('preview')}
        >
          Preview
        </ToolButton>
        <div style={{ borderLeft: '1px solid #d1d5db', height: '30px', margin: '0 0.5rem' }}></div>
        <ToolButton type="button" onClick={() => insertTag('h1')}>H1</ToolButton>
        <ToolButton type="button" onClick={() => insertTag('h2')}>H2</ToolButton>
        <ToolButton type="button" onClick={() => insertTag('h3')}>H3</ToolButton>
        <ToolButton type="button" onClick={() => insertTag('bold')}><strong>B</strong></ToolButton>
        <ToolButton type="button" onClick={() => insertTag('italic')}><em>I</em></ToolButton>
        <ToolButton type="button" onClick={() => insertTag('ul')}>• List</ToolButton>
        <ToolButton type="button" onClick={() => insertTag('ol')}>1. List</ToolButton>
        <ToolButton type="button" onClick={() => insertTag('link')}>Link</ToolButton>
        <ToolButton type="button" onClick={() => insertTag('image')}>Image</ToolButton>
      </Toolbar>
      
      {mode === 'edit' ? (
        <TextArea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <Preview dangerouslySetInnerHTML={{ __html: value || '<p style="color: #9ca3af;">No content yet. Switch to Edit mode to add content.</p>' }} />
      )}
    </EditorContainer>
  );
};

export default RichTextEditor;
