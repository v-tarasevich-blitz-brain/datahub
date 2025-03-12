import { colors, spacing } from '@src/alchemy-components/theme';
import radius from '@src/alchemy-components/theme/foundations/radius';
import { AutoComplete as AntdAutoComplete, ConfigProvider } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ClickOutside from '../Utils/ClickOutside';
import { OverlayClassProvider, useOverlayClassStackContext } from '../Utils/OverlayClassContext/OverlayClassContext';
import { BOX_SHADOW, ChildrenWrapper, DropdownInnerPopupContainer, DropdownWrapper } from './components';
import { AutoCompleteProps } from './types';
import { createPortal } from 'react-dom';

// Additional offset to handle wrapper's padding (when `showWrapping` is enabled)
const DROPDOWN_ALIGN_WITH_WRAPPING = { offset: [0, -8] };

const DROPDOWN_OVERLAY_CLASS_NAME = 'autocomplete-click-outside-ignore';

export default function AutoComplete({
    children,
    showWrapping,
    dropdownContentHeight,
    dataTestId,
    onDropdownVisibleChange,
    ...props
}: React.PropsWithChildren<AutoCompleteProps>) {
    // const overlayClassStack = useOverlayClassStackContext();
    // const overlayClasses = useMemo(
    //     () => [...overlayClassStack, DROPDOWN_OVERLAY_CLASS_NAME].join(' '),
    //     [overlayClassStack],
    // );

    // const [internalOpen, setInternalOpen] = useState<boolean>(false);

    // useEffect(() => {
    //     if (open !== undefined) setInternalOpen(open);
    // }, [open]);

    // const updateOpenState = useCallback(
    //     (isOpen) => {
    //         // if (open === undefined) setInternalOpen(isOpen);
    //         onDropdownVisibleChange?.(isOpen);
    //     },
    //     [open, onDropdownVisibleChange],
    // );

    const innerPopupContainerRef = useRef<HTMLDivElement>(null);

    return (
        <AntdAutoComplete
            {...props}
            listHeight={dropdownContentHeight}
            data-testid={dataTestId}
            onDropdownVisibleChange={(open) => onDropdownVisibleChange?.(open)}
            dropdownRender={(menu) => {
                return (
                    <>
                        {/* 
                            Workaround for better supporting of inner Dropdown's in their portals:
                            - fixes the problem when clicking on child's popup closing the parent popup

                            ConfigProvider passes the container so that inner popups will be inside of the current one.
                        */}
                        <DropdownInnerPopupContainer ref={innerPopupContainerRef} />
                        <ConfigProvider getPopupContainer={() => innerPopupContainerRef.current as HTMLDivElement}>
                            <DropdownWrapper>{props?.dropdownRender?.(menu) ?? menu}</DropdownWrapper>
                        </ConfigProvider>
                    </>
                );
            }}
            dropdownMatchSelectWidth={664}
        >
            {children}
        </AntdAutoComplete>
    );
}
