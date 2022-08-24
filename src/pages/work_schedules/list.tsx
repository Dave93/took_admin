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

import { IWorkSchedules } from "interfaces";
import { defaultDateTimeFormat } from "localConstants";

export const WorkSchedulesList: React.FC = () => {
  const { tableProps } = useTable<IWorkSchedules>({
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
    },
  });
  return (
    <>
      <List title="Список рабочих графиков">
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
          <Table.Column<IWorkSchedules>
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
