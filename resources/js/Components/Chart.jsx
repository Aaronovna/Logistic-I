import { AgCharts } from 'ag-charts-react';
import { useStateContext } from '@/context/contextProvider';

const Chart = ({ data = [], series=[], axes=[], legendPosition = 'bottom', title = '', className="" }) => {
    const { theme, themePreference } = useStateContext();

    const options = {
        theme: themePreference === 'light' ? 'ag-material' : 'ag-material-dark',
        data: data,
        title: {
            text: title,
            fontFamily: "poppins",
            color: theme.text,
        },
        series: series,
        legend: {
            position: legendPosition,
            item: {
                label: {
                    color: theme.text,
                    fontFamily: "poppins",
                }
            }
        },
        background: {
            visible: false,
        },
    }

    return (
        <AgCharts options={options} className={className} style={{ borderColor: theme.border }} />
    )
}

export default Chart;