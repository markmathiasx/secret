export class DataAccessError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DataAccessError";
    this.code = code;
  }
}
