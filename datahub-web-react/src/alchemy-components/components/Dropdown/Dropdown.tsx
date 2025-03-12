import { Dropdown as AntdDropdown } from 'antd';
import React from 'react';
import { DropdownProps } from './types';

export default function Dropdown({children, className, ...props}: React.PropsWithChildren<DropdownProps>) {
    return <AntdDropdown {...props} trigger={['click']}>{children}</AntdDropdown>
}
