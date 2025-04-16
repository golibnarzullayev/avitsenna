import { Types } from "mongoose";

type ObjectIdType<T> = T extends string
  ? Types.ObjectId
  : T extends string[]
  ? Types.ObjectId[]
  : Types.ObjectId;

export function ObjectId<T extends string | string[]>(
  inputId?: T
): ObjectIdType<T> {
  if (!inputId) return new Types.ObjectId() as unknown as ObjectIdType<T>;

  if (Array.isArray(inputId)) {
    return inputId.map(convertToObjectId) as unknown as ObjectIdType<T>;
  }

  return convertToObjectId(inputId) as unknown as ObjectIdType<T>;
}

function isObjectId(id: unknown): id is Types.ObjectId {
  return id instanceof Types.ObjectId;
}

function convertToObjectId(id: string | Types.ObjectId): Types.ObjectId {
  if (isObjectId(id)) return id;

  if (Types.ObjectId.isValid(id)) return new Types.ObjectId(id);
}
