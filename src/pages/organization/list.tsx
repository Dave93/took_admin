import { List, DateField, useTable, EditButton, ShowButton } from "@refinedev/antd";
import { Table, Switch, Space } from "antd";
import { useGetIdentity, useTranslate } from "@refinedev/core";

import { IOrganization } from "interfaces";
import { defaultDateTimeFormat } from "localConstants";

export const OrganizationList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>({
    v3LegacyAuthProviderCompatible: true
  });
  const { tableProps } = useTable<IOrganization>({
    meta: {
      fields: [
        "id",
        "name",
        "active",
        "created_at",
        "phone",
        "webhook",
        "payment_type",
      ],
      whereInputType: "organizationWhereInput!",
      orderByInputType: "organizationOrderByWithRelationInput!",
      operation: "organizations",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },

    sorters: {
      initial: [
        {
          field: "name",
          order: "desc",
        },
      ]
    }
  });
  const tr = useTranslate();
  return (
    <>
      <List title="Список организаций">
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="active"
            title="Активность"
            render={(value) => <Switch checked={value} disabled />}
          />
          <Table.Column dataIndex="name" title="Название" />
          <Table.Column dataIndex="phone" title="Телефон" />
          <Table.Column dataIndex="webhook" title="Вебхук" />
          <Table.Column
            dataIndex="payment_type"
            title="Тип оплаты"
            render={(value) => `${tr("organizations.paymentType." + value)}`}
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
          <Table.Column<IOrganization>
            title="Действия"
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
