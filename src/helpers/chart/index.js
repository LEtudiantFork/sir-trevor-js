import PieChart from './pie';
import BarChart from './bar';

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
