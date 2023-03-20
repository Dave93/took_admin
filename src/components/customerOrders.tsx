import { CrudFilters, HttpError, useGetIdentity } from "@refinedev/core";
import { FC } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import duration from "dayjs/plugin/duration";
import { useTable } from "@refinedev/antd";
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
  }>({
    v3LegacyAuthProviderCompatible: true
  });

  const { tableProps, searchFormProps, filters, sorters: sorter, setFilters } = useTable<
    IOrders,
    HttpError,
    {
      organization_id: string;
      created_at: [dayjs.Dayjs, dayjs.Dayjs];
      customer_id: string;
    }
  >({
    meta: {
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

    filters: {
      initial: [
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
      ]
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
    <div>
      <h2>Customer Orders</h2>
    </div>
  );
};

export default CustomerOrders;
