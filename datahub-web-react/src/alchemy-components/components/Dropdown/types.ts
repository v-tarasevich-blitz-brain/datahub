import { MenuProps } from "antd";
import React from "react";

export interface DropdownProps {
    open?: boolean;
    overlayClassName?: string;
    className?: string;
    menu?: MenuProps;
    dropdownRender?: (menus: React.ReactNode) => React.ReactNode;
    onOpenChange?: (open: boolean) => void;
}
