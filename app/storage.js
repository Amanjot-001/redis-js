class Storage {
    constructor() {
        this.store = {};
    }

    set(key, value, expiration) {
        this.store[key] = {
            value: value,
            expiration: expiration
        };
    }

    get(key) {
        const response = this.store[key];
        if(response.expiration !== -1 && response.expiration < new Date().getTime()) {
            this.delete(key);
            return null;
        }
        return response;
    }

    delete(key) {
        delete this.store[key];
    }
}

module.exports = Storage;