
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
        setFilename(`advancekeep_${dateStr}.db`);
    }, []);

    const handleBackupStart = async () => {
        setStep('PROCESSING');
        try {
            const data = await exportBackupData(user.id);
            const jsonString = JSON.stringify(data, null, 2);

            // Modern API: File System Access API (Chrome, Edge, Opera)
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: filename,
                        types: [{
                            description: 'AdvanceKeep Backup DB',
                            accept: { 'application/json': ['.db'] },
                        }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(jsonString);
                    await writable.close();
                    setStep('SUCCESS');
                } catch (err) {
                    if (err.name === 'AbortError') {
                        // 사용자가 취소함 -> 초기 화면으로 복귀
                        setStep('CONFIRM');
                    } else {
                        throw err;
                    }
                }
            } else {
                // Fallback: Legacy Anchor Download (Firefox, Safari, Mobile)
                // 저장을 취소했는지 알 수 없음.
                const blob = new Blob([jsonString], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                setStep('SUCCESS');
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
