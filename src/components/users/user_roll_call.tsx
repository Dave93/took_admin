import { Col, Form, Row, DatePicker, Button, Table } from "@pankod/refine-antd";
import { rangePresets } from "components/dates/RangePresets";
import { Excel } from "components/export/src";
import dayjs from "dayjs";
import { ITimesheet, IUsers } from "interfaces";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useGetIdentity } from "@pankod/refine-core";
import { ExportOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

const UserRollCallList = ({ user }: { user: IUsers }) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<ITimesheet[]>([]);
  const { handleSubmit, control, getValues } = useForm<{
    created_at: [dayjs.Dayjs, dayjs.Dayjs];
  }>({
    defaultValues: {
      created_at: [dayjs().startOf("w"), dayjs().endOf("w")],
    },
  });

  const onSubmit = async (data: any) => {
    loadData();
  };

  const loadData = async () => {
    setIsLoading(true);

    const { created_at } = getValues();

    const query = gql`
      query {
        courierRollCallList(
          startDate: "${created_at[0].toISOString()}"
          endDate: "${created_at[1].toISOString()}"
            courierId: "${user.id}"
        ) {
            id
            date
            is_late
            created_at
        }
      }
    `;
    const { courierRollCallList } = await client.request<{
      courierRollCallList: ITimesheet[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });

    setData(courierRollCallList);
    setIsLoading(false);
  };

  const columns = [
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      exportable: true,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
    },
    {
      title: "Время",
      dataIndex: "created_at",
      key: "created_at",
      exportable: true,
      render: (value: string) => dayjs(value).format("HH:mm"),
    },
    {
      title: "Опоздал",
      dataIndex: "is_late",
      key: "is_late",
      exportable: true,
      render: (value: boolean) => (value ? "Да" : "Нет"),
    },
  ];

  const exportData = async () => {
    setIsLoading(true);
    const excel = new Excel();
    excel
      .addSheet("test")
      .addColumns(columns.filter((c) => c.exportable !== false))
      .addDataSource(data, {
        str2Percent: true,
      })
      .saveAs(`Перекличка ${user.first_name} ${user.last_name}.xlsx`);

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    return () => {};
  }, []);
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1>Перекличка</h1>
        <Button type="default" icon={<ExportOutlined />} onClick={exportData}>
          Экспорт
        </Button>
      </div>
      <Form onFinish={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Дата">
              <Controller
                name="created_at"
                control={control}
                render={({ field }) => (
                  <RangePicker
                    {...field}
                    showTime
                    format="DD.MM.YYYY HH:mm"
                    presets={rangePresets}
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Фильтровать
            </Button>
          </Col>
        </Row>
      </Form>
      <Table
        dataSource={data}
        rowKey="id"
        bordered
        size="small"
        columns={columns}
        pagination={{
          pageSize: 200,
        }}
      />
    </>
  );
};

export default UserRollCallList;
