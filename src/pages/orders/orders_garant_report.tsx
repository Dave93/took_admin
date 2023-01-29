import {
  Button,
  Card,
  DatePicker,
  Form,
  PageHeader,
  Space,
  Spin,
  Table,
} from "@pankod/refine-antd";
import { useGetIdentity, useTranslate } from "@pankod/refine-core";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import dayjs from "dayjs";
import { GarantReportItem } from "interfaces";

const OrdersGarantReport = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [garantData, setGarantData] = useState<GarantReportItem[]>([]);
  const {
    handleSubmit,
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const month = watch("month");

  const onSubmit = async (data: any) => {
    loadData();
  };

  const loadData = async () => {
    setIsLoading(true);
    // start of month using luxon
    let startDate = DateTime.local().startOf("month").toISODate();
    // end of month using luxon
    let endDate = DateTime.local().endOf("month").toISODate();
    console.log(month);
    if (month) {
      // start of month using dayjs and to iso date
      startDate = month.startOf("month").toISOString();
      // end of month using dayjs and to iso date
      endDate = month.endOf("month").toISOString();
    }
    console.log(startDate);
    console.log(endDate);

    const query = gql`
      query {
        calculateGarant(startDate: "${startDate}", endDate: "${endDate}") {
            courier
            begin_date
            last_order_date
            created_at
            status
            avg_delivery_time
            formatted_avg_delivery_time
            orders_count
            order_dates_count
            possible_day_offs
            actual_day_offs
            delivery_price
            garant_price
        }
      }
    `;

    const { calculateGarant } = await client.request<{
      calculateGarant: GarantReportItem[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setGarantData(calculateGarant);
    setIsLoading(false);
  };
  const tr = useTranslate();

  useEffect(() => {
    loadData();

    return () => {};
  }, []);

  return (
    <div>
      <PageHeader title="Гарант" ghost={false}>
        <Spin spinning={isLoading}>
          <Form onFinish={handleSubmit(onSubmit)}>
            <Card
              bordered={false}
              actions={[
                <Space key="save-btn">
                  <Button type="primary" htmlType="submit">
                    Фильтровать
                  </Button>
                </Space>,
              ]}
            >
              <Form.Item label="Месяц">
                <Controller
                  name="month"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <DatePicker {...field} picker="month" format="MMM YYYY" />
                  )}
                />
              </Form.Item>
            </Card>
          </Form>
          <Card bordered={false}>
            <Table dataSource={garantData} rowKey="id" bordered size="small">
              <Table.Column title="Курьер" dataIndex="courier" />
              <Table.Column
                title="Дата начала"
                dataIndex="begin_date"
                render={(value) => dayjs(value).format("DD.MM.YYYY")}
              />
              <Table.Column
                title="Дата последнего заказа"
                dataIndex="last_order_date"
                render={(value) => dayjs(value).format("DD.MM.YYYY")}
              />
              <Table.Column
                title="Дата создания"
                dataIndex="created_at"
                render={(value) => dayjs(value).format("DD.MM.YYYY")}
              />
              <Table.Column
                title="Статус"
                dataIndex="status"
                render={(value) => tr(`users.status.${value}`)}
              />
              <Table.Column
                title="Среднее время доставки"
                dataIndex="formatted_avg_delivery_time"
              />
              <Table.Column
                title="Количество заказов"
                dataIndex="orders_count"
              />
              <Table.Column
                title="Количество дней с заказами"
                dataIndex="order_dates_count"
              />
              <Table.Column
                title="Возможные выходные"
                dataIndex="possible_day_offs"
              />
              <Table.Column
                title="Фактические выходные"
                dataIndex="actual_day_offs"
              />
              <Table.Column
                title="Стоимость доставки"
                dataIndex="delivery_price"
              />
              <Table.Column
                title="Стоимость гаранта"
                dataIndex="garant_price"
              />
            </Table>
          </Card>
        </Spin>
      </PageHeader>
    </div>
  );
};

export default OrdersGarantReport;
