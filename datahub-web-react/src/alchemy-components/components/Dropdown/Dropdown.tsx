import { Dropdown as AntdDropdown } from 'antd';
import React from 'react';
import { DropdownProps } from './types';

export default function Dropdown({ children, className, ...props }: React.PropsWithChildren<DropdownProps>) {
    return (
        <AntdDropdown
            trigger={['click']}
            // autoAdjustOverflow={false}
            // getPopupContainer={(trigger) => {
            //     console.log('>> AC DD trigger', trigger);
            //     return document.body;
            // }}
            {...props}
        >
            {children}
        </AntdDropdown>
    );
}
