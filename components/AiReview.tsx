
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface AiReviewProps {
  review: string;
}

// A simple markdown to HTML converter.
const renderMarkdown = (markdown: string) => {
    let html = markdown
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="bg-gray-700 text-yellow-300 rounded px-1 py-0.5 text-xs font-mono">$1</code>');

    // Handle lists and paragraphs
    const lines = html.split('\n');
    let inList = false;
    html = lines.map(line => {
        const trimmedLine = line.trim();
        const isListItem = trimmedLine.startsWith('- ');
        let output = '';

        if (isListItem && !inList) {
            inList = true;
            output += '<ul>';
        } else if (!isListItem && trimmedLine !== '' && inList) {
            inList = false;
            output += '</ul>';
        }

        if (isListItem) {
            output += `<li>${trimmedLine.substring(2)}</li>`;
        } else if (!inList && trimmedLine !== '') {
            output += `<p>${line}</p>`;
        } else if (trimmedLine === '' && inList) {
            inList = false;
            output += '</ul>';
        }
        
        return output;
    }).join('');

    if (inList) {
        html += '</ul>';
    }
    
    return { __html: html };
};

export const AiReview: React.FC<AiReviewProps> = ({ review }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 flex-grow flex flex-col">
      <div className="flex items-center gap-3 p-3 bg-gray-800 border-b border-gray-700">
        <SparklesIcon className="h-5 w-5 text-purple-400" />
        <h3 className="text-md font-semibold text-white">AI Review</h3>
      </div>
      <div className="p-4 overflow-y-auto text-gray-300 text-sm leading-relaxed">
         <div 
            className="prose prose-sm prose-invert max-w-none 
            prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-white
            prose-code:bg-gray-700 prose-code:text-yellow-300 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs prose-code:font-mono"
            dangerouslySetInnerHTML={renderMarkdown(review)}
        />
      </div>
    </div>
  );
};
