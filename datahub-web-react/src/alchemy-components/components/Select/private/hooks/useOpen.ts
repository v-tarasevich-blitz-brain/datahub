import { useCallback, useState } from 'react';

export default function useOpen(defaultOpen: boolean) {
    const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

    const open = useCallback(() => setIsOpen(true), []);

    const close = useCallback(() => setIsOpen(false), []);

    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    return {isOpen, open, close, toggle}
}
