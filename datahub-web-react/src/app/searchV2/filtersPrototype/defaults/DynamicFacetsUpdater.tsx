import { FacetFilterInput } from "@src/types.generated";
import { FieldName } from "../types";

interface DynamicFacetsUpdaterProps {
    fieldNames: FieldName[],
    appliedFilters: FacetFilterInput[],
    // TODO: >>> pass facets for each field
    onUpdateFacets?: () => void;
}

function FieldFacetUpdater({fieldName, appliedFilters}: {fieldName: FieldName, appliedFilters: FacetFilterInput[]}) {
    // TODO: >>> call aggregateAcross..

    return null;
}

export default function DynamicFacetsUpdater({fieldNames, appliedFilters}: DynamicFacetsUpdaterProps) {
    return <>
        {fieldNames.map(fieldName => <FieldFacetUpdater fieldName={fieldName} appliedFilters={appliedFilters}/>)}
    </>
}
