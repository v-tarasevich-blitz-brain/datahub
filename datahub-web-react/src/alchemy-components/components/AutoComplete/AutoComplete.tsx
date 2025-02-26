import { AutoComplete as AntdAutoComplete } from 'antd';
import React, { createContext, Ref, RefObject, useRef } from 'react';
import { colors, spacing } from '@src/alchemy-components/theme';
import radius from '@src/alchemy-components/theme/foundations/radius';
import { BOX_SHADOW, ChildrenWrapper, DropdownWrapper } from './components';
import { AutoCompleteProps } from './types';
import { createPortal } from 'react-dom';

// Additional offset to handle wrapper's padding (when `showWrapping` is enabled)
const DROPDOWN_ALIGN_WITH_WRAPPING = { offset: [0, -8] };

export const AutoCompleteContext = createContext<{
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
    ...props
}: React.PropsWithChildren<AutoCompleteProps>) {
    const { open } = props;

    const portalRef = useRef<HTMLDivElement>(null);
    const subPortalRef = useRef<HTMLDivElement>(null);

    console.log('>>> autocomplete', { portalRef: portalRef.current, subPortalRef: subPortalRef.current });
    return (
        <div>
            {createPortal(
                <div id="autocompleteRefTest">
                    <div id="main" ref={portalRef} />
                </div>,
                document.body,
            )}
            <AntdAutoComplete
                {...props}
                listHeight={dropdownContentHeight}
                data-testid={dataTestId}
                dropdownRender={(menu) => {
                    return (
                        <>
                        {createPortal(<div id="subportal" ref={subPortalRef} />, portalRef.current || document.body)}
                            <AutoCompleteContext.Provider value={{ portal: subPortalRef.current, test: 'testString2' }}>
                                <DropdownWrapper>{props?.dropdownRender?.(menu) ?? menu}</DropdownWrapper>
                            </AutoCompleteContext.Provider>
                        </>
                    );
                }}
                getPopupContainer={() => portalRef.current}
                virtual={false}
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
                onBlur={(event) => {console.log('>>> blur', event); event.preventDefault(); event.stopPropagation();}}
            >
                <ChildrenWrapper $open={open} $showWrapping={showWrapping}>
                    <AutoCompleteContext.Provider value={{ portal: subPortalRef.current, test: 'testString2' }}>
                        {children}
                    </AutoCompleteContext.Provider>
                </ChildrenWrapper>
            </AntdAutoComplete>
        </div>
    );
}
