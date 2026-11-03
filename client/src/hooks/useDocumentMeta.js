import { useEffect } from 'react';

// Sets the browser tab title and the page description (used by search engines).
export default function useDocumentMeta(title, description) {
  useEffect(() => {
    if (title) document.title = title;
    if (description !== undefined) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description || '');
    }
  }, [title, description]);
}