
import React, { useState, useEffect } from 'react';
import { FiX, FiDownload, FiCheck, FiHardDrive } from 'react-icons/fi';
import { exportBackupData } from '../../../services/backupService';
import { useAuth } from '../../../hooks/useAuth';

const BackupModal = ({ onClose }) => {
    const { user } = useAuth();
    const [step, setStep] = useState('CONFIRM'); // CONFIRM, PROCESSING, SUCCESS, ERROR
    const [filename, setFilename] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const now = new Date();
        const dateStr = now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
        setFilename(`advancekeep_${dateStr}.json`);
    }, []);

    const handleBackupStart = async () => {
        setStep('PROCESSING');
        try {
            const data = await exportBackupData(user.id);
            const jsonString = JSON.stringify(data, null, 2);

            // 헬퍼: 레거시 다운로드 방식 (Fallback)
            // Fix: 모바일(삼성인터넷 등)에서 Blob URL 사용 시 0바이트 저장 문제 해결을 위해 Data URI 방식 사용
            const triggerLegacyDownload = () => {
                const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonString);

                const link = document.createElement("a");
                link.href = dataUri;
                link.download = filename;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setStep('SUCCESS');
            };

            // Modern API: File System Access API (Chrome, Edge, Opera)
            // 주의: 모바일 브라우저(삼성 인터넷 등)에서 API는 존재하지만 권한 문제로 실패할 수 있음.
            if ('showSaveFilePicker' in window) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: filename,
                        types: [{
                            description: 'AdvanceKeep Backup File',
                            accept: { 'application/json': ['.json'] },
                        }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(jsonString);
                    await writable.close();
                    setStep('SUCCESS');
                } catch (err) {
                    if (err.name === 'AbortError') {
                        // 사용자가 저장을 취소한 경우 -> 초기 화면으로 복귀
                        setStep('CONFIRM');
                    } else {
                        // 그 외 오류(권한 거부, 지원되지 않는 컨텍스트 등) -> 레거시 방식으로 시도
                        console.warn("File System Access API failed, falling back to legacy download:", err);
                        triggerLegacyDownload();
                    }
                }
            } else {
                // Fallback: Legacy Anchor Download (Firefox, Safari, Mobile)
                triggerLegacyDownload();
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || "백업 생성 중 오류가 발생했습니다.");
            setStep('ERROR');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content auth-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>내 컴퓨터에 백업</h3>
                    <button className="close-btn-icon" onClick={onClose}><FiX size={20} /></button>
                </div>

                {step === 'CONFIRM' && (
                    <div>
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                            <FiDownload size={48} color="var(--text-secondary)" />
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5', textAlign: 'center' }}>
                            현재 계정의 모든 메모와 라벨을<br />
                            내 컴퓨터에 파일로 저장합니다.<br /><br />
                            <strong>{filename}</strong>
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button className="btn-text" onClick={onClose}>취소</button>
                            <button className="auth-submit" style={{ margin: 0 }} onClick={handleBackupStart}>
                                저장하기
                            </button>
                        </div>
                    </div>
                )}

                {step === 'PROCESSING' && (
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                        <div className="spinning" style={{ display: 'inline-block', marginBottom: '16px' }}>
                            <FiDownload size={32} color="#f57c00" />
                        </div>
                        <p>백업 파일을 생성하고 있습니다...</p>
                    </div>
                )}

                {step === 'SUCCESS' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ color: '#10b981', marginBottom: '16px' }}>
                            <FiCheck size={48} />
                        </div>
                        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>백업 완료!</p>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            파일이 다운로드 폴더에 저장되었습니다.
                        </p>
                        <button className="auth-submit" style={{ width: '100%' }} onClick={onClose}>
                            확인
                        </button>
                    </div>
                )}

                {step === 'ERROR' && (
                    <div>
                        <p style={{ color: '#ef4444', marginBottom: '20px' }}>
                            오류 발생: {errorMsg}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn-text" onClick={onClose}>닫기</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BackupModal;
