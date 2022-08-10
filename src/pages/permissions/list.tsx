import {
  List,
  TagField,
  DateField,
  Table,
  useTable,
} from "@pankod/refine-antd";

import { IPermissions } from "interfaces";

export const PermissionsList: React.FC = () => {
  const { tableProps } = useTable<IPermissions>();
  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="slug" title="slug" />
        <Table.Column
          dataIndex="active"
          title="active"
          render={(value) => <TagField value={value} />}
        />
        <Table.Column
          dataIndex="createdAt"
          title="createdAt"
          render={(value) => <DateField format="LLL" value={value} />}
        />
      </Table>
    </List>
  );
};
