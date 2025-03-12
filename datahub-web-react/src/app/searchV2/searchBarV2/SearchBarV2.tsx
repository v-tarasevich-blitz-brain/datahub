import { CloseCircleFilled, SearchOutlined } from '@ant-design/icons';
import { colors, radius, spacing, transition } from '@src/alchemy-components';
import { AutoComplete } from '@src/alchemy-components/components/AutoComplete';
import { Input, Skeleton } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import styled from 'styled-components/macro';
import { EntityRegistry } from '../../../entityRegistryContext';
import { useListRecommendationsQuery } from '../../../graphql/recommendations.generated';
import { useQuickFiltersContext } from '../../../providers/QuickFiltersContext';
import { AutoCompleteResultForEntity, FacetFilterInput, ScenarioType } from '../../../types.generated';
import analytics, { Event, EventType } from '../../analytics';
import { useUserContext } from '../../context/useUserContext';
import { ANTD_GRAY_V2 } from '../../entity/shared/constants';
import { getEntityPath } from '../../entity/shared/containers/profile/utils';
import AutoCompleteResult from '../../entityV2/shared/components/AutoCompleteResult/AutoCompleteResult';
import AutocompleteFooter from '../../entityV2/shared/components/AutoCompleteResult/AutocompleteFooter';
import { REDESIGN_COLORS } from '../../entityV2/shared/constants';
import { ViewSelect } from '../../entityV2/view/select/ViewSelect';
import { V2_SEARCH_BAR_VIEWS } from '../../onboarding/configV2/HomePageOnboardingConfig';
import usePrevious from '../../shared/usePrevious';
import { useAppConfig, useIsShowSeparateSiblingsEnabled } from '../../useAppConfig';
import { CommandK } from '../CommandK';
import ViewAllSearchItem from '../ViewAllSearchItem';
import RecommendedOption from '../autoComplete/RecommendedOption';
import { EntityTypeLabel } from '../autoComplete/SectionHeader';
import SearchFilters from '../filtersPrototype/SearchFilters';
import { FiltersAppliedHandler } from '../filtersPrototype/types';
import useSearchViewAll from '../useSearchViewAll';
import { combineSiblingsInAutoComplete } from '../utils/combineSiblingsInAutoComplete';
import { EXACT_SEARCH_PREFIX } from '../utils/constants';
import filterSearchQuery from '../utils/filterSearchQuery';
import { getFiltersWithQuickFilter } from '../utils/filterUtils';
import AutocompletePlaceholder from './components/AutocompletePlaceholder';
import { BOX_SHADOW } from '@src/alchemy-components/components/AutoComplete/components';

const StyledAutoComplete = styled(AutoComplete)<{ $isShowNavBarRedesign?: boolean }>`
    width: 100%;
    max-width: ${(props) => (props.$isShowNavBarRedesign ? '632px' : '540px')};
`;

const SkeletonContainer = styled.div`
    height: 40px;
    width: 100%;
    max-width: 620px;
`;

const SkeletonButton = styled(Skeleton.Button)`
    &&& {
        height: inherit;
        width: inherit;
    }
`;

const AutoCompleteContainer = styled.div<{ viewsEnabled?: boolean; $isShowNavBarRedesign?: boolean }>`
    padding: 0 30px;
    align-items: center;
    border: ${(props) => (props.$isShowNavBarRedesign ? `2px solid ${colors.gray[100]}` : '2px solid transparent')};
    ${(props) => props.$isShowNavBarRedesign && 'box-shadow: 0px 1px 2px 0px rgba(33, 23, 95, 0.07)'};

    transition: border-color 0.3s ease;

    ${(props) =>
        props.viewsEnabled &&
        `
        border-radius: 8px;
        &:focus-within {
            border-color: ${props.$isShowNavBarRedesign ? colors.violet[300] : props.theme.styles['primary-color']};
        }
    `}
`;

