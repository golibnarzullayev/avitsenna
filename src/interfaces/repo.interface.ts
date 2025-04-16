import { FilterQuery } from 'mongoose';

type IFilterWithOperator<T> = { $eq?: T; $ne?: T; $gt?: T; $gte?: T; $lt?: T; $lte?: T; $in?: T[]; $nin?: T[]; $exists?: T };

export type IFilter<T> = ({ [K in keyof T]?: IFilter<T[K]> } & { [K in keyof T]?: IFilterWithOperator<T[K]> }) | FilterQuery<T>;
