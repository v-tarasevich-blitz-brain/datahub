import { AutoComplete as AntdAutoComplete } from 'antd';
import React, { createContext, Ref, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { colors, spacing } from '@src/alchemy-components/theme';
import radius from '@src/alchemy-components/theme/foundations/radius';
import { BOX_SHADOW, ChildrenWrapper, DropdownWrapper } from './components';
import { AutoCompleteProps } from './types';
import { createPortal } from 'react-dom';
import ClickOutside from '../Utils/ClickOutside';
// import ClickOutside from '@src/app/shared/ClickOutside';

// Additional offset to handle wrapper's padding (when `showWrapping` is enabled)
const DROPDOWN_ALIGN_WITH_WRAPPING = { offset: [0, -8] };

const AutoCompleteContext = createContext<{
    portal: HTMLElement | null;
    test: string;
}>({
    portal: null,
    test: 'testString',
});

export default function AutoComplete({
    children,
    showWrapping,
    dropdownContentHeight,
    dataTestId,
    onDropdownVisibleChange,
    ...props
}: React.PropsWithChildren<AutoCompleteProps>) {
    const [internalOpen, setInternalOpen] = useState<boolean>(false);
    const { open } = props;

    useEffect(() => {
        // console.log('>>> Sync internal and open', {open})
        if (open !== undefined) setInternalOpen(open);
    }, [open]);

    const updateOpenState = useCallback(
        (isOpen) => {
            // if (isOpen === true) debugger;
            // console.log('>>> updateOpenState CALL', {isOpen, open});
            if (open === undefined) setInternalOpen(isOpen);
            // if (open !== undefined) setInternalOpen(open);
            // console.trace('>>> updateOpenState trace');
            onDropdownVisibleChange?.(isOpen);
        },
        [open, onDropdownVisibleChange],
    );

    // // const portalRef = useRef<HTMLDivElement>(null);
    // const subPortalRef = useRef<HTMLDivElement>(null);

    // console.log('>>> autocomplete', { internalOpen, open });
    return (
        <ClickOutside
            onClickOutside={() => {
                // console.log('>>> onClickOutside CALL')
                updateOpenState(false);
            }}
            wrapperClassName="autocomplete"
            outsideSelector=".autocomplete-click-outside,.view-select-popover"
            ignoreSelector=".autocomplete-click-outside-ignore"
        >
            <AntdAutoComplete
                {...props}
                open={internalOpen}
                listHeight={dropdownContentHeight}
                data-testid={dataTestId}
                dropdownRender={(menu) => {
                    return (
                        <DropdownWrapper className="autocomplete-click-outside-ignore">
                            {props?.dropdownRender?.(menu) ?? menu}
                        </DropdownWrapper>
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
                            // console.log('>>> updateOpenState true IGNORED');
                            return null;
                        }
                    }
                    // console.log('>>> updateOpenState true');
                    updateOpenState(true);
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                    // console.log('>>> onKeyDown', event)
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
