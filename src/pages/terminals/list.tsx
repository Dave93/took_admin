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

import { ITerminals } from "interfaces";
import { defaultDateTimeFormat, defaultTimeFormat } from "localConstants";

export const TerminalsList: React.FC = () => {
  const { tableProps } = useTable<ITerminals>({
    initialSorter: [
      {
        field: "name",
        order: "asc",
      },
      {
        field: "organization_id",
        order: "asc",
      },
    ],
    metaData: {
      fields: [
        "id",
        "name",
        "active",
        "created_at",
        "organization_id",
        "phone",
        "latitude",
        "longitude",
        "external_id",
        {
          organization: ["id", "name"],
        },
      ],
      whereInputType: "terminalsWhereInput!",
      orderByInputType: "terminalsOrderByWithRelationInput!",
    },
  });
  return (
    <>
      <List title="Список филиалов">
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="active"
            title="Активность"
            render={(value) => <Switch checked={value} disabled />}
          />
          <Table.Column dataIndex="name" title="Название" />
          <Table.Column
            dataIndex="organization.name"
            title="Организация"
            render={(value: any, record: ITerminals) =>
              record.organization.name
            }
          />
          <Table.Column dataIndex="phone" title="Телефон" />
          <Table.Column dataIndex="external_id" title="Внешний идентификатор" />
          <Table.Column dataIndex="latitude" title="Широта" />
          <Table.Column dataIndex="longitude" title="Долгота" />
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
          <Table.Column<ITerminals>
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
