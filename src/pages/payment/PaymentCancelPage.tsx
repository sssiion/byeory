import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentCancelPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">결제 취소</h1>
            <p className="text-[var(--text-secondary)] mb-8">
                결제가 중단되었습니다.<br />
                충전이 필요하시면 다시 시도해주세요.
            </p>
            <div className="w-full max-w-xs space-y-3">
                <button
                    onClick={() => navigate('/charge')}
                    className="w-full py-4 bg-[var(--btn-bg)] text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                    다시 충전하기
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

export default PaymentCancelPage;
