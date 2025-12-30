
import React, { useState, useRef } from 'react';
import { FiX, FiUpload, FiCheck, FiAlertTriangle, FiFile } from 'react-icons/fi';
import { importBackupData } from '../../../services/backupService';
import { useAuth } from '../../../hooks/useAuth';

const RestoreModal = ({ onClose }) => {
    const { user } = useAuth();
    const [step, setStep] = useState('INIT'); // INIT, CONFIRM, RESTORING, SUCCESS, ERROR
    const [file, setFile] = useState(null);
    const [backupData, setBackupData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    const parseFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (!json.data || !json.data.notes) {
                    throw new Error("유효하지 않은 백업 파일 형식입니다.");
                }
                setBackupData(json);
                setStep('CONFIRM');
            } catch (err) {
                console.error(err);
                setErrorMsg("파일을 읽는 중 오류가 발생했습니다: " + err.message);
                setStep('ERROR');
            }
        };
        reader.readAsText(file);
    };

    const handleRestoreProcess = async () => {
        if (!backupData) return;
        setStep('RESTORING');
        try {
            await importBackupData(user.id, backupData);
            setStep('SUCCESS');
        } catch (err) {
            console.error(err);
            setErrorMsg("복구 중 오류가 발생했습니다: " + err.message);
            setStep('ERROR');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content auth-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>내 컴퓨터에서 복구</h3>
                    <button className="close-btn-icon" onClick={onClose}><FiX size={20} /></button>
                </div>

                {step === 'INIT' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
                            컴퓨터에 저장된 백업 파일(.db)을 선택해주세요.
                        </p>

                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".db"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        <button
                            className="auth-submit"
                            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <FiUpload /> 파일 선택
                        </button>
                    </div>
                )}

                {step === 'CONFIRM' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ color: '#ef4444', marginBottom: '16px' }}>
                            <FiAlertTriangle size={48} />
                        </div>
                        <h4 style={{ margin: '0 0 12px 0' }}>선택한 파일로 복구하시겠습니까?</h4>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', background: 'var(--bg-tertiary)', padding: '8px', borderRadius: '8px' }}>
                            <FiFile />
                            <span style={{ fontWeight: '500' }}>{file?.name}</span>
                        </div>
                        <p style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '24px' }}>
                            주의사항<br />
                            현재 모든 데이터가 삭제되고 백업 데이터로 복구됩니다.<br />
                            이 작업은 되돌릴 수 없습니다.
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="auth-submit"
                                style={{ flex: 1, background: 'var(--bg-tertiary)', color: 'var(--text-primary)', transform: 'none' }}
                                onClick={() => {
                                    setFile(null);
                                    setStep('INIT');
                                }}
                            >
                                뒤로
                            </button>
                            <button
                                className="auth-submit"
                                style={{ flex: 1, background: '#ef4444' }}
                                onClick={handleRestoreProcess}
                            >
                                복구 실행
                            </button>
                        </div>
                    </div>
                )}

                {step === 'RESTORING' && (
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                        <div className="spinning" style={{ display: 'inline-block', marginBottom: '16px' }}>
                            <FiUpload size={32} color="#f57c00" />
                        </div>
                        <p>데이터를 복구하고 있습니다...</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>앱을 종료하지 마세요.</p>
                    </div>
                )}

                {step === 'SUCCESS' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ color: '#10b981', marginBottom: '16px' }}>
                            <FiCheck size={48} />
                        </div>
                        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>복구 완료!</p>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            데이터가 성공적으로 복원되었습니다.
                        </p>
                        <button className="auth-submit" style={{ width: '100%' }} onClick={() => window.location.reload()}>
                            새로고침하여 적용
                        </button>
                    </div>
                )}

                {step === 'ERROR' && (
                    <div>
                        <p style={{ color: '#ef4444', marginBottom: '20px' }}>
                            {errorMsg}
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

export default RestoreModal;
