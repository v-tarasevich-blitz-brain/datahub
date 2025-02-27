import { Dropdown as AntdDropdown } from 'antd';
import { DropdownProps } from './types';
import React from 'react';

export default function Dropdown({children, className, ...props}: React.PropsWithChildren<DropdownProps>) {
    return <AntdDropdown {...props} trigger={['click']}>{children}</AntdDropdown>
}
