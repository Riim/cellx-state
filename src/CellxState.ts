import { keypath } from '@riim/keypath';
import { error } from '@riim/log';
import om from 'omyumyum';
import { BaseModel } from './BaseModel';
import { clone } from './clone';
import { IModelClass } from './DataField';

export { IDataField, IDataFields, IModelClass, IOptions, DataField } from './DataField';
export { BaseModel } from './BaseModel';

export class CellxState {
	_models: Map<Function, Map<any, BaseModel>> = new Map();

	initialize?: () => void;

	constructor(initialize?: () => void) {
		if (initialize) {
			this.initialize = initialize;
			this.initialize();
		}
	}

	get<T extends BaseModel = BaseModel>(type: Function, id?: any): T | null;
	get<T extends BaseModel = BaseModel>(type: Function, id?: Array<any>): Array<T | null>;
	get(type: Function, id?: any | Array<any>): BaseModel | Array<BaseModel | null> | null {
		let models = this._models.get(type);

		return Array.isArray(id)
			? id.map((id) => (models && models.get(id)) || null)
			: (models && models.get(id)) || null;
	}

	getAll<T extends BaseModel = BaseModel>(type: Function): Array<T> {
		let models: Array<T> = [];

		(this._models.get(type) || []).forEach((model: T) => {
			models.push(model);
		});

		return models;
	}

	set(type: Function, model: BaseModel): this {
		let models = this._models.get(type);

		if (!models) {
			models = new Map<any, BaseModel>();
			this._models.set(type, models);
		}

		models.set(model.$id, model.$original);

		return this;
	}

	model<T extends BaseModel | Array<BaseModel>>(
		type: Function,
		data: Record<string, any> | Array<Record<string, any>>,
		model?: BaseModel,
		_prevModel?: BaseModel | null
	): T {
		if (Array.isArray(data)) {
			let arrLength = data.length;
			let arr = new Array(arrLength);

			for (let i = 0; i < arrLength; i++) {
				arr[i] = this.model(type, data[i]);
			}

			return arr as any;
		}

		let dataFields = (type as IModelClass).$dataFields;
		let models = this._models.get(type);

		if (!models) {
			models = new Map();
			this._models.set(type, models);
		}

		let idDataField = dataFields?.id;
		let id: any;

		if (idDataField) {
			let idKeypath = idDataField.keypath;

			id = idKeypath && keypath(idKeypath as string, data);

			if (idDataField.validate) {
				try {
					om(idDataField.validate, id);
				} catch (err) {
					error(err, {
						modelName: type.name,
						dataFieldName: 'id',
						dataFieldKeypath: idKeypath,
						value: JSON.stringify(id)
					});
				}
			}
		}

		if (model) {
			if (id && !model.id) {
				model.id = id;
				model.$original = model;
				models.set(id, model);
			}
		} else {
			if (!id && _prevModel) {
				model = _prevModel;
			} else {
				model = id && models.get(id);

				if (!model) {
					model = new (type as any)();

					if (id) {
						model!.id = id;
						models.set(id, model!);
					}
				}
			}
		}

		if (dataFields) {
			for (let name in dataFields) {
				if (name == 'id') {
					continue;
				}

				let dataField = dataFields[name];

				if (dataField.keypath === undefined) {
					throw new TypeError('dataField.keypath is required');
				}

				let value = keypath(
					typeof dataField.keypath == 'function'
						? dataField.keypath(data, model!)
						: dataField.keypath,
					data
				);

				if (value === null && dataField.placeholder !== undefined) {
					model![name] =
						typeof dataField.placeholder == 'function'
							? dataField.placeholder()
							: clone(dataField.placeholder);

					continue;
				}

				if (value === undefined && dataField.default !== undefined) {
					model![name] =
						typeof dataField.default == 'function'
							? dataField.default()
							: clone(dataField.default);

					continue;
				}

				if (dataField.validate) {
					try {
						om(dataField.validate, value);
					} catch (err) {
						error(err, {
							modelName: type.name,
							dataFieldName: name,
							dataFieldKeypath: dataField.keypath,
							value: JSON.stringify(value)
						});
					}
				}

				if (value === undefined) {
					continue;
				}

				if (value !== null) {
					if (dataField.buildData) {
						value = dataField.buildData(value, data, model!);
					}

					if (typeof value == 'object' && dataField.type) {
						value = this.model(dataField.type() as any, value, model![name]);
					}

					if (dataField.wrapper) {
						value =
							typeof (dataField.wrapper as any).from == 'function'
								? (dataField.wrapper as any).from(value)
								: new dataField.wrapper(value);
					} else if (dataField.wrap) {
						value = dataField.wrap(value);
					}
				}

				if (model![name] !== value) {
					if (
						value &&
						model![name] &&
						typeof value == 'object' &&
						typeof model![name] == 'object' &&
						value.absorbFrom &&
						value.absorbFrom === model![name].absorbFrom
					) {
						model![name].absorbFrom(value);
					} else {
						model![name] = value;
					}
				}
			}
		}

		return model!.fixChanges() as T;
	}

	discard(type: Function, id?: any): boolean;
	discard(model: BaseModel): boolean;
	discard(typeOrModel: Function | BaseModel, id?: any): boolean {
		if (typeof typeOrModel == 'function') {
			let models = this._models.get(typeOrModel);

			if (models?.size) {
				if (id) {
					return models.delete(id);
				}

				models.clear();
				return true;
			}
		} else {
			let models = this._models.get(typeOrModel.constructor);

			if (models?.size) {
				return models.delete(typeOrModel.id);
			}
		}

		return false;
	}

	clear(): this {
		this._models = new Map();
		this.initialize?.();

		return this;
	}
}
