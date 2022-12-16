import {
  List,
  DateField,
  Table,
  useTable,
  Space,
  EditButton,
  ShowButton,
} from "@pankod/refine-antd";
import { useGetIdentity, useTranslate } from "@pankod/refine-core";

import { IUsers } from "interfaces";
import { defaultDateTimeFormat } from "localConstants";

const OnlineStatus = ({ value }: { value: boolean }) => {
  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: value ? "green" : "red",
      }}
    ></div>
  );
};

export const UsersList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { tableProps } = useTable<IUsers>({
    initialSorter: [
      {
        field: "first_name",
        order: "asc",
      },
    ],
    metaData: {
      fields: [
        "id",
        "first_name",
        "last_name",
        "created_at",
        "is_online",
        "drive_type",
        "card_number",
        "phone",
        "latitude",
        "longitude",
        "status",
        {
          users_terminals: [
            {
              terminals: ["id", "name"],
            },
          ],
        },
      ],
      whereInputType: "usersWhereInput!",
      orderByInputType: "usersOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  const tr = useTranslate();

  return (
    <>
      <List title="Список пользователей">
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="status"
            title="Статус"
            render={(value) => tr(`users.status.${value}`)}
          />
          <Table.Column
            dataIndex="is_online"
            title="Онлайн"
            render={(value) => <OnlineStatus value={value} />}
          />
          <Table.Column dataIndex="phone" title="Телефон" />
          <Table.Column dataIndex="first_name" title="Имя" />
          <Table.Column dataIndex="last_name" title="Фамилия" />
          {/* <Table.Column dataIndex="roles" title="Роль" render={(value, record: IUsers) => } /> */}
          <Table.Column
            dataIndex="drive_type"
            title="Тип доставки"
            render={(value) => tr("deliveryPricing.driveType." + value)}
          />
          <Table.Column dataIndex="card_number" title="Номер карты" />
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
          <Table.Column<IUsers>
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
