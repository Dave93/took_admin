import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Switch, Space, Button } from "antd";
import { useCopyToClipboard } from "usehooks-ts";

import Hashids from "hashids";

import { IApiTokens } from "interfaces";
import { useGetIdentity, useNotification } from "@refinedev/core";

export const ApiTokensList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>({
    v3LegacyAuthProviderCompatible: true
  });
  const [value, copy] = useCopyToClipboard();
  const { open } = useNotification();
  const { tableProps } = useTable<IApiTokens>({
    meta: {
      fields: [
        "id",
        "token",
        "active",
        {
          api_tokens_organization: ["id", "name"],
        },
      ],
      whereInputType: "api_tokensWhereInput!",
      orderByInputType: "api_tokensOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },

    sorters: {
      initial: []
    }
  });

  const copyToken = (token: string) => {
    copy(token);
    open!({
      message: "Token copied",
      type: "success",
    });
  };

  return (
    <>
      <List title="API Токены">
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="active"
            title="Активный"
            render={(value) => <Switch checked={value} disabled />}
          />
          <Table.Column
            dataIndex="token"
            title="Токен"
            render={(value) => (
              <div>
                {value}{" "}
                <Button type="link" onClick={() => copyToken(value)}>
                  Copy
                </Button>
              </div>
            )}
          />
          <Table.Column
            dataIndex="organization.name"
            title="Организация"
            render={(value: any, record: IApiTokens) =>
              record.api_tokens_organization.name
            }
          />
          <Table.Column<IApiTokens>
            title="Actions"
            dataIndex="actions"
            render={(_text, record): React.ReactNode => {
              return (
                <Space>
                  <EditButton size="small" recordItemId={record.id} hideText />
                  <DeleteButton
                    size="small"
                    recordItemId={record.id}
                    hideText
                  />
                </Space>
              );
            }}
          />
        </Table>
      </List>
    </>
  );
};
