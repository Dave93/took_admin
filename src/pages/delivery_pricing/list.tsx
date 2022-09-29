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
import { useGetIdentity } from "@pankod/refine-core";

import { IDeliveryPricing } from "interfaces";
import { defaultDateTimeFormat } from "localConstants";

export const DeliveryPricingList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { tableProps } = useTable<IDeliveryPricing>({
    initialSorter: [
      {
        field: "name",
        order: "desc",
      },
    ],
    metaData: {
      fields: [
        "id",
        "name",
        {
          organization: ["id", "name"],
        },
        "active",
      ],
      whereInputType: "delivery_pricingWhereInput!",
      orderByInputType: "delivery_pricingOrderByWithRelationInput!",
      operation: "deliveryPricings",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });
  return (
    <>
      <List title="Список условий доставки">
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="active"
            title="Активность"
            render={(value) => <Switch checked={value} disabled />}
          />
          <Table.Column dataIndex="name" title="Название" />
          <Table.Column
            dataIndex="organization.name"
            title="Организация"
            render={(value: any, record: IDeliveryPricing) =>
              record.organization.name
            }
          />
          <Table.Column
            dataIndex="created_at"
            title="Дата создания"
            render={(value) => (
              <DateField
                format={defaultDateTimeFormat}
                value={value}
                locales="ru"
              />
            )}
          />
          <Table.Column<IDeliveryPricing>
            title="Actions"
            dataIndex="actions"
            render={(_text, record): React.ReactNode => {
              return (
                <Space>
                  <EditButton size="small" recordItemId={record.id} hideText />
                  <ShowButton size="small" recordItemId={record.id} hideText />
                </Space>
              );
            }}
          />
        </Table>
      </List>
    </>
  );
};