export const Wrapper = styled.div<{ $open?: boolean; $showWrapping?: boolean }>`
    background: transparent;

    ${(props) =>
        props.$showWrapping &&
        `
        padding: ${radius.md};
        transition: all ${transition.easing['ease-in']} ${transition.duration.slow};
        border-radius: ${radius.lg} ${radius.lg} ${radius.none} ${radius.none};
    `}

    ${(props) =>
        props.$open &&
        props.$showWrapping &&
        `
        background: ${colors.gray[1500]};
        box-shadow: ${BOX_SHADOW};
    `}
`;

const StyledSearchBar = styled(Input)<{
    $textColor?: string;
    $placeholderColor?: string;
    viewsEnabled?: boolean;
    $isShowNavBarRedesign?: boolean;
}>`
    &&& {
        border-radius: 8px;
        height: 40px;
        font-size: 14px;
        color: #dcdcdc;
        background-color: ${ANTD_GRAY_V2[2]};
        border: 2px solid transparent;
        padding-right: 2.5px;
        ${(props) =>
            !props.viewsEnabled &&
            `
        &:focus-within {
            border-color: ${props.theme.styles['primary-color']};
        }`}

        width: 592px;
    }

    > .ant-input::placeholder {
        color: ${(props) =>
            props.$placeholderColor || (props.$isShowNavBarRedesign ? REDESIGN_COLORS.GREY_300 : '#dcdcdc')};
    }

    > .ant-input {
        color: ${(props) => props.$textColor || (props.$isShowNavBarRedesign ? '#000' : '#fff')};
    }

    .ant-input-clear-icon {
        height: 15px;
        width: 15px;
    }
`;

const ClearIcon = styled(CloseCircleFilled)`
    svg {
        height: 15px;
        width: 15px;
    }
`;

const ViewSelectContainer = styled.div`
    color: #fff;
    line-height: 20px;
    padding-right: 5.6px;

    &&& {
        border-left: 0px solid ${ANTD_GRAY_V2[5]};
    }
`;

const SearchIcon = styled(SearchOutlined)<{ $isShowNavBarRedesign?: boolean }>`
    color: ${(props) => (props.$isShowNavBarRedesign ? colors.gray[1800] : '#dcdcdc')};
    ${(props) =>
        props.$isShowNavBarRedesign &&
        `
        && svg {
            width: 16px;
            height: 16px;
        }
    `}
`;

const SearchFitlersContainer = styled.div`
    padding: 16px 8px;
`;

const DropdownContainer = styled.div`
    overflow: auto;
`;

const EXACT_AUTOCOMPLETE_OPTION_TYPE = 'exact_query';
const RELEVANCE_QUERY_OPTION_TYPE = 'recommendation';

const renderRecommendedQuery = (query: string) => {
    return {
        value: query,
        label: <RecommendedOption text={query} />,
        type: RELEVANCE_QUERY_OPTION_TYPE,
    };
};

interface Props {
    id?: string;
    isLoading?: boolean;
    initialQuery?: string;
    placeholderText: string;
    suggestions: Array<AutoCompleteResultForEntity>;
    onSearch: (query: string, filters?: FacetFilterInput[]) => void;
    onQueryChange?: (query: string) => void;
    style?: React.CSSProperties;
    inputStyle?: React.CSSProperties;
    autoCompleteStyle?: React.CSSProperties;
    entityRegistry: EntityRegistry;
    fixAutoComplete?: boolean;
    hideRecommendations?: boolean;
    showQuickFilters?: boolean;
    showCommandK?: boolean;
    viewsEnabled?: boolean;
    combineSiblings?: boolean;
    setIsSearchBarFocused?: (isSearchBarFocused: boolean) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    showViewAllResults?: boolean;
    textColor?: string;
    placeholderColor?: string;
    isShowNavBarRedesign?: boolean;
    onFilter?: FiltersAppliedHandler;
}

const defaultProps = {
    style: undefined,
};

/**
 * Represents the search bar appearing in the default header view.
 */
