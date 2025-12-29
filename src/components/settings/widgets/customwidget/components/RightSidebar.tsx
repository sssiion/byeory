import React from 'react';
import {
    Settings2,
    Plus,
    Trash2,
    Info,
    CheckCircle,
    AlertTriangle,
    XCircle,
    ThumbsUp,
    Heart,
    Zap,
    Star
} from 'lucide-react';
import type { WidgetBlock } from '../types';
import { getLabelByType } from '../utils';

interface Props {
    selectedBlock: WidgetBlock | undefined;
    onUpdateBlock: (id: string, updates: any) => void;
}

const RightSidebar: React.FC<Props> = ({ selectedBlock, onUpdateBlock }) => {
    if (!selectedBlock) return <EmptyState />;

    const { type, content, styles } = selectedBlock;

    // 리스트 항목 업데이트 헬퍼
    const updateListItem = (index: number, value: string) => {
        const newItems = [...content.items];
        newItems[index] = value;
        onUpdateBlock(selectedBlock.id, { content: { items: newItems } });
    };
    // 리스트 항목 추가
    const addListItem = () => {
        onUpdateBlock(selectedBlock.id, { content: { items: [...content.items, '새 항목'] } });
    };

    // 리스트 항목 삭제
    const removeListItem = (index: number) => {
        const newItems = content.items.filter((_: any, i: number) => i !== index);
        onUpdateBlock(selectedBlock.id, { content: { items: newItems } });
    };

    const updateContent = (key: string, value: any) => {
        onUpdateBlock(selectedBlock.id, { content: { ...content, [key]: value } });
    };

    return (
        <aside className="w-80 bg-[#252525] border-l border-gray-700 flex flex-col text-sm h-full">
            <div className="p-4 border-b border-gray-700">
                <h2 className="font-bold text-white flex items-center gap-2">
                    <Settings2 size={16} /> {getLabelByType(type)} 설정
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-600">

                {/* --- 1. 콘텐츠 설정 (타입별 분기) --- */}
                <div className="space-y-4">
                    <Label>DATA & CONTENT</Label>

                    {/* A. 기본 텍스트류 */}
                    {['heading1','heading2','heading3','text','typing-text','quote','callout','spoiler','highlight', 'vertical-text',].includes(type) && (
                        <TextArea
                            value={content.text}
                            onChange={(val: string) => updateContent('text', val)}
                            placeholder="내용을 입력하세요"
                        />
                    )}
                    {/* 🌟 [NEW] 별점/평점 전용 설정 */}
                    {type === 'rating' && (
                        <div className="space-y-4">
                            <Label>평점 설정</Label>

                            {/* 1. 현재 점수 슬라이더 */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>점수</span>
                                    <span>{content.value} / {content.max}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={content.max || 5}
                                    value={content.value || 0}
                                    onChange={(e) => updateContent('value', Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            {/* 2. 최대 개수 설정 */}
                            <div className="space-y-1">
                                <Label>최대 개수</Label>
                                <div className="flex gap-2">
                                    {[5, 10].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => updateContent('max', num)}
                                            className={`flex-1 py-1 text-xs rounded border transition-colors ${
                                                content.max === num
                                                    ? 'bg-indigo-600 text-white border-indigo-500'
                                                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                                            }`}
                                        >
                                            {num}개
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 3. 아이콘 모양 선택 */}
                            <div className="space-y-1">
                                <Label>아이콘 모양</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { val: 'star', icon: <Star size={16} fill="currentColor"/> },
                                        { val: 'heart', icon: <Heart size={16} fill="currentColor"/> },
                                        { val: 'zap', icon: <Zap size={16} fill="currentColor"/> },
                                        { val: 'thumb', icon: <ThumbsUp size={16} fill="currentColor"/> },
                                    ].map((item) => (
                                        <button
                                            key={item.val}
                                            onClick={() => updateContent('icon', item.val)}
                                            className={`p-2 rounded flex justify-center items-center transition-all ${
                                                content.icon === item.val
                                                    ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                            title={item.val}
                                        >
                                            {item.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* 🌟 [NEW] 타이핑 효과 전용 설정 (속도) */}
                    {type === 'typing-text' && (
                        <div className="space-y-4">
                            {/* 기존 속도 조절 */}
                            <div className="space-y-2">
                                <Label>타이핑 속도 (ms)</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min="30"
                                        max="300"
                                        step="10"
                                        value={content.speed || 100}
                                        onChange={(e) => updateContent('speed', Number(e.target.value))}
                                        className="flex-1"
                                    />
                                    <span className="text-xs text-gray-400 w-8 text-right">{content.speed || 100}</span>
                                </div>
                            </div>

                            {/* 🆕 [NEW] 백스페이스 효과 토글 버튼 */}
                            <div className="flex items-center gap-2 bg-gray-800 p-2.5 rounded border border-gray-700">
                                <input
                                    type="checkbox"
                                    id="backspace-toggle"
                                    checked={!!content.isBackspaceMode}
                                    onChange={(e) => updateContent('isBackspaceMode', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-700 cursor-pointer"
                                />
                                <label htmlFor="backspace-toggle" className="text-xs text-gray-300 cursor-pointer select-none flex-1">
                                    백스페이스 효과 (지워짐)
                                </label>
                            </div>

                            <p className="text-[10px] text-gray-500">
                                켜짐: 한 글자씩 지워집니다.<br/>
                                꺼짐: 문장이 한 번에 사라지고 반복됩니다.
                            </p>
                        </div>

                    )}

                    {/* 🌟 [NEW] 스크롤 텍스트 전용 설정 (속도) */}
                    {type === 'scroll-text' && (
                        <div className="space-y-2">
                            <Label>스크롤 속도 (초)</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="3"
                                    max="30"
                                    step="1"
                                    value={content.speed || 10}
                                    onChange={(e) => updateContent('speed', Number(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-xs text-gray-400 w-8 text-right">{content.speed || 10}s</span>
                            </div>
                            <p className="text-[10px] text-gray-500">숫자가 작을수록 빨리 지나갑니다.</p>
                        </div>
                    )}
                    {/* 🌟 [NEW] 수식(Math) 설정 */}
                    {type === 'math' && (
                        <div className="space-y-3">
                            <Label>LaTeX 수식 입력</Label>
                            <TextArea
                                value={content.text}
                                onChange={(val: string) => updateContent('text', val)}
                                placeholder="예: E = mc^2"
                            />

                            {/* 자주 쓰는 수식 버튼들 (편의기능) */}
                            <div className="grid grid-cols-4 gap-1">
                                {[
                                    { label: '분수', code: '\\frac{a}{b}' },
                                    { label: '루트', code: '\\sqrt{x}' },
                                    { label: '제곱', code: 'x^2' },
                                    { label: '시그마', code: '\\sum' },
                                    { label: '알파', code: '\\alpha' },
                                    { label: '베타', code: '\\beta' },
                                    { label: '화살표', code: '\\rightarrow' },
                                    { label: '무한', code: '\\infty' },
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => updateContent('text', (content.text || '') + item.code)}
                                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] py-1 rounded border border-gray-600"
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-gray-800/50 p-2 rounded text-[10px] text-gray-400">
                                💡 LaTeX 문법을 지원합니다.<br/>
                                예: \frac&#123;a&#125;&#123;b&#125;
                            </div>
                        </div>
                    )}
                    {/* 🌟 [NEW] 콜아웃 전용 설정 */}
                    {type === 'callout' && (
                        <div className="space-y-3 mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                            <Label>콜아웃 타입</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { value: 'info', icon: <Info size={16}/>, color: 'text-blue-400', bg: 'bg-blue-900/30' },
                                    { value: 'success', icon: <CheckCircle size={16}/>, color: 'text-green-400', bg: 'bg-green-900/30' },
                                    { value: 'warning', icon: <AlertTriangle size={16}/>, color: 'text-orange-400', bg: 'bg-orange-900/30' },
                                    { value: 'error', icon: <XCircle size={16}/>, color: 'text-red-400', bg: 'bg-red-900/30' }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => updateContent('type', opt.value)}
                                        className={`flex flex-col items-center justify-center p-2 rounded transition-all ${
                                            content.type === opt.value
                                                ? `${opt.bg} border border-${opt.color.split('-')[1]}-500/50 ring-1 ring-${opt.color.split('-')[1]}-500`
                                                : 'hover:bg-gray-700 border border-transparent'
                                        }`}
                                        title={opt.value}
                                    >
                                        <div className={opt.color}>{opt.icon}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-2 border-t border-gray-700 mt-2">
                                <Label>제목 (선택사항)</Label>
                                <Input
                                    value={content.title}
                                    onChange={(val: string) => updateContent('title', val)}
                                    placeholder="제목 없음"
                                />
                            </div>
                        </div>
                    )}

                    {/* 🆕 4. 토글 목록 설정 */}
                    {type === 'toggle-list' && (
                        <div className="space-y-3">
                            <Label>제목 설정</Label>
                            <Input
                                value={content.title}
                                onChange={(val: string) => updateContent('title', val)}
                                placeholder="토글 제목"
                            />

                            <Label>숨겨진 목록 편집</Label>
                            {content.items.map((item: string, idx: number) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        value={item}
                                        onChange={(val: string) => {
                                            const newItems = [...content.items];
                                            newItems[idx] = val;
                                            updateContent('items', newItems);
                                        }}
                                    />
                                    <button onClick={() => {
                                        const newItems = content.items.filter((_: any, i: number) => i !== idx);
                                        updateContent('items', newItems);
                                    }} className="text-gray-500 hover:text-red-400"><Trash2 size={14}/></button>
                                </div>
                            ))}
                            <button onClick={() => updateContent('items', [...content.items, '새 항목'])} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs">
                                + 항목 추가
                            </button>
                        </div>
                    )}

                    {/* 🆕 5. 다단 컬럼 설정 (🔥 여기가 수정된 부분입니다) */}
                    {type === 'columns' && (
                        <div className="space-y-4">
                            <Label>레이아웃 (단 수 조절)</Label>
                            <div className="flex gap-2">
                                {[2, 3, 4].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => {
                                            // 기존 레이아웃(블록 배열들) 가져오기
                                            const currentLayout = content.layout || [[], []];
                                            let newLayout = [...currentLayout];

                                            // 칸 늘리기
                                            if (num > newLayout.length) {
                                                for(let i=newLayout.length; i<num; i++) newLayout.push([]);
                                            }
                                            // 칸 줄이기 (데이터 삭제 주의)
                                            else if (num < newLayout.length) {
                                                if(confirm("칸을 줄이면 내용이 삭제됩니다. 계속하시겠습니까?")) {
                                                    newLayout = newLayout.slice(0, num);
                                                } else {
                                                    return; // 취소
                                                }
                                            }
                                            updateContent('layout', newLayout);
                                        }}
                                        className={`flex-1 py-2 rounded text-xs font-bold transition-colors ${content.layout?.length === num ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                    >
                                        {num}단
                                    </button>
                                ))}
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded text-gray-400 text-xs leading-relaxed border border-gray-700/50">
                                💡 <b>사용법:</b><br/>
                                1. 캔버스에서 <b>빈 칸을 클릭</b>하여 선택하세요.<br/>
                                2. 왼쪽 메뉴에서 원하는 <b>기능을 클릭</b>하여 칸 안에 추가하세요.
                            </div>
                        </div>
                    )}

                    {/* 🆕 6. 아코디언 설정 */}
                    {type === 'accordion' && (
                        <div className="space-y-3">
                            <Label>제목 (질문)</Label>
                            <Input
                                value={content.title}
                                onChange={(val: string) => updateContent('title', val)}
                                placeholder="아코디언 제목"
                            />

                            <Label>본문 (답변)</Label>
                            <TextArea
                                value={content.body}
                                onChange={(val: string) => updateContent('body', val)}
                                placeholder="펼쳤을 때 보일 내용"
                            />
                        </div>
                    )}

                    {/* --- 1. 구분선 설정 --- */}
                    {type === 'divider' && (
                        <div className="space-y-2">
                            <Label>스타일</Label>
                            <ColorPicker label="선 색상" value={styles.color} onChange={(val: string) => onUpdateBlock(selectedBlock.id, { color: val })} />
                        </div>
                    )}

                    {/* --- 2. 목록 설정 (글머리 & 번호 공통) --- */}
                    {(type === 'bullet-list' || type === 'number-list') && (
                        <div className="space-y-3">
                            <Label>목록 편집</Label>
                            {content.items.map((item: string, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <div className="w-6 text-center text-gray-500 text-xs font-bold">
                                        {type === 'number-list' ? `${idx + 1}.` : '•'}
                                    </div>

                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateListItem(idx, e.target.value)}
                                        className="flex-1 bg-gray-800 text-white p-2 rounded border border-gray-600 outline-none text-xs focus:border-indigo-500"
                                    />

                                    <button onClick={() => removeListItem(idx)} className="text-gray-500 hover:text-red-400">
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={addListItem}
                                className="w-full py-2 flex items-center justify-center gap-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                            >
                                <Plus size={14}/> 항목 추가하기
                            </button>
                        </div>
                    )}

                    {/* B. 할 일 목록 (Todo List) - 배열 관리 */}
                    {type === 'todo-list' && (
                        <div className="space-y-2">
                            {content.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center bg-gray-800 p-2 rounded">
                                    <input
                                        type="checkbox"
                                        checked={item.done}
                                        onChange={(e) => {
                                            const newItems = [...content.items];
                                            newItems[idx].done = e.target.checked;
                                            updateContent('items', newItems);
                                        }}
                                        className="cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={item.text}
                                        onChange={(e) => {
                                            const newItems = [...content.items];
                                            newItems[idx].text = e.target.value;
                                            updateContent('items', newItems);
                                        }}
                                        className="flex-1 bg-transparent text-white outline-none text-xs"
                                    />
                                    <button
                                        onClick={() => {
                                            const newItems = content.items.filter((_: any, i: number) => i !== idx);
                                            updateContent('items', newItems);
                                        }}
                                        className="text-gray-500 hover:text-red-400"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => updateContent('items', [...content.items, { text: '새 할 일', done: false }])}
                                className="w-full py-2 flex items-center justify-center gap-2 text-xs bg-gray-800 hover:bg-gray-700 text-indigo-400 rounded dashed border border-gray-600"
                            >
                                <Plus size={14}/> 항목 추가
                            </button>
                        </div>
                    )}

                    {/* C. 차트 데이터 (Pie, Bar) - 라벨/값 관리 */}
                    {(type === 'chart-pie' || type === 'chart-bar') && (
                        <div className="space-y-2">
                            <div className="flex text-xs text-gray-500 px-1">
                                <span className="flex-1">라벨</span>
                                <span className="w-16">값</span>
                                <span className="w-6"></span>
                            </div>
                            {(content.data || []).map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input
                                        value={item.label}
                                        onChange={(val: string) => {
                                            const newData = [...content.data];
                                            newData[idx].label = val;
                                            updateContent('data', newData);
                                        }}
                                    />
                                    <input
                                        type="number"
                                        value={item.value}
                                        onChange={(e) => {
                                            const newData = [...content.data];
                                            newData[idx].value = Number(e.target.value);
                                            updateContent('data', newData);
                                        }}
                                        className="w-16 bg-gray-800 text-white p-2 rounded border border-gray-600 outline-none text-xs"
                                    />
                                    <button
                                        onClick={() => {
                                            const newData = content.data.filter((_: any, i: number) => i !== idx);
                                            updateContent('data', newData);
                                        }}
                                        className="text-gray-500 hover:text-red-400"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => updateContent('data', [...(content.data || []), { label: '항목', value: 10 }])}
                                className="w-full py-2 text-xs bg-indigo-900/50 text-indigo-400 rounded hover:bg-indigo-900"
                            >
                                + 데이터 추가
                            </button>
                        </div>
                    )}

                    {(type === 'chart-pie' || type === 'chart-bar' || type === 'chart-radar') && (
                        <div className="space-y-3">
                            <Label>차트 데이터 (0 ~ 100)</Label>

                            {/* 헤더 */}
                            <div className="flex text-xs text-gray-500 px-1 gap-2">
                                <span className="flex-1">라벨명</span>
                                <span className="w-12 text-center">점수</span>
                                <span className="w-5"></span>
                            </div>

                            {/* 데이터 리스트 */}
                            {(content.data || []).map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input
                                        value={item.label}
                                        onChange={(val: string) => {
                                            const newData = [...content.data];
                                            newData[idx].label = val;
                                            updateContent('data', newData);
                                        }}
                                        placeholder="항목명"
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={item.value}
                                        onChange={(e) => {
                                            const newData = [...content.data];
                                            newData[idx].value = Number(e.target.value);
                                            updateContent('data', newData);
                                        }}
                                        className="w-12 bg-gray-800 text-white p-2 rounded border border-gray-600 outline-none text-xs text-center"
                                    />
                                    <button
                                        onClick={() => {
                                            const newData = content.data.filter((_: any, i: number) => i !== idx);
                                            updateContent('data', newData);
                                        }}
                                        className="text-gray-500 hover:text-red-400"
                                        title="삭제"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            ))}

                            {/* 추가 버튼 */}
                            <button
                                onClick={() => updateContent('data', [...(content.data || []), { label: '새 항목', value: 50 }])}
                                className="w-full py-2 text-xs bg-indigo-900/50 text-indigo-400 rounded hover:bg-indigo-900 border border-indigo-500/30 transition-colors"
                            >
                                + 데이터 추가
                            </button>

                            {/* 🌟 방사형 차트 전용 옵션 */}
                            {type === 'chart-radar' && (
                                <div className="pt-2 mt-2 border-t border-gray-700 flex items-center justify-between">
                                    <span className="text-gray-400 text-xs">라벨 표시</span>
                                    <input
                                        type="checkbox"
                                        checked={content.showLabels !== false}
                                        onChange={(e) => updateContent('showLabels', e.target.checked)}
                                        className="cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    {/* 🌟 [NEW] 히트맵(잔디) 전용 설정 */}
                    {type === 'heatmap' && (
                        <div className="space-y-4">
                            <Label>잔디 설정</Label>

                            {/* 보기 모드 선택 */}
                            <div className="space-y-2">
                                <span className="text-xs text-gray-400">조회 기간</span>
                                <div className="grid grid-cols-3 gap-1 bg-gray-800 p-1 rounded">
                                    {[
                                        { label: '1년', value: 'year' },
                                        { label: '한 달', value: 'month' },
                                        { label: '일주일', value: 'week' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => updateContent('viewMode', opt.value)}
                                            className={`text-xs py-1.5 rounded transition-colors ${
                                                content.viewMode === opt.value
                                                    ? 'bg-indigo-600 text-white font-bold'
                                                    : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-500 pt-1">
                                    {content.viewMode === 'year' && '최근 365일의 기록을 보여줍니다.'}
                                    {content.viewMode === 'month' && '최근 30일의 기록을 보여줍니다.'}
                                    {content.viewMode === 'week' && '최근 7일의 기록을 보여줍니다.'}
                                </p>
                            </div>

                            {/* 제목 설정 (선택사항) */}
                            <div className="space-y-1">
                                <Label>제목</Label>
                                <Input
                                    value={content.title}
                                    onChange={(val: string) => updateContent('title', val)}
                                    placeholder="예: 나의 개발 기록"
                                />
                            </div>
                        </div>
                    )}
                    {/* D. D-Day (카운터/기념일) */}
                    {type === 'counter' && (
                        <>
                            <Input value={content.title} onChange={(val: string) => updateContent('title', val)} placeholder="제목 (예: 시험까지)" />
                            <div className="space-y-1">
                                <span className="text-xs text-gray-400">목표 날짜</span>
                                <input
                                    type="date"
                                    value={content.date || ''}
                                    onChange={(e) => updateContent('date', e.target.value)}
                                    className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 outline-none"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* --- 2. 스타일 설정 --- */}
                <div className="space-y-4 pt-4 border-t border-gray-700">
                    <Label>STYLE & APPEARANCE</Label>

                    <div className="grid grid-cols-2 gap-2">
                        <ColorPicker label="글자색" value={styles.color} onChange={(val: string) => onUpdateBlock(selectedBlock.id, { color: val })} />
                        <ColorPicker label="배경색" value={styles.bgColor} onChange={(val: string) => onUpdateBlock(selectedBlock.id, { bgColor: val })} />
                    </div>

                    <div className="flex items-center gap-4 mt-2 bg-gray-800 p-2 rounded">
                        <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                            <input type="checkbox" checked={!!styles.bold} onChange={(e) => onUpdateBlock(selectedBlock.id, { bold: e.target.checked })} />
                            Bold
                        </label>
                        <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                            <input type="checkbox" checked={!!styles.italic} onChange={(e) => onUpdateBlock(selectedBlock.id, { italic: e.target.checked })} />
                            Italic
                        </label>
                    </div>
                </div>

            </div>
        </aside>
    );
};

// UI 컴포넌트들
const EmptyState = () => (
    <aside className="w-80 bg-[#252525] border-l border-gray-700 flex flex-col items-center justify-center text-gray-500 space-y-2">
        <p className="text-center text-sm">캔버스에서 블록을 선택하세요</p>
    </aside>
);
const Label = ({ children }: any) => <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{children}</div>;
const Input = ({ value, onChange, placeholder }: any) => (
    <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 outline-none focus:border-indigo-500 text-xs" />
);
const TextArea = ({ value, onChange, placeholder }: any) => (
    <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-20 bg-gray-800 text-white p-2 rounded border border-gray-600 outline-none resize-none focus:border-indigo-500 text-xs" />
);
const ColorPicker = ({ label, value, onChange }: any) => (
    <div className="bg-gray-800 p-2 rounded flex items-center justify-between">
        <span className="text-gray-300 text-xs">{label}</span>
        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-600">
            <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer" />
        </div>
    </div>
);

export default RightSidebar;