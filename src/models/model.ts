import { argv } from 'process';
import { Sequelize, Model, DataType, DataTypes, ModelCtor, Op } from 'sequelize';
import { Paginate } from '../helpers/pagination/pagination';
import { Request } from 'express';

class model {
    private model: ModelCtor<Model<any, any>>;
    private perPagePagination = 5;
    private _params: {};

    constructor(model: ModelCtor<Model<any, any>>) {
        this.model = model;
    }

    public async paginate(req: Request) {
        let paginate = new Paginate(req);

        return paginate.model(this).perPage(this.perPagePagination).paginate();
    }

    public perPage(perPage: number) {
        this.perPagePagination = perPage;
        return this;
    }

    public params(params: {}) {
        this._params = params;
        return this;
    }

    public async findPaginateLimit({ limit, offset }: { limit: number, offset: number }) {
        if (offset < 0) offset = 0;

        return this.model.findAll({
            where: {},
            limit: limit,
            offset: offset,
            ...this._params,
        });
    }

    public async count() {
        let count = await this.model.findAll({ attributes: ['id'] });
        return count.length;
    }

    findById = async (value: number) => {
        return this.model.findOne({
            where: {
                id: value
            }
        }) as any;
    }

    findBelongsTo = async (by: string, value: number) => {
        return this.model.findAll({
            where: this.find(by, value)
        }) as any;
    }

    findBy = async (by: string, value: any, valueCondition?: 'like') => {
        if (valueCondition && valueCondition === 'like') {
            return this.model.findOne({
                where: this.like(by, value)
            }) as any;
        }

        return this.model.findOne({
            where: this.find(by, value)
        }) as any;
    }

    findAll = async (by?: string, value?: any, valueCondition?: 'like') => {
        if (valueCondition && valueCondition === 'like') {
            return this.model.findAll({
                where: this.like(by, value),
            }) as any;
        } else {
            if (by && value) {
                return this.model.findAll({
                    where: this.find(by, value)
                });
            }
        }

        return this.model.findAll();
    }

    private like(by?: string, value?: any) {
        return { [by as string]: { [Op.like]: value } };
    }

    private find(by: string, value: any) {
        return { [by as string]: value }
    }

    public async create(value: any) {
        let result;
        try {
            result = this.model.create(value);
            return result
        } catch (error) {
            return new Error(error);
        }
    }

    public async destroy(by: string, value: any) {
        if (by || value) {
            return this.model.destroy({
                where: this.find(by, value)
            });
        }
        return this.model.destroy();
    }

    public async update(values: any, condition: any) {
        await this.model.update(values, condition);
    }

}

export { model }