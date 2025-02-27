import { AutoComplete as AntdAutoComplete } from 'antd';
import React, { createContext, Ref, RefObject, useRef, useState } from 'react';
import { colors, spacing } from '@src/alchemy-components/theme';
import radius from '@src/alchemy-components/theme/foundations/radius';
import { BOX_SHADOW, ChildrenWrapper, DropdownWrapper } from './components';
import { AutoCompleteProps } from './types';
import { createPortal } from 'react-dom';
import ClickOutside from '../Utils/ClickOutside';
// import ClickOutside from '@src/app/shared/ClickOutside';

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
    const [internalOpen, setInternalOpen] = useState<boolean>(false);


    const { open } = props;



    const portalRef = useRef<HTMLDivElement>(null);
    const subPortalRef = useRef<HTMLDivElement>(null);

    console.log('>>> autocomplete', { portalRef: portalRef.current, subPortalRef: subPortalRef.current });
    return (
        <ClickOutside onClickOutside={() => {setInternalOpen(false); console.log('>>> click outside')}} wrapperClassName='autocomplete'>
            {/* {createPortal(
                <div id="autocompleteRefTest">
                    <div id="main" ref={portalRef} />
                </div>,
                document.body,
            )} */}
            <AntdAutoComplete
                {...props}
                open={internalOpen}
                listHeight={dropdownContentHeight}
                data-testid={dataTestId}
                dropdownRender={(menu) => {
                    return (
                        <>
                            {/* {createPortal(
                                <div id="subportal" ref={subPortalRef} />,
                                portalRef.current || document.body,
                            )} */}
                            <AutoCompleteContext.Provider value={{ portal: subPortalRef.current, test: 'testString2' }}>
                                <DropdownWrapper className='autocomplete'>{props?.dropdownRender?.(menu) ?? menu}</DropdownWrapper>
                            </AutoCompleteContext.Provider>
                        </>
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
                onClick={() => setInternalOpen(true)}
                // onBlur={(event) => {
                //     console.log('>>> blur', event);
                //     event.preventDefault();
                //     event.stopPropagation();
                // }}
            >
                <ChildrenWrapper $open={internalOpen} $showWrapping={showWrapping} className='autocomplete'>
                    {children}
                </ChildrenWrapper>
            </AntdAutoComplete>
        </ClickOutside>
    );
}
