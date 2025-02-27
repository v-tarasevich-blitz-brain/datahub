import { MenuProps } from "antd";
import React from "react";

export interface DropdownProps {
    overlayClassName?: string;
    className?: string;
    menu?: MenuProps;
    dropdownRender?: (menus: React.ReactNode) => React.ReactNode
}
