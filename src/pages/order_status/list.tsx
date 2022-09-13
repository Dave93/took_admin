import {
  List,
  DateField,
  Table,
  useTable,
  Switch,
  Space,
  EditButton,
  ShowButton,
} from "@pankod/refine-antd";

import { IOrderStatus } from "interfaces";

export const OrderStatusList: React.FC = () => {
  const { tableProps } = useTable<IOrderStatus>({
    initialSorter: [
      {
        field: "sort",
        order: "asc",
      },
    ],
    metaData: {
      fields: [
        "id",
        "name",
        "sort",
        "color",
        "finish",
        "cancel",
        "waiting",
        {
          order_status_organization: ["id", "name"],
        },
      ],
      whereInputType: "order_statusWhereInput!",
      orderByInputType: "order_statusOrderByWithRelationInput!",
      operation: "orderStatuses",
    },
  });
  return (
    <>
      <List title="Статусы заказов">
        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="sort" title="Сортировка" />
          <Table.Column dataIndex="name" title="Название" />
          <Table.Column
            dataIndex="organization.name"
            title="Организация"
            render={(value: any, record: IOrderStatus) =>
              record.order_status_organization.name
            }
          />
          <Table.Column
            dataIndex="finish"
            title="Завершающий"
            render={(value) => <Switch checked={value} disabled />}
          />
          <Table.Column
            dataIndex="cancel"
            title="Отменяющий"
            render={(value) => <Switch checked={value} disabled />}
          />
          <Table.Column
            dataIndex="waiting"
            title="Ожидающий гостя"
            render={(value) => <Switch checked={value} disabled />}
          />
          <Table.Column
            dataIndex="color"
            title="Цвет"
            render={(value) => (
              <div
                style={{
                  backgroundColor: value,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                }}
              ></div>
            )}
          />
          <Table.Column<IOrderStatus>
            title="Actions"
            dataIndex="actions"
            render={(_text, record): React.ReactNode => {
              return (
                <Space>
                  <EditButton size="small" recordItemId={record.id} hideText />
                </Space>
              );
            }}
          />
        </Table>
      </List>
    </>
  );
};
