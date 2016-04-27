import PieChart from './pie.js';
import BarChart from './bar.js';

export default {
    create(params) {
        if (params.type === 'pie') {
            return PieChart.create(params);
        }
        else if (params.type === 'bar') {
            return BarChart.create(params);
        }
    }
};
