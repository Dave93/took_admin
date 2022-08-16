import {
  List,
  TagField,
  DateField,
  Table,
  useTable,
  Switch,
} from "@pankod/refine-antd";

import { IPermissions } from "interfaces";

export const PermissionsList: React.FC = () => {
  const { tableProps } = useTable<IPermissions>({
    initialSorter: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    metaData: {
      fields: ["id", "slug", "active", "created_at"],
      whereInputType: "permissionsWhereInput!",
      orderByInputType: "permissionsOrderByWithRelationInput!",
    },
  });
  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="active"
          title="Активность"
          render={(value) => <Switch checked={value} disabled />}
        />
        <Table.Column dataIndex="slug" title="Код" />
        <Table.Column
          dataIndex="created_at"
          title="Дата создания"
          render={(value) => (
            <DateField format="LLL" value={value} locales="ru" />
          )}
        />
      </Table>
    </List>
  );
};
