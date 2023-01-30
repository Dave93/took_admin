import { GraphQLClient } from "graphql-request";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
export const client = new GraphQLClient(
  process.env.REACT_APP_GRAPHQL_API_URL!,
  {
    headers: {},
    cache: "no-cache",
  }
);

export const wsLink = new GraphQLWsLink(
  createClient({
    url: `ws://${process.env.REACT_APP_GRAPHQL_SUB_URL}`,
  })
);
