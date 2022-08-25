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

import { IOrganization } from "interfaces";
import { defaultDateTimeFormat } from "localConstants";

export const OrganizationList: React.FC = () => {
  const { tableProps } = useTable<IOrganization>({
    initialSorter: [
      {
        field: "name",
        order: "desc",
      },
    ],
    metaData: {
      fields: ["id", "name", "active", "created_at", "phone", "webhook"],
      whereInputType: "organizationWhereInput!",
      orderByInputType: "organizationOrderByWithRelationInput!",
      operation: "organizations",
    },
  });
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
