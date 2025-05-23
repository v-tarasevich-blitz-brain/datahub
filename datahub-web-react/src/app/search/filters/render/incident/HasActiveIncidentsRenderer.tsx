import { WarningOutlined } from '@ant-design/icons';
import React from 'react';

import { FilterRenderer } from '@app/search/filters/render/FilterRenderer';
import { HasActiveIncidentsFilter } from '@app/search/filters/render/incident/HasActiveIncidentsFilter';
import { FilterRenderProps } from '@app/search/filters/render/types';

export class HasActiveIncidentsRenderer implements FilterRenderer {
    field = 'hasActiveIncidents';

    render = (props: FilterRenderProps) => <HasActiveIncidentsFilter {...props} icon={this.icon()} />;

    icon = () => <WarningOutlined />;

    valueLabel = (value: string) => {
        if (value === 'true') {
            return <>Has Active Incidents</>;
        }
        return <>Has Resolved Incidents</>;
    };
}
