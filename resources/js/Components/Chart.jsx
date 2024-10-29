import { AgCharts } from 'ag-charts-react';
import { useStateContext } from '@/context/contextProvider';

const Chart = ({ data = [], series=[], legendPosition = 'bottom', title = '' }) => {
    const { theme } = useStateContext();

    const options = {
        theme: 'ag-material',
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
        }
    }

    return (
        <AgCharts options={options} className='border-card w-1/2 shadow-md' style={{ borderColor: theme.border }} />
    )
}

export default Chart;