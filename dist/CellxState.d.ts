import { BaseModel } from './BaseModel';
export { IDataField, IDataFields, IModelClass, IOptions, DataField } from './DataField';
export { BaseModel } from './BaseModel';
export declare class CellxState {
    _models: Map<Function, Map<any, BaseModel>>;
    initialize?: () => void;
    constructor(initialize?: () => void);
    get<T extends BaseModel = BaseModel>(type: Function, id?: any): T | null;
    get<T extends BaseModel = BaseModel>(type: Function, id?: Array<any>): Array<T | null>;
    getAll<T extends BaseModel = BaseModel>(type: Function): Array<T>;
    set(type: Function, model: BaseModel): this;
    model<T extends BaseModel | Array<BaseModel>>(type: Function, data: Record<string, any> | Array<Record<string, any>>, model?: BaseModel | null, _prevModel?: BaseModel | null): T;
    discard(type: Function, id?: any): boolean;
    discard(model: BaseModel): boolean;
    clear(): this;
}
