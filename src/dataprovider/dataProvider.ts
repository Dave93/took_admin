import { CrudFilters, CrudSorting, DataProvider } from "@pankod/refine-core";
import { GraphQLClient } from "graphql-request";
import * as gql from "gql-query-builder";
import pluralize from "pluralize";
import camelCase from "camelcase";

type SortOrder = {
  [key: string]: "asc" | "desc";
};

const genereteSort = (sort?: CrudSorting) => {
  if (sort && sort.length > 0) {
    const sortQuery = sort.map((i) => {
      let res: SortOrder = {};
      res[i.field] = i.order;
      return res;
    });

    return sortQuery;
  }

  return [];
};

const generateFilter = (filters?: CrudFilters) => {
  const queryFilters: { [key: string]: any } = {};

  if (filters) {
    filters.forEach((filter) => {
      if (filter.operator !== "or") {
        const { field, operator, value } = filter;

        if (operator === "eq") {
          queryFilters[`${field}`] = value;
        } else {
          queryFilters[`${field}_${operator}`] = value;
        }
      } else {
        const { value } = filter;

        const orFilters: any[] = [];
        value.forEach((val) => {
          orFilters.push({
            [`${val.field}_${val.operator}`]: val.value,
          });
        });

        queryFilters["_or"] = orFilters;
      }
    });
  }

  return queryFilters;
};

