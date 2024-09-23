'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function SimpleTextEditor() {
  const editorRef = useRef<HTMLDivElement>(null); // contentEditable 영역에 대한 참조
  const [text, setText] = useState(''); // 에디터의 텍스트 상태

  // 텍스트 스타일링을 위한 명령어 실행 함수
  const execCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      document.execCommand(command, false, value || '');
      setText(editorRef.current.innerHTML); // 텍스트 상태를 업데이트
    }
  };

  // 텍스트가 변경되었을 때 상태 업데이트
  const handleInput = () => {
    if (editorRef.current) {
      setText(editorRef.current.innerHTML);
    }
    console.log(text)
  };

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        {/* Bold */}
        <Button onClick={() => execCommand('bold')} className="bg-gray-200">
          Bold
        </Button>

        {/* Underline */}
        <Button onClick={() => execCommand('underline')} className="bg-gray-200">
          Underline
        </Button>

        {/* Text Color (Red) */}
        <Button onClick={() => execCommand('foreColor', 'red')} className="bg-red-500 text-white">
          Text Color (Red)
        </Button>

        {/* Font Size (14px) */}
        <Button onClick={() => execCommand('fontSize', '4')} className="bg-gray-200">
          Font Size (14px)
        </Button>

        {/* Font Size (20px) */}
        <Button onClick={() => execCommand('fontSize', '5')} className="bg-gray-200">
          Font Size (20px)
        </Button>
      </div>

      {/* 에디터 영역 */}
      <div
        ref={editorRef}
        contentEditable
        className="border p-4 min-h-[200px] outline-none"
        style={{ whiteSpace: 'pre-wrap' }}
        onInput={handleInput} // onInput 이벤트 사용
        suppressContentEditableWarning={true} // 경고 억제
      >
        {/* 기본 텍스트 */}
        Start typing here...
      </div>

      {/* 텍스트 상태를 확인하기 위한 영역 */}
      <div className="mt-4">
        <h3 className="text-lg">Preview:</h3>
        <div dangerouslySetInnerHTML={{ __html: text }} />
      </div>
    </div>
  );
}
