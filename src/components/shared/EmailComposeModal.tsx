import React from 'react';
import { Mail, X } from 'lucide-react';

interface EmailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  subject: string;
}

export default function EmailComposeModal({ isOpen, onClose, email, subject }: EmailComposeModalProps) {
  if (!isOpen) return null;

  const encodedSubject = encodeURIComponent(subject);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-gray-800 font-medium text-sm">Choose email provider</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex flex-col p-2">
          {/* Outlook */}
          <a 
            href={`https://outlook.live.com/mail/0/deeplink/compose?to=${email}&subject=${encodedSubject}`} 
            target="_blank" 
            rel="noreferrer" 
            onClick={onClose}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <path fill="#0078D4" d="M11.602 4.4L11.602 4.4C11.602 4.4 3.003 5.6 3.003 5.6C3.003 5.6 3 17.5 3 17.5C3 17.5 11.602 18.9 11.602 18.9C11.602 18.9 11.602 4.4 11.602 4.4ZM11.602 4.4"/>
                <path fill="#28A8EA" d="M21 5.4H11.602V18.9H21V5.4Z"/>
                <path fill="#FFF" d="M7.7 14.5C7.3 14.5 7 14.3 6.7 14.1C6.4 13.8 6.3 13.5 6.3 13.1C6.3 12.6 6.4 12.3 6.7 12C7 11.8 7.3 11.6 7.7 11.6C8.1 11.6 8.5 11.8 8.7 12C9 12.3 9.1 12.6 9.1 13.1C9.1 13.5 9 13.8 8.7 14.1C8.5 14.3 8.1 14.5 7.7 14.5ZM7.7 12.3C7.6 12.3 7.4 12.4 7.3 12.5C7.2 12.6 7.2 12.8 7.2 13.1C7.2 13.3 7.2 13.5 7.3 13.6C7.4 13.7 7.6 13.8 7.7 13.8C7.9 13.8 8 13.7 8.1 13.6C8.2 13.5 8.3 13.3 8.3 13.1C8.3 12.8 8.2 12.6 8.1 12.5C8 12.4 7.9 12.3 7.7 12.3ZM10.5 11.7L9.8 11.7V14.4H10.5V11.7Z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 font-medium text-sm">Outlook.com</span>
              <span className="text-gray-500 text-xs">Outlook.com, Live.com, Hotmail</span>
            </div>
          </a>

          {/* Google */}
          <a 
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodedSubject}`} 
            target="_blank" 
            rel="noreferrer" 
            onClick={onClose}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 48 48" className="w-7 h-7">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 font-medium text-sm">Google</span>
            </div>
          </a>

          {/* Default Mail */}
          <a 
            href={`mailto:${email}?subject=${encodedSubject}`} 
            onClick={onClose}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-gray-800" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 font-medium text-sm">Default mail app</span>
              <span className="text-gray-500 text-xs">Mac Mail, Windows Mail</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