export const SearchBarV2 = ({
    id,
    isLoading,
    initialQuery,
    placeholderText,
    suggestions,
    onSearch,
    onQueryChange,
    onFilter,
    entityRegistry,
    style,
    inputStyle,
    autoCompleteStyle,
    fixAutoComplete,
    hideRecommendations,
    showQuickFilters,
    showCommandK = false,
    viewsEnabled = false,
    combineSiblings = false,
    setIsSearchBarFocused,
    onFocus,
    onBlur,
    showViewAllResults = false,
    textColor,
    placeholderColor,
    isShowNavBarRedesign,
}: Props) => {
    const history = useHistory();
    const [searchQuery, setSearchQuery] = useState<string | undefined>(initialQuery);
    const [selected, setSelected] = useState<string>();
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const appConfig = useAppConfig();
    const [isFocused, setIsFocused] = useState(false);
    const { quickFilters, selectedQuickFilter, setSelectedQuickFilter } = useQuickFiltersContext();
    const isShowSeparateSiblingsEnabled = useIsShowSeparateSiblingsEnabled();
    const userUrn = useUserContext().user?.urn;
    const finalCombineSiblings = isShowSeparateSiblingsEnabled ? false : combineSiblings;
    const searchViewAll = useSearchViewAll();
    const effectiveQuery = searchQuery !== undefined ? searchQuery : initialQuery || '';
    const showAutoCompleteResults = appConfig?.config?.featureFlags?.showAutoCompleteResults;
    const [appliedFilters, setAppliedFilters] = useState<FacetFilterInput[]>([]);

    const onFiltersApplied: FiltersAppliedHandler = useCallback(
        (newAppliedFilters) => {
            setAppliedFilters(
                Array.from(newAppliedFilters.entries())
                    .map(([_, value]) => value.filters)
                    .filter((filters) => filters.length > 0)
                    .flat(),
            );

            onFilter?.(newAppliedFilters);
        },
        [setAppliedFilters, onFilter],
    );

    useEffect(() => setSelected(initialQuery), [initialQuery]);

    // const { entities: recentlyViewedEntities, loading: isRecentlyViewedEntitiesLoading } = useRecentlyViewedEntities();
    // const recentlyViewedEntitiesOptions = useMemo(() => {
    //     if (recentlyViewedEntities.length === 0) return [];
    //     return [
    //         {
    //             label: <EntityTypeLabel>You Recently Viewed</EntityTypeLabel>,
    //             options: recentlyViewedEntities.map((entity) => {
    //                 // const combinedSuggestion = combineSiblingsInAutoComplete(suggestion, {
    //                 //     combineSiblings: finalCombineSiblings,
    //                 // });

    //                 return {
    //                     value: entity.urn,
    //                     label: (
    //                         <AutoCompleteResult
    //                             entity={entity}
    //                             query={effectiveQuery}
    //                             // siblings={finalCombineSiblings ? combinedEntity.matchedEntities : undefined}
    //                         />
    //                     ),
    //                     type: entity.type,
    //                     style: { padding: '0 8px' },
    //                 };

    //                 // return combinedSuggestion.combinedEntities.map((combinedEntity) => ({
    //                 //     value: combinedEntity.entity.urn,
    //                 //     label: (
    //                 //         <AutoCompleteResult
    //                 //             entity={entity}
    //                 //             query={effectiveQuery}
    //                 //             siblings={finalCombineSiblings ? combinedEntity.matchedEntities : undefined}
    //                 //         />
    //                 //     ),
    //                 //     type: combinedEntity.entity.type,
    //                 //     style: { padding: '0 8px' },
    //                 // }));
    //             }),
    //         },
    //     ];
    // }, [recentlyViewedEntities]);

    const { data: recommendationData } = useListRecommendationsQuery({
        variables: {
            input: {
                userUrn: userUrn as string,
                requestContext: {
                    scenario: ScenarioType.SearchBar,
                },
                limit: 1,
            },
        },
        skip: hideRecommendations || !userUrn,
    });

    const emptyQueryOptions = useMemo(() => {
        const moduleOptions =
            recommendationData?.listRecommendations?.modules?.map((module) => ({
                label: <EntityTypeLabel>{module.title}</EntityTypeLabel>,
                options: [...module.content.map((content) => renderRecommendedQuery(content.value))],
            })) || [];

        return moduleOptions;
    }, [recommendationData?.listRecommendations?.modules]);

    const viewAllResultsOptions = useMemo(() => {
        if (effectiveQuery === '' || !showViewAllResults) return [];

        return [
            {
                value: `${EXACT_SEARCH_PREFIX}${effectiveQuery}`,
                label: <ViewAllSearchItem searchTarget={effectiveQuery} />,
                type: EXACT_AUTOCOMPLETE_OPTION_TYPE,
            },
        ];
    }, [effectiveQuery, showViewAllResults]);

    // const ViewAllResultsOptions = useMemo(() => {
    //     if (effectiveQuery === '' || !showViewAllResults) return [];

    //     return [
    //         {
    //             value: `${EXACT_SEARCH_PREFIX}${effectiveQuery}`,
    //             label: <ViewAllSearchItem searchTarget={effectiveQuery} />,
    //             type: EXACT_AUTOCOMPLETE_OPTION_TYPE,
    //         },
    //     ];
    // }, [effectiveQuery, showViewAllResults]);

    const isSearching = useMemo(() => {
        const hasSearchQuery = searchQuery !== undefined && searchQuery !== '';
        const hasAnyAppliedFilters = appliedFilters.length > 0;

        return hasSearchQuery || hasAnyAppliedFilters;
    }, [searchQuery, appliedFilters]);

    const hasAutocompleteResults = useMemo(() => suggestions.length > 0, [suggestions.length]);

    const autoCompleteEntityOptions = useMemo(() => {
        if (!hasAutocompleteResults) return [];
        if (!searchQuery) return [];

        return [
            {
                label: <EntityTypeLabel>Best Matches</EntityTypeLabel>,
                options: suggestions
                    .map((suggestion: AutoCompleteResultForEntity) => {
                        const combinedSuggestion = combineSiblingsInAutoComplete(suggestion, {
                            combineSiblings: finalCombineSiblings,
                        });

                        return combinedSuggestion.combinedEntities.map((combinedEntity) => ({
                            value: combinedEntity.entity.urn,
                            label: (
                                <AutoCompleteResult
                                    entity={combinedEntity.entity}
                                    query={effectiveQuery}
                                    siblings={finalCombineSiblings ? combinedEntity.matchedEntities : undefined}
                                />
                            ),
                            type: combinedEntity.entity.type,
                            style: { padding: '0 8px' },
                        }));
                    })
                    .flat(),
            },
        ];
    }, [finalCombineSiblings, effectiveQuery, suggestions, hasAutocompleteResults, searchQuery]);

    const previousSelectedQuickFilterValue = usePrevious(selectedQuickFilter?.value);

    useEffect(() => {
        // if we change the selected quick filter, re-issue auto-complete
        if (searchQuery && selectedQuickFilter?.value !== previousSelectedQuickFilterValue) {
            onQueryChange?.(searchQuery);
        }
    });

    // clear quick filters when this search bar is unmounted (ie. going from search results to home page)
    useEffect(() => {
        return () => {
            setSelectedQuickFilter(null);
        };
    }, [setSelectedQuickFilter]);

    const onClickExploreAll = useCallback(() => {
        searchViewAll();
        setIsDropdownVisible(false);
    }, [searchViewAll]);

    const options = useMemo(() => {
        if (showAutoCompleteResults) {
            if (!hasAutocompleteResults) return [];
            return [...viewAllResultsOptions, ...autoCompleteEntityOptions];
        }

        return emptyQueryOptions;

        // const autoCompleteOptions =
        //     showAutoCompleteResults && autoCompleteEntityOptions.length ? autoCompleteEntityOptions : emptyQueryOptions;
        // const baseOptions: any[] = [...autoCompleteQueryOptions, ...autoCompleteOptions];
        // return baseOptions;
    }, [
        hasAutocompleteResults,
        emptyQueryOptions,
        autoCompleteEntityOptions,
        viewAllResultsOptions,
        // recentlyViewedEntitiesOptions,
        showViewAllResults,
        showAutoCompleteResults,
        onClickExploreAll,
    ]);

    const searchBarWrapperRef = useRef<HTMLDivElement>(null);

    function handleSearchBarClick(isSearchBarFocused: boolean) {
        if (
            setIsSearchBarFocused &&
            (!isSearchBarFocused ||
                (searchBarWrapperRef && searchBarWrapperRef.current && searchBarWrapperRef.current.clientWidth < 650))
        ) {
            setIsSearchBarFocused(isSearchBarFocused);
        }
    }

    function handleFocus() {
        if (onFocus) onFocus();
        handleSearchBarClick(true);
        setIsFocused(true);
    }

    function handleBlur() {
        if (onBlur) onBlur();
        handleSearchBarClick(false);
        setIsFocused(false);
    }

    function handleSearch(query: string, appliedQuickFilters?: FacetFilterInput[]) {
        onSearch(query, appliedQuickFilters);
        if (selectedQuickFilter) {
            setSelectedQuickFilter(null);
        }
    }

    const searchInputRef = useRef(null);

    useEffect(() => {
        if (showCommandK) {
            const handleKeyDown = (event) => {
                const isMac = (navigator as any).userAgentData
                    ? (navigator as any).userAgentData.platform.toLowerCase().includes('mac')
                    : navigator.userAgent.toLowerCase().includes('mac');

                // Support command-k to select the search bar on all platforms
                // Support ctrl-k to select the search bar on non-Mac platforms
                // 75 is the keyCode for 'k'
                if ((event.metaKey || (!isMac && event.ctrlKey)) && event.keyCode === 75) {
                    (searchInputRef?.current as any)?.focus();
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
        return () => null;
    }, [showCommandK]);

    const viewsEnabledStyle = {
        ...style,
        backgroundColor: inputStyle?.backgroundColor,
    };

    return (
        <>
            {isLoading ? (
                <SkeletonContainer>
                    <SkeletonButton shape="square" active block />
                </SkeletonContainer>
            ) : (
                <Wrapper $open={isDropdownVisible} $showWrapping>
                    <AutoCompleteContainer
                        viewsEnabled={viewsEnabled}
                        $isShowNavBarRedesign={isShowNavBarRedesign}
                        id={id}
                        style={viewsEnabled ? viewsEnabledStyle : style}
                        ref={searchBarWrapperRef}
                    >
                        <StyledAutoComplete
                            dataTestId="search-bar"
                            $isShowNavBarRedesign={isShowNavBarRedesign}
                            defaultActiveFirstOption={false}
                            style={autoCompleteStyle}
                            options={options}
                            filterOption={false}
                            dropdownRender={(props) => {
                                return (
                                    <DropdownContainer>
                                        {isSearching && (
                                            <SearchFitlersContainer>
                                                <SearchFilters
                                                    query={searchQuery ?? ''}
                                                    onFiltersApplied={onFiltersApplied}
                                                />
                                            </SearchFitlersContainer>
                                        )}
                                        {props}
                                        <AutocompleteFooter />
                                    </DropdownContainer>
                                );
                            }}
                            notFoundContent={<AutocompletePlaceholder isSearching={isSearching} />}
                            onSelect={(value, option) => {
                                // If the autocomplete option type is NOT an entity, then render as a normal search query.
                                if (
                                    option.type === EXACT_AUTOCOMPLETE_OPTION_TYPE ||
                                    option.type === RELEVANCE_QUERY_OPTION_TYPE
                                ) {
                                    handleSearch(`${filterSearchQuery(value as string)}`, appliedFilters);
                                    analytics.event({
                                        type: EventType.SelectAutoCompleteOption,
                                        optionType: option.type,
                                    } as Event);
                                } else {
                                    // Navigate directly to the entity profile.
                                    history.push(
                                        getEntityPath(option.type, value as string, entityRegistry, false, false),
                                    );
                                    setSelected('');
                                    analytics.event({
                                        type: EventType.SelectAutoCompleteOption,
                                        optionType: option.type,
                                        entityType: option.type,
                                        entityUrn: value,
                                    } as Event);
                                }
                            }}
                            onSearch={showAutoCompleteResults ? onQueryChange : undefined}
                            defaultValue={initialQuery || undefined}
                            value={selected}
                            onChange={(v) => setSelected(filterSearchQuery(v as string))}
                            dropdownAlign={{
                                points: ['bc', 'tc'],
                                offset: [22, -4],
                                // targetOffset: [0, 0],
                                // overflow: { adjustX: false, adjustY: false },
                            }}
                            dropdownStyle={{
                                maxHeight: 1000,
                                overflowY: 'visible',
                                position: (fixAutoComplete && 'fixed') || 'relative',
                                // ...(isShowNavBarRedesign ? { minWidth: '648px' } : {}),
                                backgroundColor: colors.gray[1500],
                                borderRadius: `${radius.none} ${radius.none} ${radius.lg} ${radius.lg}`,
                                boxShadow: BOX_SHADOW,
                                // width: '690px',
                                padding: spacing.xsm,
                                minWidth: '648px',
                                // marginTop: '50px',
                            }}
                            onDropdownVisibleChange={(isOpen) => {
                                if (!isOpen) {
                                    // debugger;
                                    setIsDropdownVisible(isOpen);
                                } else {
                                    // set timeout so that we allow search bar to grow in width and therefore allow autocomplete to grow
                                    setTimeout(() => {
                                        setIsDropdownVisible(isOpen);
                                    }, 0);
                                }
                            }}
                            open={isDropdownVisible}
                            // listHeight={480}
                            dropdownContentHeight={480}
                            showWrapping
                        >
                            <StyledSearchBar
                                // onFocusCapture={(event) => {
                                //     if (event.target instanceof Element) {
                                //         if (event.target.closest('.view-select-container')) return null;
                                //     }
                                //     setIsDropdownVisible(true);
                                // }}
                                bordered={false}
                                placeholder={placeholderText}
                                onPressEnter={() => {
                                    handleSearch(
                                        filterSearchQuery(searchQuery || ''),
                                        getFiltersWithQuickFilter(selectedQuickFilter),
                                    );
                                }}
                                style={{ ...inputStyle, color: '#fff' }}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    // setIsDropdownVisible(true);
                                }}
                                data-testid="search-input"
                                // onFocus={handleFocus}
                                // onBlur={handleBlur}
                                viewsEnabled={viewsEnabled}
                                $isShowNavBarRedesign={isShowNavBarRedesign}
                                allowClear={(isDropdownVisible && { clearIcon: <ClearIcon /> }) || false}
                                prefix={
                                    <>
                                        <SearchIcon
                                            $isShowNavBarRedesign={isShowNavBarRedesign}
                                            onClick={() => {
                                                handleSearch(
                                                    filterSearchQuery(searchQuery || ''),
                                                    getFiltersWithQuickFilter(selectedQuickFilter),
                                                );
                                            }}
                                        />
                                    </>
                                }
                                ref={searchInputRef}
                                suffix={<>{(showCommandK && !isDropdownVisible && <CommandK />) || null}</>}
                                $textColor={textColor}
                                $placeholderColor={placeholderColor}
                                width={'592px'}
                            />
                        </StyledAutoComplete>
                        {viewsEnabled && (
                            <ViewSelectContainer id={V2_SEARCH_BAR_VIEWS} className="view-select-container">
                                <ViewSelect onOpenChange={() => setIsDropdownVisible(false)} />
                            </ViewSelectContainer>
                        )}
                    </AutoCompleteContainer>
                </Wrapper>
            )}
        </>
    );
};

SearchBarV2.defaultProps = defaultProps;
