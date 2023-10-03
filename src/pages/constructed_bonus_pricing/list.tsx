import {
  List,
  DateField,
  useTable,
  EditButton,
  ShowButton,
} from "@refinedev/antd";
import { Table, Switch, Space } from "antd";
import { useGetIdentity } from "@refinedev/core";

import { IConstructedBonusPricing, IDeliveryPricing } from "interfaces";
import { defaultDateTimeFormat } from "localConstants";

export const ConstructedBonusPricingList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { tableProps } = useTable<IConstructedBonusPricing>({
    meta: {
      fields: [
        "id",
        "name",
        {
          constructed_bonus_pricing_organization: ["id", "name"],
        },
      ],
      whereInputType: "constructed_bonus_pricingWhereInput!",
      orderByInputType: "constructed_bonus_pricingOrderByWithRelationInput!",
      operation: "constructedBonusPricings",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
    pagination: {
      pageSize: 200,
    },
    sorters: {
      initial: [
        {
          field: "name",
          order: "desc",
        },
      ],
    },
  });
  return (
    <>
      <List title="Список условий бонуса к заказу">
        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="name" title="Название" />
          <Table.Column
            dataIndex="organization.name"
            title="Организация"
            render={(value: any, record: IConstructedBonusPricing) =>
              record?.constructed_bonus_pricing_organization?.name
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
