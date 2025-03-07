import React, { useEffect, useRef } from 'react';

interface ClickOutsideProps {
    onClickOutside: () => void;
    outsideSelector?: string; // Selector for elements that should trigger `onClickOutside`
    ignoreSelector?: string; // Selector for elements that should be ignored
    ignoreWrapper?: boolean; // Enable to ignore click outside the wrapper
}

export default function ClickOutside({
    children,
    onClickOutside,
    outsideSelector,
    ignoreSelector,
    ignoreWrapper,
}: React.PropsWithChildren<ClickOutsideProps>) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    /**
     * Handles click events outside the wrapper or based on selectors.
     */
    const handleClickOutside = (event: MouseEvent): void => {
        const target = event.target as HTMLElement;

        // Ignore clicks on elements matching `ignoreSelector`
        if (ignoreSelector && target.closest(ignoreSelector)) return;

        // Trigger `onClickOutside` if the click is on an element matching `outsideSelector`
        if (outsideSelector && target.closest(outsideSelector)) {
            onClickOutside();
            return;
        }

        // Trigger `onClickOutside` if the click is outside the wrapper
        if (!ignoreWrapper && wrapperRef.current && !wrapperRef.current.contains(target)) {
            onClickOutside();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClickOutside]);

    return <div ref={wrapperRef}>{children}</div>;
}
