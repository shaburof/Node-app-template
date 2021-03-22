import { paginateDataType } from '../../types/types';
import { getCurrentUrl } from '../../helpers/helper';
import { Request } from 'express';

class BuildPaginationObject {

    private _data: any[];
    private _perPage: number;
    private _total: number;
    private req: Request;
    private paginateLength = 5;
    private paginateData: paginateDataType = {
        total: 0,
        per_page: 0,
        showPaginate: false,
        paginate_length: this.paginateLength,
        current_page: 0,
        last_page: 0,
        first_page_url: '',
        last_page_url: '',
        next_page_url: '',
        prev_page_url: '',
        linkTemplate: '',
        data: []
    };


    // constructor({ req, data, perPage }: { req: Request, data: any, perPage: number }) {
    //     this.req = req;
    //     this._perPage = perPage;
    //     this._data = data;
    //     this.paginateData.linkTemplate = this.getPageLinkTemplate();
    // }

    // public static build(params: { req: Request, data: any, perPage: number }) {
    //     return new BuildPaginationObject(params).createPaginationObject();
    // }

    public setParams({ req, perPage }: { req: Request, perPage: number }) {
        this.req = req;
        this._perPage = perPage;
        this.paginateData.linkTemplate = this.getPageLinkTemplate();
    }

    public setData(data: any) {
        this._data = data;
        return this;
    }

    public setTotal(total: number) {
        this._total = total;
    }

    public async createPaginationObject() {
        this.calculatePaginateLength();

        this.paginateData.data = this._data;
        this.paginateData.showPaginate = this.whetherToShowPagination();
        this.paginateData.total = this.getTotal();
        this.paginateData.paginate_length = this.paginateLength;
        this.paginateData.current_page = this.getCurentPage();
        this.paginateData.last_page = this.getLastPage();
        this.paginateData.per_page = this._perPage;
        this.paginateData.first_page_url = this.addPageToUrl(this.getFirstPage());
        this.paginateData.last_page_url = this.addPageToUrl(this.getLastPage());
        this.paginateData.next_page_url = this.addPageToUrl(this.getNextPage());
        this.paginateData.prev_page_url = this.addPageToUrl(this.getPrevPage());

        return this.paginateData;

    }

    private calculatePaginateLength() {
        if (this.getTotal() < this.paginateLength) this.paginateLength = this.getTotal();
        if (this._perPage >= this.getTotal()) this.paginateLength = 1;
        if (this.getTotal() >= this.paginateLength) this.paginateLength = this.getLastPage();

        // this.paginateLength = 3;
    }

    private whetherToShowPagination() {
        if (this.getTotal() > this._perPage) return true;
        return false;
    }

    public getCurentPage(): number {
        let page = !this.req.query.page ? 1 : Number.parseInt(this.req.query.page as any);

        return page;
    }

    private getFirstPage() {
        return 1;
    }

    private getLastPage() {
        return Math.ceil(this._total / this._perPage)
    }

    private getTotal() {
        return this._total;
    }

    private getNextPage() {
        if (this.getCurentPage() < this.getLastPage()) return this.getCurentPage() + 1;
        return this.getLastPage();
    }

    private getPrevPage() {
        if (this.getCurentPage() === 0) return 0;
        return this.getCurentPage() - 1 > this.getLastPage() ? this.getLastPage() : this.getCurentPage() - 1;
    }

    private addPageToUrl(page: number) {
        if (page === 0) page = 1;

        let currentUrl = new URL(getCurrentUrl(this.req));
        if (currentUrl.searchParams.has('page')) {
            currentUrl.searchParams.set('page', page.toString());
        } else currentUrl.searchParams.append('page', page.toString())

        if(currentUrl.pathname[currentUrl.pathname.length - 1] === '/') (currentUrl.pathname = currentUrl.pathname.slice(0, currentUrl.pathname.length - 1));

        return currentUrl.href;
    }

    private getPageLinkTemplate() {
        let pageTemplate = this.addPageToUrl(1);
        pageTemplate = pageTemplate.slice(0, pageTemplate.length - 1);

        return pageTemplate;
    }
}

export { BuildPaginationObject }