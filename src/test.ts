import assert from 'assert';
import { priceController } from './controllers/priceController';
import { model } from './models/model';
import { ProductModel3 } from './models/productModel3';

console.clear();
console.log('--------------------------');

describe('priceController', () => {

    it('plus() correct', () => {
        let result = priceController.plus(1.55, 3.79);
        assert.strictEqual(result, 5.34);
    });

    it('no more than two decimal places in plus() method', () => {
        let expectedError = new Error('The price value must be no more than two digits after the decimal point');
        assert.throws(()=>{
            priceController.plus(1.111, 2.222);
        },expectedError);
    });

    it('minus() correct', () => {
        let result = priceController.minus(5.55, 3.79);
        assert.strictEqual(result, 1.76);
    });

    it('multiple() correct', () => {
        let result = priceController.multiple(5.55, 2);
        assert.strictEqual(result, 11.1);
    });

});

describe('product', () => {
    let Model = new model(ProductModel3);
    let productId: number;
    let dummyProduct = {
        title: 'test title',
        description: 'test description',
        price: 15.5
    };

    it('add product', async () => {
        let newProduct = await Model.create(dummyProduct);
        productId = newProduct.id;
        let productFromDB = await Model.findById(productId);

        assert.strictEqual(
            JSON.stringify(dummyProduct),
            JSON.stringify({
                title: productFromDB.title,
                description: productFromDB.description,
                price: productFromDB.price,
            })
        );

    });

    it('update product', async () => {
        let qwe = await Model.update({ title: 'updated title' }, { where: { id: productId } })
        let productFromDB = await Model.findById(productId);

        assert.strictEqual(
            JSON.stringify({ title: 'updated title' }),
            JSON.stringify({ title: productFromDB.title })
        );
    });

    it('remove product', async () => {
        await Model.destroy('id',productId);
        let product = await Model.findById(productId);

        assert.strictEqual(product,null);
    });   
});