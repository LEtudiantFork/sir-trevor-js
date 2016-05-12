function THInfoCollection() {
    const collection = [];

    collection.getInfo = function(row, col) {
        return this.find(item => item.row === row && item.col === col);
    };

    collection.setInfo = function(info) {
        if (!this.some(item => item.row === info.row && item.col === info.col)) {
            this.push(info);
        }

        return this;
    };

    collection.removeInfo = function(info) {
        this.some((item, idx) => {
            if (item.row === info.row && item.col === info.col) {
                return this.splice(idx, 1);
            }
        });

        return this;
    };

    collection.clear = function() {
        this.splice(0, this.length);

        return this;
    };

    return collection;
}

function Headinger(thCells, thead = false, tfoot = false) {
    this.thInfoCollection = new THInfoCollection();
    this.theadActive = Boolean(thead);
    this.tfootActive = Boolean(tfoot);

    if (Array.isArray(thCells)) {
        thCells.forEach(info => this.thInfoCollection.setInfo(info));
    }
}

Headinger.prototype.canBeTHEAD = function(range) {
    return range.from.row === 0 && range.to.row === 0;
};

Headinger.prototype.canBeTFOOT = function(range, countRow) {
    return range.from.row === countRow && range.to.row === countRow;
};

Headinger.prototype.canBeTH = function(range) {
    return (range.from.row === 0 || range.from.col === 0) && (range.to.row === 0 || range.to.col === 0);
};

Headinger.prototype.setTHEAD = function() {
    this.theadActive = true;
};

Headinger.prototype.setTFOOT = function() {
    this.tfootActive = true;
};

Headinger.prototype.unsetTHEAD = function() {
    this.theadActive = false;
};

Headinger.prototype.unsetTFOOT = function() {
    this.tfootActive = false;
};

Headinger.prototype.toggleTHEAD = function() {
    this.theadActive = !this.theadActive;
};

Headinger.prototype.toggleTFOOT = function() {
    this.tfootActive = !this.tfootActive;
};

Headinger.prototype.setTH = function(range) {
    if (!this.canBeTH(range)) {
        return;
    }

    if (range.isSingle()) {
        this.thInfoCollection.setInfo({ row: range.from.row, col: range.from.col });
        return;
    }

    const iterateAxis = (range.from.row === range.to.row) ? 'col' : 'row';
    const staticAxis = (range.from.row === range.to.row) ? 'row' : 'col';
    const baseIterate = (range.from[iterateAxis] <= range.to[iterateAxis]) ? range.from[iterateAxis] : range.to[iterateAxis];
    const endIterate = (range.from[iterateAxis] <= range.to[iterateAxis]) ? range.to[iterateAxis] : range.from[iterateAxis];

    const staticAxisValue = range.from[staticAxis];

    for (let i = baseIterate; i <= endIterate; i++) {
        this.thInfoCollection.setInfo({ [iterateAxis]: i, [staticAxis]: staticAxisValue });
    }
};

Headinger.prototype.unsetTH = function(range) {
    if (range.isSingle()) {
        this.thInfoCollection.removeInfo({ row: range.from.row, col: range.from.col });
        return;
    }

    const iterateAxis = (range.from.row === range.to.row) ? 'col' : 'row';
    const staticAxis = (range.from.row === range.to.row) ? 'row' : 'col';
    const baseIterate = (range.from[iterateAxis] <= range.to[iterateAxis]) ? range.from[iterateAxis] : range.to[iterateAxis];
    const endIterate = (range.from[iterateAxis] <= range.to[iterateAxis]) ? range.to[iterateAxis] : range.from[iterateAxis];

    const staticAxisValue = range.from[staticAxis];

    for (let i = baseIterate; i <= endIterate; i++) {
        this.thInfoCollection.removeInfo({ [iterateAxis]: i, [staticAxis]: staticAxisValue });
    }
};

Headinger.prototype.setOrUnsetTH = function(range) {
    const info = this.thInfoCollection.getInfo(range.from.row, range.from.col);

    if (info) {
        this.unsetTH(range);
    }
    else {
        this.setTH(range);
    }
};

export default Headinger;
