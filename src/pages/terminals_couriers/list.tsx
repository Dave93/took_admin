import { Card, PageHeader, useTable } from "@pankod/refine-antd";
import { CrudFilters, HttpError, useGetIdentity } from "@pankod/refine-core";
import { ICouriersByTerminal } from "interfaces";
import { user_status } from "interfaces/enums";

export const TerminalsCouriersListPage = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();

  const { tableProps, searchFormProps } = useTable<
    ICouriersByTerminal,
    HttpError,
    {
      terminal_id: string;
      status: keyof typeof user_status;
    }
  >({
    initialSorter: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    metaData: {
      fields: ["name", "couriers"],
      whereInputType: "ordersWhereInput!",
      orderByInputType: "ordersOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
    initialFilter: [],
    onSearch: async (params) => {
      const filters: CrudFilters = [];
      const { terminal_id, status } = params;

      if (terminal_id) {
        filters.push({
          field: "terminal_id",
          operator: "eq",
          value: {
            equals: terminal_id,
          },
        });
      }

      console.log(filters);
      return filters;
    },
  });

  return (
    <>
      <PageHeader ghost={false} title="Курьеры по филиалам"></PageHeader>
    </>
  );
};
