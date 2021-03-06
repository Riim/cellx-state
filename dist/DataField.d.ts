import { TValidator } from 'omyumyum';
import { Class } from 'type-fest';
export interface IDataField {
    keypath: string | ((data: Record<string, any>, model: Object) => string);
    placeholder?: any;
    default?: any;
    validate?: TValidator;
    buildData?: (value: any, data: Record<string, any>, model: Object) => any;
    type?: () => Function;
    wrapper?: Class;
    wrap?: (value: any) => any;
}
export interface IDataFields {
    [propName: string]: IDataField;
}
export interface IModelClass {
    $dataFields?: IDataFields;
}
export interface IOptions<T = Object> {
    keypath?: string | ((data: Record<string, any>, model: T) => string);
    placeholder?: any;
    default?: any;
    validate?: TValidator;
    buildData?: (value: any, data: Record<string, any>, model: T) => any;
    type?: () => Function;
    wrapper?: Class;
    wrap?: (value: any) => any;
}
export declare function DataField<T = Object>(options?: IOptions<T>): (target: Object, propName: string) => any;
export declare function DataField<T = Object>(keypath?: string | ((data: Record<string, any>, model: Object) => string) | null, options?: IOptions<T>): (target: Object, propName: string) => any;
export declare function DataField<T = Object>(validate: TValidator | null, options?: IOptions<T>): (target: Object, propName: string) => any;
export declare function DataField<T = Object>(keypath: string | ((data: Record<string, any>, model: Object) => string) | null, validate: TValidator | null, options?: IOptions<T>): (target: Object, propName: string) => any;
