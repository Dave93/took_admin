import {
  List,
  DateField,
  useTable,
  EditButton,
  ShowButton,
} from "@refinedev/antd";
import { Table, Switch, Space, Tag } from "antd";
import { useGetIdentity } from "@refinedev/core";

import { IWorkSchedules } from "interfaces";
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

export const WorkSchedulesList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { tableProps } = useTable<IWorkSchedules>({
    meta: {
      fields: [
        "id",
        "name",
        "active",
        "created_at",
        "organization_id",
        "days",
        "start_time",
        "end_time",
        "max_start_time",
        {
          organization: ["id", "name"],
        },
      ],
      whereInputType: "work_schedulesWhereInput!",
      orderByInputType: "work_schedulesOrderByWithRelationInput!",
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
        {
          field: "organization_id",
          order: "asc",
        },
      ],
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
          <Table.Column
            dataIndex="organization.name"
            title="Организация"
            render={(value: any, record: IWorkSchedules) =>
              record.organization.name
            }
          />
          <Table.Column
            dataIndex="days"
            title="Рабочие дни"
            render={(value: any, record: IWorkSchedules) => (
              <>
                {(record.days as string[]).map((day: string) => (
                  <Tag key={day}>
                    {daysOfWeekRu[day as keyof typeof daysOfWeekRu]}
                  </Tag>
                ))}
              </>
            )}
          />
          <Table.Column
            dataIndex="start_time"
            title="Начало"
            render={(value: any, record: IWorkSchedules) => (
              <DateField
                format={defaultTimeFormat}
                value={value}
                locales="ru"
              />
            )}
          />
          <Table.Column
            dataIndex="end_time"
            title="Конец"
            render={(value: any, record: IWorkSchedules) => (
              <DateField
                format={defaultTimeFormat}
                value={value}
                locales="ru"
              />
            )}
          />
          <Table.Column
            dataIndex="max_start_time"
            title="Максимальное время начала"
            render={(value: any, record: IWorkSchedules) => (
              <DateField
                format={defaultTimeFormat}
                value={value}
                locales="ru"
              />
            )}
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
