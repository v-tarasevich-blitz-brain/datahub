import { Typography } from 'antd';
import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    > .ant-typography {
        margin-bottom: 0;
    }
`;

type Props = {
    title: string;
    titleComponent?: React.ReactNode;
    actions?: React.ReactNode;
    children?: React.ReactNode;
};

export const SidebarHeader = ({ title, titleComponent, actions, children }: Props) => {
    return (
        <HeaderContainer>
            {titleComponent || <Typography.Title level={5}>{title}</Typography.Title>}
            {actions && <div>{actions}</div>}
            {children}
        </HeaderContainer>
    );
};
