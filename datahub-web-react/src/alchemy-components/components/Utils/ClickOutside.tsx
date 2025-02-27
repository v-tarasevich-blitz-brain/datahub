import React, { useEffect, useRef } from 'react';

interface OutsideAlerterType {
    children: React.ReactNode;
    onClickOutside: () => void;
    overlayClassName?: string;
    wrapperClassName?: string;
}

export default function ClickOutside({ children, onClickOutside, overlayClassName, wrapperClassName }: OutsideAlerterType) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    function handleClickOutside(event) {
        if (overlayClassName) {
            if (event.target && event.target.classList.contains(overlayClassName)) {
                onClickOutside();
            }
        }else if (wrapperClassName) {
            console.log('>>> click internal', {closest: event.target?.closest?.(`.${wrapperClassName}`), fn: event.target?.closest})
            if (event.target && !event.target?.closest?.(`.${wrapperClassName}`)) {
                onClickOutside();
            }
        } else if (!(wrapperRef.current as HTMLDivElement).contains((event.target as Node) || null)) {
            onClickOutside();
        }
    }

    useEffect(() => {
        if (wrapperRef && wrapperRef.current) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    });

    return <div ref={wrapperRef}>{children}</div>;
}
