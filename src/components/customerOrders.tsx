import { CrudFilters, HttpError, useGetIdentity } from "@pankod/refine-core";
import { FC } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import duration from "dayjs/plugin/duration";
import { useTable } from "@pankod/refine-antd";
import { IOrders } from "interfaces";

interface CustomerOrdersProps {
  customerId: string;
}

var weekday = require("dayjs/plugin/weekday");
dayjs.locale("ru");
dayjs.extend(weekday);
dayjs.extend(duration);

const CustomerOrders: FC<CustomerOrdersProps> = ({ customerId }) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();

  const { tableProps, searchFormProps, filters, sorter, setFilters } = useTable<
    IOrders,
    HttpError,
    {
      organization_id: string;
      created_at: [dayjs.Dayjs, dayjs.Dayjs];
      customer_id: string;
    }
  >({
    initialSorter: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
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
        {
          orders_organization: ["id", "name"],
        },
        {
          orders_couriers: ["id", "first_name", "last_name"],
        },
        {
          orders_customers: ["id", "name", "phone"],
        },
        {
          orders_order_status: ["id", "name", "color"],
        },
        {
          orders_terminals: ["id", "name"],
        },
      ],
      whereInputType: "ordersWhereInput!",
      orderByInputType: "ordersOrderByWithRelationInput!",
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
      {
        field: "customer_id",
        operator: "eq",
        value: customerId,
      },
    ],
    onSearch: async (params) => {
      const filters: CrudFilters = [];
      const { organization_id, created_at, customer_id } = params;
      filters.push(
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
        filters.push({
          field: "organization_id",
          operator: "eq",
          value: {
            equals: organization_id,
          },
        });
      }
      if (customer_id) {
        filters.push({
          field: "customer_id",
          operator: "eq",
          value: {
            equals: customer_id,
          },
        });
      }
      return filters;
    },
  });
  return (
    <div>
      <h2>Customer Orders</h2>
    </div>
  );
};

export default CustomerOrders;
