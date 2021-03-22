class Sanitize {
    private paramName = '';
    private paramValue: any;
    constructor(private sanitizeTypes: {}) {

    }

    public start(paramName: string, paramValue: any) {

        this.paramName = paramName;
        this.paramValue = paramValue;

        for (const sanitizeName in this.sanitizeTypes) {
            this[sanitizeName]();

        }

        return { paramName: this.paramName, paramValue: this.paramValue };
    }

    private normalize() {
        this.paramValue = this.paramValue ? this.paramValue.toLowerCase() : this.paramValue;
    }

    private trim() {
        this.paramValue = this.paramValue ? this.paramValue.trim() : this.paramValue;
    }

}

export { Sanitize };