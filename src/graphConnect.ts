import { GraphQLClient } from "graphql-request";
export const client = new GraphQLClient(
  process.env.REACT_APP_GRAPHQL_API_URL!,
  {
    headers: {},
  }
);
