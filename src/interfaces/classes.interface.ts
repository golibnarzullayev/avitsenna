export interface IClasses {
  _id: string;
  title: string;
  image: string;
  teacher: {
    _id: string;
    fullName: string;
  };
  createdAt: Date;
  updateAt: Date;
}
