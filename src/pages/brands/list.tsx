import {
  List,
  Table,
  useTable,
  Switch,
  Space,
  EditButton,
  Button,
  DeleteButton,
} from "@pankod/refine-antd";
import { useCopyToClipboard } from "usehooks-ts";

import Hashids from "hashids";

import { IApiTokens, IBrands } from "interfaces";
import { useGetIdentity, useNotification } from "@pankod/refine-core";

export const BrandsList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [value, copy] = useCopyToClipboard();
  const { open } = useNotification();
  const { tableProps } = useTable<IBrands>({
    initialSorter: [],
    metaData: {
      fields: ["id", "name", "sign"],
      whereInputType: "brandsWhereInput!",
      orderByInputType: "brandsOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
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
