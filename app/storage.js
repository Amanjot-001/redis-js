class Storage {
    constructor() {
        this.store = {};
    }

    set(key, value) {
        this.store[key] = value;
        console.log('store', this.store)
    }

    get(key) {
        console.log('store', this.store)
        return this.store[key];
    }
}

module.exports = Storage;