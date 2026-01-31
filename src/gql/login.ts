import { gql } from "@apollo/client";

export const login = gql`
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    token
    role
    name
    fiscalYear
  }
}
`;
export const loginVar = (username: string, password: string) => ({ username, password });