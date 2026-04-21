export type UserProfile = {
  username: string;
  provider: string;
  mobileNumber: string;
  autoConvertLimit: number;
  lnurlConfig?: {
    minSendable: number;
    maxSendable: number;
  };
};

export type TransactionLogEntry = {
  id: string;
  amount: number;
  fiat: number;
  provider: string;
  status: string;
};
