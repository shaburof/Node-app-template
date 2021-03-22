class error extends Error {
    constructor(message: string, private _code = 0) {
        super(message);
    }
    get code() {
        return this._code;
    }
}

export { error }