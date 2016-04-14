import OneDimentional from './one-dimensional.js';
import TwoDimensional from './two-dimensional.js';

export default {
    create(params) {
        if (params.type === '1D') {
            const instance = OneDimentional.create(params);
            return instance;
        }
        else if (params.type === '2D') {
            const instance = TwoDimensional.create(params);
            return instance;
        }
    }
};
