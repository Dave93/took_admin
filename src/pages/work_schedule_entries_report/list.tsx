import {
  List,
  Table,
  useTable,
  Space,
  Tag,
  DatePicker,
  Form,
  Button,
  Col,
  Row,
} from "@pankod/refine-antd";
import { CrudFilters, HttpError, useGetIdentity } from "@pankod/refine-core";

import { WorkScheduleEntriesReportForPeriod } from "interfaces";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import duration from "dayjs/plugin/duration";
import { useMemo } from "react";

var weekday = require("dayjs/plugin/weekday");
dayjs.locale("ru");
dayjs.extend(weekday);
dayjs.extend(duration);

const dateFormat = "DD.MM.YYYY";

export const WorkSchedulesReport: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { searchFormProps, tableProps, filters } = useTable<
    WorkScheduleEntriesReportForPeriod,
    HttpError,
    { report_start: any; report_end: any }
  >({
    metaData: {
      fields: [
        { users: ["first_name", "id", "last_name"] },
        {
          work_schedule_entries: [
            "day",
            "duration",
            "first_name",
            "last_name",
            "late",
            "user_id",
          ],
        },
      ],
      whereInputType: "work_schedule_entriesReportWhereInput!",
      orderByInputType: "work_schedule_entriesOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
    initialFilter: [
      {
        field: "report_start",
        operator: "eq",
        value: dayjs().startOf("w").toDate(),
      },
      {
        field: "report_end",
        operator: "eq",
        value: dayjs().endOf("w").toDate(),
      },
    ],
    onSearch: async (params) => {
      const filters: CrudFilters = [];
      filters.push({
        field: "report_start",
        operator: "eq",
        value: params.report_start
          ? params.report_start.toDate()
          : dayjs().startOf("w"),
      });
      filters.push({
        field: "report_end",
        operator: "eq",
        value: params.report_end
          ? params.report_end.toDate()
          : dayjs().endOf("w"),
      });
      return filters;
    },
  });

  const tableColumns = useMemo(() => {
    let res: any = [
      {
        title: "ФИО",
        dataIndex: "users",
        fixed: "left",
      },
    ];

    if (!tableProps.loading) {
      let formValues: any = {};
      filters?.forEach(
        (filter: any) => (formValues[filter.field] = filter.value)
      );
      let reportStart = formValues?.report_start ?? dayjs().startOf("w");
      let reportEnd = formValues?.report_end ?? dayjs().endOf("w");

      let days = dayjs(reportEnd).diff(dayjs(reportStart), "day");
      for (let i = 0; i <= days; i++) {
        let date = dayjs(reportStart).add(i, "day");
        res.push({
          title: date.format("DD.MM"),
          dataIndex: `date_${date.format("DD_MM_YYYY")}`,
          render: (value: any, record: any) => {
            return (
              <Space>
                <Tag color={value?.late ? "red" : "green"}>
                  {dayjs.duration(value?.duration * 1000).format("HH:mm:ss")}
                </Tag>
              </Space>
            );
          },
        });
      }

      res.push({
        title: "Итого",
        dataIndex: `total`,
        fixed: "right",
        render: (value: any, record: any) => {
          return (
            <Space>
              <Tag color="blue">
                {dayjs.duration(value * 1000).format("HH:mm:ss")}
              </Tag>
            </Space>
          );
        },
      });
    }

    return res;
  }, [tableProps.loading]);

  const tableDataSource = useMemo<any>(() => {
    let users: any = {};

    let formValues: any = {};
    filters?.forEach(
      (filter: any) => (formValues[filter.field] = filter.value)
    );
    let data: any = tableProps.dataSource;

    if (!tableProps.loading) {
      let reportStart = formValues?.report_start ?? dayjs().startOf("w");
      let reportEnd = formValues?.report_end ?? dayjs().endOf("w");
      data?.users?.forEach((user: any) => {
        users[user.id] = {
          users: `${user.first_name} ${user.last_name}`,
          total: 0,
        };
        let days = dayjs(reportEnd).diff(dayjs(reportStart), "day");
        for (let i = 0; i <= days; i++) {
          const date = dayjs(reportStart).add(i, "day");
          users[user.id][`date_${date.format("DD_MM_YYYY")}`] = {
            duration: 0,
            late: false,
          };
        }
      });

      data?.work_schedule_entries?.forEach((entry: any) => {
        users[entry.user_id][`date_${dayjs(entry.day).format("DD_MM_YYYY")}`] =
          {
            duration: entry.duration,
            late: entry.late,
          };
        users[entry.user_id].total += entry.duration;
      });
    }

    return Object.values(users);
  }, [tableProps.loading]);

  return (
    <>
      <List title="Отчёт по рабочим графикам">
        <Form
          layout="vertical"
          {...searchFormProps}
          initialValues={{
            report_start: dayjs().startOf("w"),
            report_end: dayjs().endOf("w"),
          }}
        >
          <Row gutter={16} align="bottom">
            <Col span={4}>
              <Form.Item
                name="report_start"
                label="Дата начала"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker format={dateFormat} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="report_end"
                label="Дата окончания"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker format={dateFormat} />
              </Form.Item>
            </Col>
            <Col span={2}>
              <Form.Item>
                <Button htmlType="submit" type="primary">
                  Фильтровать
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Table
          {...tableProps}
          columns={tableColumns}
          dataSource={tableDataSource}
          pagination={false}
          bordered
        />
      </List>
    </>
  );
};
