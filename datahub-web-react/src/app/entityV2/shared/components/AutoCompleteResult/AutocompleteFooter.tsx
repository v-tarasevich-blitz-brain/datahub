import { colors, Text } from '@src/alchemy-components';
import { ArrowDown, ArrowElbowDownLeft, ArrowUp } from 'phosphor-react';
import styled from 'styled-components';

const Container = styled.div`
    position: sticky;
    bottom: 0;

    border-top: 1px solid ${colors.gray[100]};
    border-radius: 0 0 12px 12px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;

    background-color: ${colors.white};
    /* background-color: red; */
    height: 36px;
    width: 100%;

    padding: 8px 16px;
`;

const IconContainer = styled.div`
    height: 24px;
    width: 32px;
    border: 1px solid ${colors.gray[100]};
    border-radius: 4px;
    padding: 4px 8px;

    & svg {
        color: ${colors.gray[500]};
    }
`;

const KeySuggestion = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
`;

export default function AutocompleteFooter() {
    // TODO:: add logic when item is selected
    return (
        <Container>
            <KeySuggestion>
                <IconContainer>
                    <ArrowUp size={16} />
                </IconContainer>
                <IconContainer>
                    <ArrowDown size={16} />
                </IconContainer>
                <Text color="gray" size="sm" weight="semiBold">
                    Navigate
                </Text>
            </KeySuggestion>

            <KeySuggestion>
                <IconContainer>
                    <ArrowElbowDownLeft size={16} />
                </IconContainer>
                <Text color="gray" size="sm" weight="semiBold">
                    Search All
                </Text>
            </KeySuggestion>
        </Container>
    );
}
