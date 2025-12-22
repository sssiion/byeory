import React from 'react';
import { WidgetWrapper as SharedWidgetWrapper } from '../Shared';

export const WidgetWrapper = ({ children, className = '', title }: { children: React.ReactNode; className?: string; title?: string }) => (
    <SharedWidgetWrapper className={`items-center justify-center p-2 ${className}`} title={title}>
        {children}
    </SharedWidgetWrapper>
);
