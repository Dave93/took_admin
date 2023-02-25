import {
  CrudFilters,
  HttpError,
  useGetIdentity,
  useNavigation,
  useQueryClient,
  useTable,
  useTranslate,
} from "@pankod/refine-core";
import dayjs from "dayjs";
import { INotifications } from "interfaces";

const NofificationsList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const tr = useTranslate();

  const queryClient = useQueryClient();

  const { show } = useNavigation();

  const { tableProps, searchFormProps, filters, sorter, setFilters } = useTable<
    INotifications,
    HttpError,
    {
      created_at: [dayjs.Dayjs, dayjs.Dayjs];
      status: string;
      role: string;
    }
  >({
    initialPageSize: 200,
    initialSorter: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    defaultSetFilterBehavior: "replace",
    queryOptions: {
      queryKey: ["notifications"],
    },
    metaData: {
      fields: [
        "id",
        "delivery_type",
        "created_at",
        "order_price",
        "order_number",
        "duration",
        "delivery_price",
        "payment_type",
        "finished_date",
        "pre_distance",
      ],
      whereInputType: "notificationsWhereInput!",
      orderByInputType: "notificationsOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
    initialFilter: [
      {
        field: "created_at",
        operator: "gte",
        value: dayjs().startOf("d").toDate(),
      },
      {
        field: "created_at",
        operator: "lte",
        value: dayjs().endOf("d").toDate(),
      },
    ],
    onSearch: async (params) => {
      const localFilters: CrudFilters = [];
      queryClient.invalidateQueries(["default", "orders", "list"]);
      // queryClient.invalidateQueries();
      const {
        organization_id,
        created_at,
        terminal_id,
        order_status_id,
        customer_phone,
        courier_id,
        order_number,
        orders_couriers,
      } = params;

      localFilters.push(
        {
          field: "created_at",
          operator: "gte",
          value: created_at ? created_at[0].toISOString() : undefined,
        },
        {
          field: "created_at",
          operator: "lte",
          value: created_at ? created_at[1].toISOString() : undefined,
        }
      );

      if (organization_id) {
        localFilters.push({
          field: "organization_id",
          operator: "eq",
          value: {
            equals: organization_id,
          },
        });
      }

      if (terminal_id && terminal_id.length) {
        localFilters.push({
          field: "terminal_id",
          operator: "in",
          value: terminal_id,
        });
      }

      if (order_status_id && order_status_id.length) {
        localFilters.push({
          field: "order_status_id",
          operator: "in",
          value: order_status_id,
        });
      }

      if (customer_phone) {
        localFilters.push({
          field: "orders_customers",
          operator: "contains",
          value: {
            custom: {
              is: {
                phone: {
                  contains: customer_phone,
                },
              },
            },
          },
        });
      }

      if (order_number) {
        localFilters.push({
          field: "order_number",
          operator: "eq",
          value: {
            equals: order_number,
          },
        });
      }

      if (courier_id && courier_id.value) {
        localFilters.push({
          field: "courier_id",
          operator: "eq",
          value: { equals: courier_id.value },
        });
      }

      if (orders_couriers) {
        localFilters.push({
          field: "orders_couriers",
          operator: "contains",
          value: {
            custom: {
              is: {
                status: {
                  equals: orders_couriers,
                },
              },
            },
          },
        });
      }
      return localFilters;
    },
  });
};
