import { Dropdown as AntdDropdown } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { DropdownProps } from '@components/components/Dropdown/types';
import { useOverlayClassStackContext } from '@components/components/Utils/OverlayClassContext/OverlayClassContext';

export function useIsVisible(ref) {
    const [isIntersecting, setIntersecting] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting));

        observer.observe(ref.current);
        return () => {
            observer.disconnect();
        };
    }, [ref]);

    return isIntersecting;
}

export default function Dropdown({ children, overlayClassName, ...props }: React.PropsWithChildren<DropdownProps>) {
    // Get all overlay classes from parents
    const overlayClassNames = useOverlayClassStackContext();
    const finalOverlayClassName = useMemo(() => {
        if (overlayClassName) {
            return [...overlayClassNames, overlayClassName].join(' ');
        }
        return overlayClassNames.join(' ');
    }, [overlayClassName, overlayClassNames]);

    const ref = useRef(null);

    return (
        <div ref={ref}>
            <AntdDropdown trigger={['click']} {...props} overlayClassName={finalOverlayClassName}>
                {children}
            </AntdDropdown>
        </div>
    );
}
