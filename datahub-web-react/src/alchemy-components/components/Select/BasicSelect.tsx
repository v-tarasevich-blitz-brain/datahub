import { Button, Text } from '@components';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActionButtonsContainer,
    Container,
    Dropdown,
    FooterBase,
    LabelContainer,
    OptionContainer,
    OptionLabel,
    OptionList,
    SearchIcon,
    SearchInput,
    SearchInputContainer,
    SelectAllOption,
    SelectBase,
    SelectLabel,
    SelectLabelContainer,
    StyledCancelButton,
    StyledCheckbox,
    StyledClearButton,
    StyledIcon,
} from './components';
import SelectLabelRenderer from './private/SelectLabelRenderer/SelectLabelRenderer';
import { ActionButtonsProps, SelectOption, SelectProps } from './types';
import { getFooterButtonSize } from './utils';
import { basicSelectDefaults, selectDefaults } from './defaults';

const SelectActionButtons = ({
    selectedValues,
    isOpen,
    isDisabled,
    isReadOnly,
    showClear,
    handleClearSelection,
}: ActionButtonsProps) => {
    return (
        <ActionButtonsContainer>
            {showClear && selectedValues.length > 0 && !isDisabled && !isReadOnly && (
                <StyledClearButton icon="Close" isCircle onClick={handleClearSelection} iconSize="lg" />
            )}
            <StyledIcon icon="ChevronLeft" rotate={isOpen ? '90' : '270'} size="lg" />
        </ActionButtonsContainer>
    );
};

