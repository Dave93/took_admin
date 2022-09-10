import { useShow } from "@pankod/refine-core";
import { Show, Typography, Switch, Descriptions } from "@pankod/refine-antd";

const { Title, Text } = Typography;

export const OrdersShow = () => {
  const { queryResult, showId } = useShow({
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
    },
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading} title={`Заказ #${record?.order_number}`}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Дата заказа">
          {record?.created_at}
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};
