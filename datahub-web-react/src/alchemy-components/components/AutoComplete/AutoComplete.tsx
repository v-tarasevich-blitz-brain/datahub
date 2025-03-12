import { colors, spacing } from '@src/alchemy-components/theme';
import radius from '@src/alchemy-components/theme/foundations/radius';
import { AutoComplete as AntdAutoComplete } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ClickOutside from '../Utils/ClickOutside';
import { OverlayClassProvider, useOverlayClassStackContext } from '../Utils/OverlayClassContext/OverlayClassContext';
import { BOX_SHADOW, ChildrenWrapper, DropdownWrapper } from './components';
import { AutoCompleteProps } from './types';

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
    const overlayClassStack = useOverlayClassStackContext();
    const overlayClasses = useMemo(
        () => [...overlayClassStack, DROPDOWN_OVERLAY_CLASS_NAME].join(' '),
        [overlayClassStack],
    );

    const [internalOpen, setInternalOpen] = useState<boolean>(false);
    const { open } = props;

    useEffect(() => {
        if (open !== undefined) setInternalOpen(open);
    }, [open]);

    const updateOpenState = useCallback(
        (isOpen) => {
            if (open === undefined) setInternalOpen(isOpen);
            onDropdownVisibleChange?.(isOpen);
        },
        [open, onDropdownVisibleChange],
    );

    return (
        <ClickOutside
            onClickOutside={() => updateOpenState(false)}
            outsideSelector=".autocomplete-click-outside,.view-select-popover"
            // ignore content in the dropdown
            ignoreSelector={`.${DROPDOWN_OVERLAY_CLASS_NAME}`}
        >
            <AntdAutoComplete
                {...props}
                open={internalOpen}
                listHeight={dropdownContentHeight}
                data-testid={dataTestId}
                dropdownRender={(menu) => {
                    return (
                        <OverlayClassProvider overlayClassName={DROPDOWN_OVERLAY_CLASS_NAME}>
                            <DropdownWrapper className={overlayClasses}>
                                {props?.dropdownRender?.(menu) ?? menu}
                            </DropdownWrapper>
                        </OverlayClassProvider>
                    );
                }}
                dropdownAlign={{ ...(showWrapping ? DROPDOWN_ALIGN_WITH_WRAPPING : {}) }}
                dropdownStyle={{
                    ...(showWrapping
                        ? {
                              padding: spacing.xsm,
                              borderRadius: `${radius.none} ${radius.none} ${radius.lg} ${radius.lg}`,
                              backgroundColor: colors.gray[1500],
                              boxShadow: BOX_SHADOW,
                          }
                        : { borderRadius: radius.lg }),
                    ...(props?.dropdownStyle ?? {}),
                }}
                onClick={(event) => {
                    if (event.target instanceof Element) {
                        if (!event.target.closest('.autocomplete-children')) return null;

                        if (event.target.closest('.autocomplete-click-outside,.view-select-popover')) {
                            return null;
                        }
                    }
                    updateOpenState(true);
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                    if (event.key === 'Escape') {
                        if (internalOpen) updateOpenState(false);
                    }
                }}
            >
                <ChildrenWrapper $open={internalOpen} $showWrapping={showWrapping} className="autocomplete-children">
                    {children}
                </ChildrenWrapper>
            </AntdAutoComplete>
        </ClickOutside>
    );
}
