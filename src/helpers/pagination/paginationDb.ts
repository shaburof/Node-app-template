import { model } from '../../models/model';

class PaginationDb {

    private _model: model;
    private perPage: number;
    private currentPage: number;
    private offsetDb: number;
    private limitDb: number;

    public setModel(model: model) {
        this._model = model;
        return this;
    }

    public setParams({ perPage, currentPage }: { perPage: number, currentPage: number }) {
        this.perPage = perPage;
        this.currentPage = currentPage;
        return this;
    }

    public async getData() {
        this.getOffset();

        return await this._model.findPaginateLimit({ limit: this.limitDb, offset: this.offsetDb });
    }

    public async getTotal(){
        return await this._model.count();
    }

    private getOffset() {
        let offsetPage = this.perPage;
        let currentPage = this.currentPage;

        this.offsetDb = currentPage === 1 ? 0 : (currentPage - 1) * offsetPage;
        this.limitDb = offsetPage;
    }
}

export { PaginationDb };