import {
  List,
  DateField,
  Table,
  useTable,
  Switch,
  Space,
  EditButton,
  ShowButton,
  Tag,
} from "@pankod/refine-antd";
import { useNavigation } from "@pankod/refine-core";

import { ICustomers } from "interfaces";
import { defaultDateTimeFormat, defaultTimeFormat } from "localConstants";

export const CustomersList: React.FC = () => {
  const { show } = useNavigation();

  const { tableProps } = useTable<ICustomers>({
    initialSorter: [
      {
        field: "name",
        order: "asc",
      },
    ],
    metaData: {
      fields: ["id", "name", "phone"],
      whereInputType: "customersWhereInput!",
      orderByInputType: "customersOrderByWithRelationInput!",
    },
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
