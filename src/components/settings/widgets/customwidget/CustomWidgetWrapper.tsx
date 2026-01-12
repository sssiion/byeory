import React from 'react';
import BlockRenderer from './components/BlockRenderer';

interface CustomWidgetWrapperProps {
    widgetId: string;
    type?: string;
    content?: any;
    styles?: any;
    [key: string]: any; // 다른 props 허용
}

export const CustomWidgetWrapper: React.FC<CustomWidgetWrapperProps> = (props) => {
    // 대시보드에서 넘어오는 flat props를 WidgetBlock 구조로 변환
    const block = {
        id: props.widgetId,
        type: (props.type as any) || 'custom-block',
        content: props.content || {},
        styles: props.styles || {},
    };

    return (
        <div className="w-full h-full overflow-hidden">
            <BlockRenderer
                block={block}
                selectedBlockId={null}
                onSelectBlock={() => { }}
                onRemoveBlock={() => { }}
                activeContainer={null as any}
                onSetActiveContainer={() => { }}
                onUpdateBlock={() => { }} // 대시보드에서는 읽기 전용 (또는 별도 처리)
            />
        </div>
    );
};
