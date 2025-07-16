
import React from 'react';
import { highlightText } from '../utils/searchUtils';

interface SearchResultHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
}

export const SearchResultHighlight: React.FC<SearchResultHighlightProps> = ({
  text,
  searchTerm,
  className = ''
}) => {
  if (!searchTerm.trim()) {
    return <span className={className}>{text}</span>;
  }

  const highlightedText = highlightText(text, searchTerm);

  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: highlightedText }}
    />
  );
};
