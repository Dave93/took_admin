import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  PageHeader,
  Row,
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
import { ExportOutlined } from "@ant-design/icons";
import { Excel } from "components/export/src";
import { DebounceInput } from "react-debounce-input";

const OrdersGarantReport = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [garantData, setGarantData] = useState<GarantReportItem[]>([]);
  const [filteredData, setFilteredData] = useState<GarantReportItem[]>([]);
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
    if (month) {
      // start of month using dayjs and to iso date
      startDate = month.startOf("month").toISOString();
      // end of month using dayjs and to iso date
      endDate = month.endOf("month").toISOString();
    }

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
            earned,
            balance
        }
      }
    `;

    const { calculateGarant } = await client.request<{
      calculateGarant: GarantReportItem[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setGarantData(calculateGarant);
    setFilteredData(calculateGarant);
    setIsLoading(false);
  };

  const columns = [
    {
      title: "Курьер",
      dataIndex: "courier",
    },
    {
      title: "Дата начала",
      dataIndex: "begin_date",
      render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
    },
    {
      title: "Дата последнего заказа",
      dataIndex: "last_order_date",
      render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
    },
    {
      title: "Дата создания",
      dataIndex: "created_at",
      render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
    },
    {
      title: "Статус",
      dataIndex: "status",
      render: (value: string) => tr(`users.status.${value}`),
    },
    {
      title: "Среднее время доставки",
      dataIndex: "formatted_avg_delivery_time",
    },
    {
      title: "Количество заказов",
      dataIndex: "orders_count",
    },
    {
      title: "Количество дней с заказами",
      dataIndex: "order_dates_count",
    },
    {
      title: "Возможные дни отгула",
      dataIndex: "possible_day_offs",
    },
    {
      title: "Фактические дни отгула",
      dataIndex: "actual_day_offs",
    },
    {
      title: "Стоимость доставки",
      dataIndex: "delivery_price",
      excelRender: (value: any) => value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Заработал",
      dataIndex: "earned",
      excelRender: (value: any) => value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Не получил",
      dataIndex: "balance",
      excelRender: (value: any) => value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Стоимость гаранта",
      dataIndex: "garant_price",
      excelRender: (value: any) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
  ];

  const exportData = async () => {
    setIsLoading(true);
    const excel = new Excel();
    excel
      .addSheet("test")
      .addColumns(columns)
      .addDataSource(garantData, {
        str2Percent: true,
      })
      .saveAs("Гарант.xlsx");

    setIsLoading(false);
  };

  const tr = useTranslate();

  useEffect(() => {
    loadData();

    return () => {};
  }, []);

  return (
    <div>
      <PageHeader
        title="Гарант"
        ghost={false}
        extra={
          <Space>
            <Button
              type="default"
              icon={<ExportOutlined />}
              onClick={exportData}
            >
              Экспорт
            </Button>
          </Space>
        }
      >
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
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Месяц">
                    <Controller
                      name="month"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          picker="month"
                          format="MMM YYYY"
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Курьер">
                    <DebounceInput
                      minLength={2}
                      debounceTimeout={300}
                      style={{
                        position: "relative",
                        display: "inline-block",
                        width: "100%",
                        color: "#626262",
                        fontSize: "14px",
                        lineHeight: "1.5715",
                        backgroundColor: "#fff",
                        backgroundImage: "none",
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px",
                        transition: "all 0.3s",
                        flex: "auto",
                        minWidth: "1px",
                        height: "auto",
                        padding: "4px 11px",
                        background: "transparent",
                      }}
                      onChange={(event) =>
                        setFilteredData(
                          garantData.filter((item) =>
                            item.courier
                              .toLowerCase()
                              .includes(event.target.value.toLowerCase())
                          )
                        )
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Form>
          <Card bordered={false}>
            <Table
              dataSource={filteredData}
              rowKey="id"
              bordered
              size="small"
              columns={columns}
            />
          </Card>
        </Spin>
      </PageHeader>
    </div>
  );
};

export default OrdersGarantReport;
