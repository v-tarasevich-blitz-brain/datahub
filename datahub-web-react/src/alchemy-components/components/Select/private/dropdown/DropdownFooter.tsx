import { Button } from '@components';
import { colors, spacing } from '@src/alchemy-components/theme';
import styled from 'styled-components';
import { SelectSizeOptions } from '../../types';

const FooterBase = styled.div({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTop: `1px solid ${colors.gray[100]}`,
});

interface DropdownFooter {
    onCancel?: () => void;
    onUpdate?: () => void;
    size?: SelectSizeOptions;
}

export default function DropdownFooter({ onCancel, onUpdate, size }: DropdownFooter) {
    return (
        <FooterBase>
            <Button onClick={onCancel} variant="text" size={size}>
                Cancel
            </Button>
            <Button onClick={onUpdate} size={size}>
                Update
            </Button>
        </FooterBase>
    );
}
