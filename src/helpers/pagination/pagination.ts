import { BuildPaginationObject } from './buildPaginationObject';
import { PaginationDb } from './paginationDb';
import { Request } from 'express';
import { model } from '../../models/model';
import { convertTypeAcquisitionFromJson } from 'typescript';

class Paginate {

    private _data: any[];
    private _perPage: number;
    private _total:number;
    private req: Request;
    private buildPaginationObject: BuildPaginationObject;
    private paginatiobDb: PaginationDb;
    private _model: model;

    constructor(req: Request) {
        this.req = req;
        this.paginatiobDb = new PaginationDb();
    }

    public perPage(perPage: number) {
        this._perPage = perPage;
        return this;
    }

    public model(model: model) {
        this._model = model;
        return this;
    }

    public async paginate() {
        this.calculatePerPage();
        
        this.buildPaginationObject = new BuildPaginationObject();
        this.buildPaginationObject.setParams({ req: this.req, perPage: this._perPage });
        
        await this.getPaginateDataFromDb();
        this.buildPaginationObject.setData(this._data);
        this.buildPaginationObject.setTotal(this._total);
        
        if (!this.isValid()) throw new Error('Paginate data not set');

        return this.buildPaginationObject.createPaginationObject();

    }

    private async getPaginateDataFromDb() {
        this._data = await this.paginatiobDb.setModel(this._model).setParams({ perPage: this._perPage, currentPage: this.buildPaginationObject.getCurentPage() }).getData()
        this._total = await this.paginatiobDb.getTotal();
    }


    private isValid() {
        if (!this._data) return false;
        return true;
    }

    private calculatePerPage() {
        if (!this._perPage) this._perPage = Math.ceil(this._data.length / 5);
    }
}

export { Paginate };