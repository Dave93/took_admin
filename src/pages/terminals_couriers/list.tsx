import { PageHeader, useTable } from "@refinedev/antd";
import { Card } from "antd";
import { CrudFilters, HttpError, useGetIdentity } from "@refinedev/core";
import { ICouriersByTerminal } from "interfaces";
import { user_status } from "interfaces/enums";

export const TerminalsCouriersListPage = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>({
    v3LegacyAuthProviderCompatible: true
  });

  const { tableProps, searchFormProps } = useTable<
    ICouriersByTerminal,
    HttpError,
    {
      terminal_id: string;
      status: keyof typeof user_status;
    }
  >({
    meta: {
      fields: ["name", "couriers"],
      whereInputType: "ordersWhereInput!",
      orderByInputType: "ordersOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },

    onSearch: async (params) => {
      const filters: CrudFilters = [];
      const { terminal_id } = params;

      if (terminal_id) {
        filters.push({
          field: "terminal_id",
          operator: "eq",
          value: {
            equals: terminal_id,
          },
        });
      }

      return filters;
    },

    filters: {
      initial: []
    },

    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ]
    }
  });

  return (
    <>
      <PageHeader ghost={false} title="Курьеры по филиалам"></PageHeader>
    </>
  );
};
