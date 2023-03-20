import { List, useTable, ShowButton } from "@refinedev/antd";
import { Table, Space } from "antd";
import { useGetIdentity, useNavigation } from "@refinedev/core";

import { ICustomers } from "interfaces";

export const CustomersList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>({
    v3LegacyAuthProviderCompatible: true
  });
  const { show } = useNavigation();

  const { tableProps } = useTable<ICustomers>({
    meta: {
      fields: ["id", "name", "phone"],
      whereInputType: "customersWhereInput!",
      orderByInputType: "customersOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },

    sorters: {
      initial: [
        {
          field: "name",
          order: "asc",
        },
      ]
    }
  });
  return (
    <>
      <List title="Список клиентов">
        <Table
          {...tableProps}
          rowKey="id"
          onRow={(record, index) => ({
            onDoubleClick: () => {
              show("customers", record.id);
            },
          })}
        >
          <Table.Column dataIndex="name" title="Ф.И.О." />
          <Table.Column dataIndex="phone" title="Телефон" />
          <Table.Column<ICustomers>
            title="Действия"
            dataIndex="actions"
            render={(_text, record): React.ReactNode => {
              return (
                <Space>
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
