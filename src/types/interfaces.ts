export interface guardOptionsInterface {
    only?: string[] | string,
    id?: number,
    adminAllow?: boolean
}

export interface guardCrudOptionsInterface extends guardOptionsInterface{
    id: number,
    adminAllow?: boolean
}