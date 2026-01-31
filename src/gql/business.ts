import { gql } from "@apollo/client";


export const register = gql`
mutation CreateBusiness($input: NewBusiness!) {
  createBusiness(input: $input) {
    id
  }
}
`;
export const registerVar = (args: {
  email: string,
  name: string,
  fiscalYear: string,
  addresss: string,
  city: string,
  country: string,
}) => ({ input: { ...args, stateId: 1, townshipId: 1, baseCurrencyId: 1 } })

export const list_business = gql`
query ListAllBusiness {
  listAllBusiness {
    address
    city
    country
    email
    id
    isActive
    logoUrl
    name
  }
}`;