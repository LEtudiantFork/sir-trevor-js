import OneDimentional from './one-dimensional';
import TwoDimensional from './two-dimensional';

export default {
    create(params) {
        if (params.type === '1D') {
            return OneDimentional.create(params);
        }
        else if (params.type === '2D') {
            return TwoDimensional.create(params);
        }
    }
};
