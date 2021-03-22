class priceController {

    public static plus(...values: number[]) {
        let result = 0;
        for (const value of values) {
            priceController.checkNumbersAfterDot(value);
            result += Math.floor(value * 100);
        }

        return result / 100;
    }

    public static minus(what: number, fromWhere: number) {
        priceController.checkNumbersAfterDot(what);
        priceController.checkNumbersAfterDot(fromWhere);
        let result = Math.floor(what * 100) - Math.floor(fromWhere * 100);

        return result / 100;
    }

    public static multiple(what: number, fromWhere: number) {
        priceController.checkNumbersAfterDot(what);
        priceController.checkNumbersAfterDot(fromWhere);

        let result = +((what * fromWhere).toFixed(2));

        return result;
    }

    private static checkNumbersAfterDot(value: number) {
        if (value.toString().split('.')[1]?.length > 2) throw new Error('The price value must be no more than two digits after the decimal point');
    }

}

export { priceController };