export const BasicSelect = ({
    options = basicSelectDefaults.options,
    label = basicSelectDefaults.label,
    values = [],
    initialValues,
    onCancel,
    onUpdate,
    showSearch = basicSelectDefaults.showSearch,
    isDisabled = basicSelectDefaults.isDisabled,
    isReadOnly = basicSelectDefaults.isReadOnly,
    isRequired = basicSelectDefaults.isRequired,
    showClear = basicSelectDefaults.showClear,
    size = basicSelectDefaults.size,
    isMultiSelect = basicSelectDefaults.isMultiSelect,
    placeholder = basicSelectDefaults.placeholder,
    disabledValues = [],
    showSelectAll = basicSelectDefaults.showSelectAll,
    selectAllLabel = basicSelectDefaults.selectAllLabel,
    showDescriptions = basicSelectDefaults.showDescriptions,
    icon,
    ...props
}: SelectProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState<string[]>(initialValues || values);
    const [tempValues, setTempValues] = useState<string[]>(values);
    const selectRef = useRef<HTMLDivElement>(null);
    const [areAllSelected, setAreAllSelected] = useState(false);

    useEffect(() => {
        if (values?.length > 0 && !isEqual(selectedValues, values)) {
            setSelectedValues(values);
        }
    }, [values, selectedValues]);

    useEffect(() => {
        setAreAllSelected(tempValues.length === options.length);
    }, [options, tempValues]);

    const filteredOptions = useMemo(
        () => options.filter((option) => {
            if (typeof option.label === 'string') {
                return option.label.toLowerCase().includes(searchQuery.toLowerCase());
            }

            return option?.filter?.(option, searchQuery) ?? false;
        }),
        [options, searchQuery],
    );

    const handleDocumentClick = useCallback((e: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('click', handleDocumentClick);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [handleDocumentClick]);

    const handleSelectClick = useCallback(() => {
        if (!isDisabled && !isReadOnly) {
            setTempValues(selectedValues);
            setIsOpen((prev) => !prev);
        }
    }, [isDisabled, isReadOnly, selectedValues]);

    const handleOptionChange = useCallback(
        (option: SelectOption) => {
            const updatedValues = tempValues.includes(option.value)
                ? tempValues.filter((val) => val !== option.value)
                : [...tempValues, option.value];

            setTempValues(isMultiSelect ? updatedValues : [option.value]);
        },
        [tempValues, isMultiSelect],
    );

    const removeOption = useCallback(
        (option: SelectOption) => {
            const updatedValues = selectedValues.filter((val) => val !== option.value);
            setSelectedValues(updatedValues);
        },
        [selectedValues],
    );

    const handleUpdateClick = useCallback(() => {
        setSelectedValues(tempValues);
        setIsOpen(false);
        if (onUpdate) {
            onUpdate(tempValues);
        }
    }, [tempValues, onUpdate]);

    const handleCancelClick = useCallback(() => {
        setIsOpen(false);
        setTempValues(selectedValues);
        if (onCancel) {
            onCancel();
        }
    }, [selectedValues, onCancel]);

    const handleClearSelection = useCallback(() => {
        setSelectedValues([]);
        setAreAllSelected(false);
        setTempValues([]);
        setIsOpen(false);
        if (onUpdate) {
            onUpdate([]);
        }
    }, [onUpdate]);

    const handleSelectAll = () => {
        if (areAllSelected) {
            setTempValues([]);
            onUpdate?.([]);
        } else {
            const allValues = options.map((option) => option.value);
            setTempValues(allValues);
            onUpdate?.(allValues);
        }
        setAreAllSelected(!areAllSelected);
    };

    return (
        <Container ref={selectRef} size={size || 'md'} width={props.width}>
            {label && <SelectLabel onClick={handleSelectClick}>{label}</SelectLabel>}
            <SelectBase
                isDisabled={isDisabled}
                isReadOnly={isReadOnly}
                isRequired={isRequired}
                isOpen={isOpen}
                onClick={handleSelectClick}
                fontSize={size}
                {...props}
            >
                <SelectLabelContainer>
                    {icon && <StyledIcon icon={icon} size="lg" />}
                    <SelectLabelRenderer
                        selectedValues={selectedValues}
                        options={options}
                        placeholder={placeholder || 'Select an option'}
                        isMultiSelect={isMultiSelect}
                        removeOption={removeOption}
                        disabledValues={disabledValues}
                        showDescriptions={showDescriptions}
                    />
                </SelectLabelContainer>
                <SelectActionButtons
                    selectedValues={selectedValues}
                    isOpen={isOpen}
                    isDisabled={!!isDisabled}
                    isReadOnly={!!isReadOnly}
                    handleClearSelection={handleClearSelection}
                    showClear={!!showClear}
                />
            </SelectBase>
            {isOpen && (
                <Dropdown>
                    <div style={{position: 'relative', zIndex:1000}}>
                    {showSearch && (
                        <SearchInputContainer>
                            <SearchInput
                                type="text"
                                placeholder="Search…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ fontSize: size || 'md' }}
                            />
                            <SearchIcon icon="Search" size={size} color="gray" />
                        </SearchInputContainer>
                    )}
                    <OptionList>
                        {showSelectAll && isMultiSelect && (
                            <SelectAllOption
                                isSelected={areAllSelected}
                                onClick={() => !(disabledValues.length === options.length) && handleSelectAll()}
                                isDisabled={disabledValues.length === options.length}
                            >
                                <LabelContainer>
                                    <span>{selectAllLabel}</span>
                                    <StyledCheckbox
                                        checked={areAllSelected}
                                        disabled={disabledValues.length === options.length}
                                    />
                                </LabelContainer>
                            </SelectAllOption>
                        )}
                        {filteredOptions.map((option) => (
                            <OptionLabel
                                key={option.value}
                                onClick={() => !isMultiSelect && handleOptionChange(option)}
                                isSelected={tempValues.includes(option.value)}
                                isMultiSelect={isMultiSelect}
                                isDisabled={disabledValues?.includes(option.value)}
                            >
                                {isMultiSelect ? (
                                    <LabelContainer>
                                        <span>{option.label}</span>
                                        <StyledCheckbox
                                            onClick={() => handleOptionChange(option)}
                                            checked={tempValues.includes(option.value)}
                                            disabled={disabledValues?.includes(option.value)}
                                        />
                                    </LabelContainer>
                                ) : (
                                    <OptionContainer>
                                        <ActionButtonsContainer>
                                            {option.icon}
                                            <Text
                                                color={selectedValues.includes(option.value) ? 'violet' : 'gray'}
                                                weight="semiBold"
                                                size="md"
                                            >
                                                {option.label}
                                            </Text>
                                        </ActionButtonsContainer>
                                        {!!option.description && (
                                            <Text color="gray" weight="normal" size="sm">
                                                {option.description}
                                            </Text>
                                        )}
                                    </OptionContainer>
                                )}
                            </OptionLabel>
                        ))}
                    </OptionList>
                    <FooterBase>
                        <StyledCancelButton
                            onClick={handleCancelClick}
                            variant="filled"
                            size={getFooterButtonSize(size)}
                        >
                            Cancel
                        </StyledCancelButton>
                        <Button onClick={handleUpdateClick} size={getFooterButtonSize(size)}>
                            Update
                        </Button>
                    </FooterBase>
                    </div>
                </Dropdown>
            )}
        </Container>
    );
};

export default BasicSelect;
