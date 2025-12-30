import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { WIDGET_REGISTRY } from '../components/settings/widgets/Registry';

export default function ScreenshotStudio() {
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');

    if (!type || !WIDGET_REGISTRY[type]) {
        return <div className="p-10 font-bold text-red-500">Widget type not found: {type}</div>;
    }

    const { component: WidgetComp, defaultProps } = WIDGET_REGISTRY[type];

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
        }}>
            <div
                id="widget-target"
                style={{
                    position: 'relative',
                    background: 'white',
                    // REMOVED borderRadius and boxShadow for clean flat look
                    width: '320px',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'scale(1.5)',
                    transformOrigin: 'center',
                    overflow: 'hidden', // Keep overflow hidden just in case
                }}
            >
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <WidgetComp {...defaultProps} />
                </div>
            </div>
        </div>
    );
}
