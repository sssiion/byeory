import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const PaymentFailPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">결제 오류</h1>
            <p className="text-[var(--text-secondary)] mb-8">
                결제 처리 중 문제가 발생했습니다.<br />
                잠시 후 다시 시도해주시거나 고객센터에 문의해주세요.
            </p>
            <div className="w-full max-w-xs space-y-3">
                <button
                    onClick={() => navigate('/charge')}
                    className="w-full py-4 bg-[var(--btn-bg)] text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                    다시 시도하기
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] active:scale-95 transition-all"
                >
                    홈으로 돌아가기
                </button>
            </div>
        </div>
    );
};

export default PaymentFailPage;
