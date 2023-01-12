interface ErrorMessages {
  [key: string]: string;
}

export enum ERROR_MESSAGES {
  INVALID_UUID = 'The requested id is invalid (not uuid)',
  RECORD_NOT_FOUND = "The record with requested id doesn't exist",
  URL_NOT_FOUND = 'The requested URL was not found',
  MISSING_REQ_FIELDS = "Request body doesn't contain required fields",
  NOT_ALLOWED = "Method not allowed"
}
