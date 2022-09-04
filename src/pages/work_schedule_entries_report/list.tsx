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
  DatePicker,
  Form,
  Button,
  Col,
  Row,
} from "@pankod/refine-antd";
import { CrudFilters, HttpError, useGetIdentity } from "@pankod/refine-core";

import { IWorkSchedules, WorkScheduleEntriesReportForPeriod } from "interfaces";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useMemo } from "react";

var weekday = require("dayjs/plugin/weekday");
dayjs.locale("ru");
dayjs.extend(weekday);

const dateFormat = "DD.MM.YYYY";

export const WorkSchedulesReport: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { searchFormProps, tableProps } = useTable<
    WorkScheduleEntriesReportForPeriod,
    HttpError,
    { report_start: Date; report_end: Date }
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
        value: params.report_start ?? dayjs().startOf("w").toDate(),
      });
      filters.push({
        field: "report_end",
        operator: "eq",
        value: params.report_end ?? dayjs().endOf("w").toDate(),
      });

      console.log(filters);

      return filters;
    },
  });

  console.log(searchFormProps);

  const tableColumns = useMemo(async () => {
    let res = [
      {
        title: "ФИО",
        dataIndex: "users",
        render: (record: any) => {
          return `${record.first_name} ${record.last_name}`;
        },
      },
    ];

    let formValues = await searchFormProps?.form?.getFieldsValue();
    console.log(formValues);
    return res;
  }, [tableProps.loading]);

  console.log(tableColumns);

  return (
    <>
      <List title="Отчёт по рабочим графикам">
        <Form layout="vertical" {...searchFormProps}>
          <Row gutter={16} align="bottom">
            <Col span={4}>
              <Form.Item name="report_start" label="Дата начала">
                <DatePicker format={dateFormat} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="report_end" label="Дата окончания">
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
      </List>
    </>
  );
};
