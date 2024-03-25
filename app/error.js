class AppError extends error {
    constructor(message) {
        super(message);
    }
};

module.exports = AppError;
