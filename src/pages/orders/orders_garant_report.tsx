import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Edit,
  EditButton,
  Form,
  Input,
  InputNumber,
  PageHeader,
  Row,
  Select,
  Space,
  Spin,
  Table,
  useDrawerForm,
} from "@pankod/refine-antd";
import { useGetIdentity, useTranslate } from "@pankod/refine-core";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import dayjs from "dayjs";
import {
  GarantReportItem,
  IRoles,
  ITerminals,
  IUsers,
  IWorkSchedules,
} from "interfaces";
import { ExportOutlined, EditOutlined } from "@ant-design/icons";
import { Excel } from "components/export/src";
import { DebounceInput } from "react-debounce-input";
import { chain } from "lodash";
import { drive_type, user_status } from "interfaces/enums";

const OrdersGarantReport = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [garantData, setGarantData] = useState<GarantReportItem[]>([]);
  const [filteredData, setFilteredData] = useState<GarantReportItem[]>([]);
  const [roles, setRoles] = useState<IRoles[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [work_schedules, setWorkSchedules] = useState<any[]>([]);
  const {
    handleSubmit,
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const tr = useTranslate();

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
            courier_id
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
            balance,
            garant_days,
            balance_to_pay
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

  const {
    drawerProps,
    formProps,
    show,
    saveButtonProps,
    deleteButtonProps,
    id,
  } = useDrawerForm<IUsers>({
    action: "edit",
    resource: "users",
    metaData: {
      fields: [
        "id",
        "first_name",
        "last_name",
        "created_at",
        "drive_type",
        "car_model",
        "car_number",
        "card_name",
        "card_number",
        "phone",
        "latitude",
        "longitude",
        "status",
        "max_active_order_count",
        "doc_files",
        {
          users_terminals: [
            {
              terminals: ["id", "name"],
            },
          ],
        },
        {
          users_work_schedules: [
            {
              work_schedules: ["id", "name"],
            },
          ],
        },
        {
          users_roles_usersTousers_roles_user_id: [
            {
              roles: ["id", "name"],
            },
          ],
        },
      ],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

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
      filters: [
        {
          text: tr("users.status.active"),
          value: "active",
        },
        {
          text: tr("users.status.inactive"),
          value: "inactive",
        },
        {
          text: tr("users.status.blocked"),
          value: "blocked",
        },
      ],
      onFilter: (value: string | number | boolean, record: GarantReportItem) =>
        record.status == value,
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
      title: "Количество гарантных дней",
      dataIndex: "garant_days",
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
      title: "Сумма всех доставок",
      dataIndex: "delivery_price",
      excelRender: (value: any) => value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Выдано",
      dataIndex: "earned",
      excelRender: (value: any) => value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Кошелёк",
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
    {
      title: "Остаток для выплаты",
      dataIndex: "balance_to_pay",
      excelRender: (value: any) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Действия",
      dataIndex: "id",
      render: (value: string, record: GarantReportItem) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => show(record.courier_id)}
          />
        </Space>
      ),
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

  const fetchAllData = async () => {
    const query = gql`
      query {
        roles {
          id
          name
        }
        cachedTerminals {
          id
          name
          organization {
            id
            name
          }
        }
        workSchedules {
          id
          name
          organization {
            id
            name
          }
        }
      }
    `;
    const { roles, cachedTerminals, workSchedules } = await client.request<{
      roles: IRoles[];
      cachedTerminals: ITerminals[];
      workSchedules: IWorkSchedules[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });

    var result = chain(cachedTerminals)
      .groupBy("organization.name")
      .toPairs()
      .map(function (item) {
        return {
          name: item[0],
          children: item[1],
        };
      })
      .value();
    var workScheduleResult = chain(workSchedules)
      .groupBy("organization.name")
      .toPairs()
      .map(function (item) {
        return {
          name: item[0],
          children: item[1],
        };
      })
      .value();

    setWorkSchedules(workScheduleResult);
    setTerminals(result);
    setRoles(roles);
  };

  useEffect(() => {
    fetchAllData();
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
                <Col span={6}>
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
              pagination={{
                pageSize: 200,
              }}
            />
          </Card>
        </Spin>
      </PageHeader>
      <Drawer {...drawerProps} width={600}>
        <Edit
          saveButtonProps={saveButtonProps}
          deleteButtonProps={deleteButtonProps}
          recordItemId={id}
          title="Редактирование разрешения"
        >
          <Form {...formProps} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Статус"
                  name="status"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select>
                    {Object.keys(user_status).map((status: string) => (
                      <Select.Option key={status} value={status}>
                        {tr(`users.status.${status}`)}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Имя"
                  name="first_name"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Фамилия"
                  name="last_name"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Телефон" name="phone">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Тип доставки" name="drive_type">
                  <Select>
                    {Object.keys(drive_type).map((type: string) => (
                      <Select.Option key={type} value={type}>
                        {tr(`deliveryPricing.driveType.${type}`)}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Максимальное количество активных заказов"
                  name="max_active_order_count"
                >
                  <InputNumber type="number" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Имя на карте" name="card_name">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Номер карты" name="card_number">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Модель машины" name="car_model">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Гос. номер машины" name="car_number">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Edit>
      </Drawer>
    </div>
  );
};

export default OrdersGarantReport;
