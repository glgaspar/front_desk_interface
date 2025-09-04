import { Line } from 'react-chartjs-2';
import {Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend, ChartData, ChartOptions,} from 'chart.js';

ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend);

const MultiLineChart = ({ chartData, title }: {chartData:ChartData<'line'>, title:string}) => {
    const options: ChartOptions<'line'> = {
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

    return <Line data={chartData} options={options} />;
};

export default MultiLineChart;