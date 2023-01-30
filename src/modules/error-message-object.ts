import { ErrorMessageObject } from "./models/error-message.model";

export class ErrorMsgObj implements ErrorMessageObject {
  public error;
  constructor(errorMessage: string) {
    this.error = {
      message: errorMessage
    }
  }
}