const dataProvider = (client: GraphQLClient): DataProvider => {
  return {
    getList: async ({
      resource,
      hasPagination = true,
      pagination = { current: 1, pageSize: 10 },
      sort,
      filters,
      metaData,
    }) => {
      const { current = 1, pageSize = 10 } = pagination ?? {};
      console.log(metaData);
      const sortBy = genereteSort(sort);
      const filterBy = generateFilter(filters);

      console.log(sortBy);

      const camelResource = camelCase(resource);

      const operation = metaData?.operation ?? camelResource;

      console.log("operation", operation);

      const operationConnection = `${operation}Connection`;

      console.log([
        {
          operation: operationConnection,
          variables: {
            ...metaData?.variables,
            orderBy: [],
            where: { value: filterBy },
          },
          fields: [{ _count: ["id"] }],
        },
        {
          operation,
          variables: {
            ...metaData?.variables,
            orderBy: sortBy,
            where: { value: filterBy },
            ...(hasPagination
              ? {
                  skip: (current - 1) * pageSize,
                  take: pageSize,
                }
              : {}),
          },
          fields: metaData?.fields,
        },
      ]);

      const { query, variables } = gql.query([
        {
          operation: operationConnection,
          variables: {
            ...metaData?.variables,
            where: { value: filterBy, type: metaData?.whereInputType },
          },
          fields: [{ _count: ["id"] }],
        },
        {
          operation,
          variables: {
            ...metaData?.variables,
            orderBy: {
              value: sortBy,
              list: true,
              type: metaData?.orderByInputType,
            },
            where: { value: filterBy, type: metaData?.whereInputType },
            ...(hasPagination
              ? {
                  skip: (current - 1) * pageSize,
                  take: pageSize,
                }
              : {}),
          },
          fields: metaData?.fields,
        },
      ]);

      console.log([query, variables]);

      const response = await client.request(query, variables);

      return {
        data: response[operation],
        total: response[operationConnection]._count.id,
      };
    },

    getMany: async ({ resource, ids, metaData }) => {
      const camelResource = camelCase(resource);

      const operation = metaData?.operation ?? camelResource;

      const { query, variables } = gql.query({
        operation,
        variables: {
          where: {
            value: { id_in: ids },
            type: "JSON",
          },
        },
        fields: metaData?.fields,
      });

      const response = await client.request(query, variables);

      return {
        data: response[operation],
      };
    },

    create: async ({ resource, variables, metaData }) => {
      const singularResource = pluralize.singular(resource);
      const camelCreateName = camelCase(`create-${singularResource}`);

      const operation = metaData?.operation ?? camelCreateName;

      const { query, variables: gqlVariables } = gql.mutation({
        operation,
        variables: {
          input: {
            value: { data: variables },
            type: `${camelCreateName}Input`,
          },
        },
        fields: metaData?.fields ?? [
          {
            operation: singularResource,
            fields: ["id"],
            variables: {},
          },
        ],
      });
      const response = await client.request(query, gqlVariables);

      return {
        data: response[operation][singularResource],
      };
    },

    createMany: async ({ resource, variables, metaData }) => {
      const singularResource = pluralize.singular(resource);
      const camelCreateName = camelCase(`create-${singularResource}`);

      const operation = metaData?.operation ?? camelCreateName;

      const response = await Promise.all(
        variables.map(async (param) => {
          const { query, variables: gqlVariables } = gql.mutation({
            operation,
            variables: {
              input: {
                value: { data: param },
                type: `${camelCreateName}Input`,
              },
            },
            fields: metaData?.fields ?? [
              {
                operation: singularResource,
                fields: ["id"],
                variables: {},
              },
            ],
          });
          const result = await client.request(query, gqlVariables);

          return result[operation][singularResource];
        })
      );
      return {
        data: response,
      };
    },

    update: async ({ resource, id, variables, metaData }) => {
      const singularResource = pluralize.singular(resource);
      const camelUpdateName = camelCase(`update-${singularResource}`);

      const operation = metaData?.operation ?? camelUpdateName;

      const { query, variables: gqlVariables } = gql.mutation({
        operation,
        variables: {
          input: {
            value: { where: { id }, data: variables },
            type: `${camelUpdateName}Input`,
          },
        },
        fields: [
          {
            operation: singularResource,
            fields: metaData?.fields ?? ["id"],
            variables: {},
          },
        ],
      });
      const response = await client.request(query, gqlVariables);

      return {
        data: response[operation][singularResource],
      };
    },

    updateMany: async ({ resource, ids, variables, metaData }) => {
      const singularResource = pluralize.singular(resource);
      const camelUpdateName = camelCase(`update-${singularResource}`);

      const operation = metaData?.operation ?? camelUpdateName;

      const response = await Promise.all(
        ids.map(async (id) => {
          const { query, variables: gqlVariables } = gql.mutation({
            operation,
            variables: {
              input: {
                value: { where: { id }, data: variables },
                type: `${camelUpdateName}Input`,
              },
            },
            fields: [
              {
                operation: singularResource,
                fields: metaData?.fields ?? ["id"],
                variables: {},
              },
            ],
          });
          const result = await client.request(query, gqlVariables);

          return result[operation][singularResource];
        })
      );
      return {
        data: response,
      };
    },

    getOne: async ({ resource, id, metaData }) => {
      const singularResource = pluralize.singular(resource);
      const camelResource = camelCase(singularResource);

      const operation = metaData?.operation ?? camelResource;

      const { query, variables } = gql.query({
        operation,
        variables: {
          id: { value: id, type: "ID", required: true },
        },
        fields: metaData?.fields,
      });

      const response = await client.request(query, variables);

      return {
        data: response[operation],
      };
    },

    deleteOne: async ({ resource, id, metaData }) => {
      const singularResource = pluralize.singular(resource);
      const camelDeleteName = camelCase(`delete-${singularResource}`);

      const operation = metaData?.operation ?? camelDeleteName;

      const { query, variables } = gql.mutation({
        operation,
        variables: {
          input: {
            value: { where: { id } },
            type: `${camelDeleteName}Input`,
          },
        },
        fields: metaData?.fields ?? [
          {
            operation: singularResource,
            fields: ["id"],
            variables: {},
          },
        ],
      });

      const response = await client.request(query, variables);

      return {
        data: response[operation][singularResource],
      };
    },

    deleteMany: async ({ resource, ids, metaData }) => {
      const singularResource = pluralize.singular(resource);
      const camelDeleteName = camelCase(`delete-${singularResource}`);

      const operation = metaData?.operation ?? camelDeleteName;

      const response = await Promise.all(
        ids.map(async (id) => {
          const { query, variables: gqlVariables } = gql.mutation({
            operation,
            variables: {
              input: {
                value: { where: { id } },
                type: `${camelDeleteName}Input`,
              },
            },
            fields: metaData?.fields ?? [
              {
                operation: singularResource,
                fields: ["id"],
                variables: {},
              },
            ],
          });
          const result = await client.request(query, gqlVariables);

          return result[operation][singularResource];
        })
      );
      return {
        data: response,
      };
    },

    getApiUrl: () => {
      throw Error("Not implemented on refine-graphql data provider.");
    },

    custom: async ({ url, method, headers, metaData }) => {
      let gqlClient = client;

      if (url) {
        gqlClient = new GraphQLClient(url, { headers });
      }

      if (metaData) {
        if (metaData.operation) {
          if (method === "get") {
            const { query, variables } = gql.query({
              operation: metaData.operation,
              fields: metaData.fields,
              variables: metaData.variables,
            });

            const response = await gqlClient.request(query, variables);

            return {
              data: response[metaData.operation],
            };
          } else {
            const { query, variables } = gql.mutation({
              operation: metaData.operation,
              fields: metaData.fields,
              variables: metaData.variables,
            });

            const response = await gqlClient.request(query, variables);

            return {
              data: response[metaData.operation],
            };
          }
        } else {
          throw Error("GraphQL operation name required.");
        }
      } else {
        throw Error(
          "GraphQL need to operation, fields and variables values in metaData object."
        );
      }
    },
  };
};

export default dataProvider;