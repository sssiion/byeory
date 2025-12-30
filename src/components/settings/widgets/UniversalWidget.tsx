
const UniversalWidget = ({ block }: any) => {
    const { content, styles } = block;
    // content 안에 있는 데이터 중 '제목(title)'이 있다면 크게 보여주고, 나머지는 리스트로 보여줌
    const title = content.title || content.name || '제목 없음';

    // content 객체에서 title, name 등 이미 쓴 건 제외하고 나머지 키-값 쌍 추출
    const properties = Object.entries(content).filter(([key]) =>
        key !== 'title' && key !== 'name' && typeof key !== 'object'
    );

    return (
        <div
            className="w-full h-full p-4 rounded-xl border shadow-sm overflow-hidden flex flex-col"
            style={{
                backgroundColor: styles.bgColor || '#ffffff',
                borderColor: styles.borderColor || '#e5e7eb'
            }}
        >
            {/* 1. 제목 영역 (사용자가 title 필드를 입력했다면 표시) */}
            <h3
                className="text-lg font-bold mb-3 border-b pb-2"
                style={{ color: styles.color || '#1f2937' }}
            >
                {title}
            </h3>

            {/* 2. 데이터 자동 렌더링 영역 (어떤 컬럼이든 다 표시) */}
            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
                {properties.length === 0 ? (
                    <p className="text-xs text-gray-400">데이터가 없습니다.</p>
                ) : (
                    properties.map(([key, value]: any, index) => (
                        <div key={index} className="flex justify-between items-center text-sm group">
                            <span className="text-gray-500 font-medium capitalize">
                                {key} {/* 예: price, location, rating ... */}
                            </span>
                            <span className="text-gray-800 font-bold text-right">
                                {/* 값이 이미지 URL이면 이미지로 보여주기 (간단한 로직) */}
                                {typeof value === 'string' && value.startsWith('http') ? (
                                    <img src={value} alt={key} className="w-10 h-10 object-cover rounded" />
                                ) : (
                                    value
                                )}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UniversalWidget;