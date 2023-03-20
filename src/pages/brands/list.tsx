import { List, useTable, EditButton } from "@refinedev/antd";
import { Table, Space } from "antd";

import { IApiTokens, IBrands } from "interfaces";
import { useGetIdentity } from "@refinedev/core";

export const BrandsList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>({
    v3LegacyAuthProviderCompatible: true
  });
  const { tableProps } = useTable<IBrands>({
    meta: {
      fields: ["id", "name", "sign"],
      whereInputType: "brandsWhereInput!",
      orderByInputType: "brandsOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },

    sorters: {
      initial: []
    }
  });

  return (
    <>
      <List title="Бренды">
        <Table {...tableProps} rowKey="id">
          {/* <Table.Column
            dataIndex="active"
            title="Активный"
            render={(value) => <Switch checked={value} disabled />}
          /> */}
          <Table.Column dataIndex="name" title="Название" />
          <Table.Column<IApiTokens>
            title="Actions"
            dataIndex="actions"
            render={(_text, record): React.ReactNode => {
              return (
                <Space>
                  <EditButton size="small" recordItemId={record.id} hideText />
                  {/* <DeleteButton
                    size="small"
                    recordItemId={record.id}
                    hideText
                  /> */}
                </Space>
              );
            }}
          />
        </Table>
      </List>
    </>
  );
};
