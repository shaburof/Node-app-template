export type cartType = {
    products: { [proc: string]: { count: number } },
    totalPrice: number,
    totalCount: number
};

export type getCartType = {
    products:
    { id: number, title: string, count: any }[],
    totalPrice: number,
    totalCount: number
};

export type guardOptionsType = {
    only?: string[] | string,
    id?: number,
    adminAllow?: boolean
}


export type guardedType = {
    url: string,
    redirect?: string,
    only?: string[] | string,
    method?: 'GET' | 'POST' | 'UPDATE' | 'PUT' | 'DELETE' | '*',
    api?:boolean
}[]

export type validateParamsType = {
    [props: string]: {
        require?: boolean,
        isLength?: {
            min?: number,
            max?: number
        },
        isEmail?: boolean,
        compare?: { compareWith: string },
        isUserAlreadyExists: boolean,
        isUserNotRegistered: boolean,
        message?: string,
        howManyNumbersAfterDot: number,
        sanitize?: {
            normalize: true,
            trim: true,
        },
        isImage: boolean
    }
}

export type validateDataType = {
    [props: string]: any
}

export type fileRespondType = {
    status: boolean,
    filename: string,
    store: string,
    relativePath: string,
    absolutPath: string,
};

export type orderPdfType = {
    orderNo: number,
    products: any,
    total: number,
    date: string
}

export type typePdfGenerate = 'toFile' | 'toBuffer' | 'toStream';

export type generatePdfType = { order: orderPdfType, type: typePdfGenerate, filePath?: string };

export type paginateDataType = {
    total: number,
    per_page: number,
    showPaginate: boolean,
    paginate_length: number,
    current_page: number,
    last_page: number,
    first_page_url: string,
    last_page_url: string,
    next_page_url: string,
    prev_page_url: string,
    data: any[],
    linkTemplate: string,
};