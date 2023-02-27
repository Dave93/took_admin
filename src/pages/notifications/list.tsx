import { useTable } from "@pankod/refine-antd";
import {
  CrudFilters,
  HttpError,
  useGetIdentity,
  useNavigation,
  useQueryClient,
  useTranslate,
} from "@pankod/refine-core";
import dayjs from "dayjs";
import { INotifications } from "interfaces";

const NotificationsList: React.FC = () => {
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
      const { created_at, status, role } = params;

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
      return localFilters;
    },
  });

  return <></>;
};

export default NotificationsList;
