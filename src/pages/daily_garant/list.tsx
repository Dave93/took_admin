import {
  List,
  DateField,
  useTable,
  EditButton,
  ShowButton,
} from "@refinedev/antd";
import { Table, Switch, Space, Tag } from "antd";
import { useGetIdentity } from "@refinedev/core";

import { IDailyGarant, IWorkSchedules } from "interfaces";
import { defaultDateTimeFormat, defaultTimeFormat } from "localConstants";

const daysOfWeekRu = {
  "1": "Понедельник",
  "2": "Вторник",
  "3": "Среда",
  "4": "Четверг",
  "5": "Пятница",
  "6": "Суббота",
  "7": "Воскресенье",
};

export const DailyGarantList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { tableProps } = useTable<IDailyGarant>({
    meta: {
      fields: ["id", "name", "date", "amount", "late_minus_sum"],
      whereInputType: "daily_garantWhereInput!",
      orderByInputType: "daily_garantOrderByWithRelationInput!",
      operation: "dailyGarants",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },

    sorters: {
      initial: [
        {
          field: "name",
          order: "asc",
        },
      ],
    },
  });
  return (
    <>
      <List title="Список тарифов дневного гаранта">
        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="name" title="Название" />
          <Table.Column
            dataIndex="date"
            title="Время"
            render={(value: any, record: IDailyGarant) => (
              <DateField
                format={defaultTimeFormat}
                value={value}
                locales="ru"
              />
            )}
          />
          <Table.Column
            dataIndex="amount"
            title="Сумма"
            render={(value: string) =>
              new Intl.NumberFormat("ru-RU").format(+value)
            }
          />
          <Table.Column
            dataIndex="late_minus_sum"
            title="Сумма штрафа"
            render={(value: string) =>
              new Intl.NumberFormat("ru-RU").format(+value)
            }
          />

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
