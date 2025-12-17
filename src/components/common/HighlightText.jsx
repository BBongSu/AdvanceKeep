import React from 'react';

/**
 * 텍스트에서 검색어와 일치하는 부분을 하이라이트하는 컴포넌트
 * @param {string} text - 원본 텍스트
 * @param {string} highlight - 검색어 (하이라이트할 텍스트)
 */
export const HighlightText = ({ text, highlight }) => {
    if (!highlight || !highlight.trim()) {
        return <>{text}</>;
    }

    // 정규식 특수문자 이스케이프 처리
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));

    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <span key={i} className="highlight">{part}</span>
                ) : (
                    part
                )
            )}
        </>
    );
};
