import Swal from 'sweetalert2';

/**
 * 에러 메시지를 사용자에게 표시하는 공통 함수
 * @param {string} title - 에러 제목
 * @param {string} message - 에러 메시지
 */
export const showErrorAlert = async (title, message) => {
    await Swal.fire({
        icon: 'error',
        title,
        text: message,
        confirmButtonColor: '#667eea'
    });
};

/**
 * 노트 작업 핸들러를 생성하는 헬퍼 함수
 * 에러 처리 로직을 중복 없이 재사용할 수 있도록 함
 * @param {Function} action - 실행할 비동기 작업
 * @param {string} errorTitle - 에러 발생 시 표시할 제목
 * @param {string} errorMessage - 에러 발생 시 표시할 메시지
 * @param {boolean} returnValue - 성공 시 반환할 값 (기본값: undefined)
 * @returns {Function} 에러 처리가 포함된 핸들러 함수
 */
export const createNoteHandler = (action, errorTitle, errorMessage, returnValue = undefined) => {
    return async (...args) => {
        try {
            await action(...args);
            return returnValue === undefined ? undefined : true;
        } catch {
            await showErrorAlert(errorTitle, errorMessage);
            return returnValue === undefined ? undefined : false;
        }
    };
};

/**
 * 빈 상태 메시지를 생성하는 헬퍼 함수
 * @param {boolean} hasSearchQuery - 검색어가 있는지 여부
 * @param {string} searchQuery - 검색어
 * @param {string} emptyMessage - 검색어가 없을 때 표시할 메시지
 * @returns {string} 표시할 메시지
 */
export const getEmptyStateMessage = (hasSearchQuery, searchQuery, emptyMessage) => {
    return hasSearchQuery
        ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
        : emptyMessage;
};
