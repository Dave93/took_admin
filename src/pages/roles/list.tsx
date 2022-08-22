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

import { IRoles } from "interfaces";
import { defaultDateTimeFormat } from "localConstants";

export const RolesList: React.FC = () => {
  const { tableProps } = useTable<IRoles>({
    initialSorter: [
      {
        field: "name",
        order: "desc",
      },
    ],
    metaData: {
      fields: ["id", "name", "active"],
      whereInputType: "rolesWhereInput!",
      orderByInputType: "rolesOrderByWithRelationInput!",
    },
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
