import React, { useEffect, useRef } from 'react';

interface OutsideAlerterType {
    children: React.ReactNode;
    onClickOutside: () => void;
    overlayClassName?: string;
    wrapperClassName?: string;
    excludeClassName?: string;

    outsideSelector?: string;
    ignoreSelector?: string;
}

export default function ClickOutside({ children, onClickOutside, overlayClassName, wrapperClassName, ignoreSelector, outsideSelector }: OutsideAlerterType) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    function handleClickOutside(event: MouseEvent) {
        const isElement = event.target instanceof Element;
        if (!isElement) return null;


        // console.log('>>> handleClickOutside', {event, ignoreSelector, outsideSelector});


        if (ignoreSelector) {
            // debugger;
            if (!!event.target.closest(ignoreSelector)) {
                // console.log('>>> handleClickOutside ignored');
                return null
            };
        }

        // console.log('>>> handleClickOutside not ignored');


        if (outsideSelector) {
            if (!!event.target.closest(outsideSelector)) {
                // console.log('>>> handleClickOutside 1')
                onClickOutside();

            };
        } 
        
        if (!(wrapperRef.current as HTMLDivElement).contains((event.target as Node) || null)) {
            // console.log('>>> handleClickOutside 2')
            onClickOutside();
        }




        // if (overlayClassName) {
        //     if (event.target.classList.contains(overlayClassName)) {
        //         onClickOutside();
        //     }
        // }else if (wrapperClassName) {
        //     console.log('>>> click internal', {closest: event.target?.closest?.(`.${wrapperClassName}`), fn: event.target?.closest})
        //     if (!event.target.closest?.(`.${wrapperClassName}`)) {
        //         onClickOutside();
        //     }
        // } else if (!(wrapperRef.current as HTMLDivElement).contains((event.target as Node) || null)) {
        //     onClickOutside();
        // }
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
