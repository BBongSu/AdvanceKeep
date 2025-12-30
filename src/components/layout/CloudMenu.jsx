
import React, { useState, useRef, useEffect } from 'react';
import { FiCloud, FiCloudOff, FiDownload, FiUpload } from 'react-icons/fi';
import BackupModal from '../features/drive/BackupModal';
import RestoreModal from '../features/drive/RestoreModal';

/**
 * CloudMenu 컴포넌트
 * 온라인/오프라인 연결 상태 표시 및 백업/복구 드롭다운 메뉴를 관리합니다.
 */
const CloudMenu = () => {
    const [cloudMenuOpen, setCloudMenuOpen] = useState(false);
    const cloudRef = useRef(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);

    // 온라인/오프라인 상태 감지 리스너
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // 외부 클릭 시 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (cloudRef.current && !cloudRef.current.contains(e.target)) {
                setCloudMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <div className="cloud-wrapper" ref={cloudRef}>
                <button
                    className="icon-btn"
                    onClick={() => setCloudMenuOpen(!cloudMenuOpen)}
                    title={isOnline ? "동기화 상태 / 메뉴" : "오프라인 상태"}
                    aria-label="클라우드 메뉴"
                >
                    {isOnline ? <FiCloud size={20} /> : <FiCloudOff size={20} />}
                </button>
                {cloudMenuOpen && (
                    <div className="cloud-dropdown">
                        <button
                            className="cloud-action-btn"
                            onClick={() => {
                                setCloudMenuOpen(false);
                                setShowBackupModal(true);
                            }}
                        >
                            <FiDownload size={18} />
                            <span>내 컴퓨터에 백업</span>
                        </button>
                        <button
                            className="cloud-action-btn"
                            onClick={() => {
                                setCloudMenuOpen(false);
                                setShowRestoreModal(true);
                            }}
                        >
                            <FiUpload size={18} />
                            <span>내 컴퓨터에서 복구</span>
                        </button>
                    </div>
                )}
            </div>
            {showBackupModal && <BackupModal onClose={() => setShowBackupModal(false)} />}
            {showRestoreModal && <RestoreModal onClose={() => setShowRestoreModal(false)} />}
        </>
    );
};

export default CloudMenu;
