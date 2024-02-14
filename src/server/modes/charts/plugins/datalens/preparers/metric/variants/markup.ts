import {dateTime} from '@gravity-ui/date-utils';

import {
    CommonNumberFormattingOptions,
    MINIMUM_FRACTION_DIGITS,
    MarkupItem,
    ServerCommonSharedExtraSettings,
    ServerField,
    formatNumber,
    getFakeTitleOrTitle,
    isDateField,
} from '../../../../../../../../shared';
import {isFloatDataType, isNumericalDataType} from '../../../utils/misc-helpers';

export const prepareMarkupMetricVariant = ({
    measure,
    value,
    extraSettings,
}: {
    measure: ServerField;
    value: string | MarkupItem | null;
    extraSettings: ServerCommonSharedExtraSettings | undefined;
}) => {
    if (!measure) {
        return {};
    }

    const title =
        extraSettings && extraSettings.title && extraSettings.titleMode === 'show'
            ? extraSettings.title
            : getFakeTitleOrTitle(measure);

    if (typeof value === 'object') {
        if (title) {
            return {
                value: {
                    type: 'concat',
                    children: [
                        {
                            type: 'size',
                            size: '16px',
                            content: {
                                className: 'markup-metric-title',
                                type: 'text',
                                content: title,
                            },
                        },
                        {
                            type: 'br',
                        },
                        value,
                    ],
                },
            };
        } else {
            return {value};
        }
    } else {
        const size = (extraSettings && extraSettings.metricFontSize) || 'm';
        const color = (extraSettings && extraSettings.metricFontColor) || 'rgb(77, 162, 241)';

        const formatOptions: CommonNumberFormattingOptions = {};

        let formattedValue = String(value);

        if (isNumericalDataType(measure.data_type)) {
            const measureFormatting = measure.formatting as
                | CommonNumberFormattingOptions
                | undefined;

            if (measureFormatting) {
                formatOptions.format = measureFormatting.format;
                formatOptions.postfix = measureFormatting.postfix;
                formatOptions.prefix = measureFormatting.prefix;
                formatOptions.showRankDelimiter = measureFormatting.showRankDelimiter;
                formatOptions.unit = measureFormatting.unit;
                formatOptions.precision =
                    isFloatDataType(measure.data_type) &&
                    typeof measureFormatting.precision !== 'number'
                        ? MINIMUM_FRACTION_DIGITS
                        : measureFormatting.precision;
            } else if (isFloatDataType(measure.data_type)) {
                formatOptions.precision = MINIMUM_FRACTION_DIGITS;
            }

            formattedValue = formatNumber(value, formatOptions);
        } else if (isDateField(measure) && measure.format) {
            formattedValue = dateTime({input: value}).format(measure.format);
        }

        return {
            value: {
                type: 'concat',
                className: `markup-metric markup-metric_size_${size}`,
                children: [
                    {
                        className: 'markup-metric-title',
                        type: 'text',
                        content: title,
                    },
                    {
                        type: 'br',
                    },
                    {
                        type: 'color',
                        color,
                        content: {
                            className: 'markup-metric-value',
                            type: 'text',
                            content: formattedValue,
                        },
                    },
                ],
            },
        };
    }
};