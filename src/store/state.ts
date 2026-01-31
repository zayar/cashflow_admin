
export type ApolloResult<QueryKey extends string, T> = {
  [key in QueryKey]: T;
};
export interface LoginResp {
  token: string,
  role: string,
  name: string,
  expireAt?: number
}

export interface Business {
  key?:string
  id:string, 
  name:string,
  email:string,
  isActive:boolean,
  logoUrl?:string
  country:string,
  city:string,
  address:string
}
