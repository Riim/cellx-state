import { EventEmitter } from 'cellx';
import { IDataFields, IModelClass } from './DataField';
export declare class BaseModel extends EventEmitter implements IModelClass {
    $dataFields?: IDataFields;
    $original: this;
    id: string | undefined;
    get $id(): string;
    _fixedChanges: this | undefined;
    constructor();
    clone(): this;
    _clone(): this;
    absorbFrom(that: BaseModel): boolean;
    _absorbFrom(that: BaseModel): boolean;
    fixChanges(): this;
    discardChanges(): this;
    toData<T = Record<string, any>>(): T;
}
