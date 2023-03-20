import { List, DateField, useTable, EditButton, ShowButton } from "@refinedev/antd";
import { Table, Switch, Space } from "antd";
import { useGetIdentity } from "@refinedev/core";

import { IRoles } from "interfaces";
import { defaultDateTimeFormat } from "localConstants";

export const RolesList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>({
    v3LegacyAuthProviderCompatible: true
  });
  const { tableProps } = useTable<IRoles>({
    meta: {
      fields: ["id", "name", "active"],
      whereInputType: "rolesWhereInput!",
      orderByInputType: "rolesOrderByWithRelationInput!",
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
  return (
    <>
      <List title="Список ролей">
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="active"
            title="Активность"
            render={(value) => <Switch checked={value} disabled />}
          />
          <Table.Column dataIndex="name" title="Название" />
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
          <Table.Column<IRoles>
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
