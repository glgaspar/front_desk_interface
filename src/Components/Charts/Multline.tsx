import { Line } from 'react-chartjs-2';
import {Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler, ChartData, ChartOptions,} from 'chart.js';

ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler);

const MultiLineChart = ({ chartData, title, options = {} }: {chartData:ChartData<'line'>, title:string, options?: ChartOptions<'line'>}) => {
    const defaultOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: title,
        },
        },
        scales: {
        y: {
            beginAtZero: true,
        },
        },
    };

    return <Line data={chartData} options={{...defaultOptions, ...options, plugins: {...defaultOptions.plugins, ...options.plugins}}} />;
};

export default MultiLineChart;
