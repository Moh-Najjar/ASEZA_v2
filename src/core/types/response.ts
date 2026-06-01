export interface Response<T> {
  StatusCode: number;
  Message: string;
  Result: T;
}