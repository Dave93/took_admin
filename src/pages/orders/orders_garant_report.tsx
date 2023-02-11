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
import { chain, sortBy } from "lodash";
import { drive_type, user_status } from "interfaces/enums";
import { FaWalking } from "react-icons/fa";
import { AiFillCar } from "react-icons/ai";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const { RangePicker } = DatePicker;

const OrdersGarantReport = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [garantData, setGarantData] = useState<GarantReportItem[]>([]);
  const [filteredData, setFilteredData] = useState<GarantReportItem[]>([]);
  const [couriersList, setCouriersList] = useState<IUsers[]>([]);
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
  const status = watch("status");
  const driveType = watch("drive_type");
  const courier_id = watch("courier_id");
  const walletPeriod = watch("wallet_period");
  const terminal_id = watch("terminal_id");

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
      startDate = month
        .tz("Asia/Tashkent")
        .startOf("month")
        .format("YYYY-MM-DD");
      // end of month using dayjs and to iso date
      endDate = month.tz("Asia/Tashkent").endOf("month").format("YYYY-MM-DD");
    }

    const query = gql`
      query {
        calculateGarant(startDate: "${startDate}", endDate: "${endDate}"${
      courier_id ? `, courier_id: ${JSON.stringify(courier_id)}` : ""
    } ${
      walletPeriod ? `, walletEndDate: "${walletPeriod.toISOString()}"` : ""
    } ${
      terminal_id && terminal_id.length
        ? `, terminal_id: ${JSON.stringify(terminal_id)}`
        : ""
    }) {
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
            earned
            balance
            garant_days
            balance_to_pay
            drive_type
            possible_garant_price
        }
      }
    `;

    let { calculateGarant } = await client.request<{
      calculateGarant: GarantReportItem[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setGarantData(calculateGarant);
    if (status) {
      calculateGarant = calculateGarant.filter(
        (item) => item.status === status
      );
    }
    if (driveType) {
      calculateGarant = calculateGarant.filter((item) =>
        driveType.includes(item.drive_type)
      );
    }

    setFilteredData(calculateGarant);
    setIsLoading(false);
  };

  const {
    drawerProps,
    formProps,
    show,
    close,
    saveButtonProps,
    deleteButtonProps,
    id,
  } = useDrawerForm<IUsers>({
    action: "edit",
    resource: "users",
    redirect: false,
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
      title: "№",
      dataIndex: "id",
      width: 50,
      render: (value: string, record: any, index: number) => index + 1,
    },
    {
      title: "Курьер",
      dataIndex: "courier",
      width: 100,
      textWrap: "word-break",
      excelRender: (value: string) => value,
      render: (value: string, record: any) => {
        return (
          <>
            {record.courier}
            {record.drive_type == "foot" ? <FaWalking /> : <AiFillCar />}
          </>
        );
      },
    },
    {
      title: "Дата начала",
      dataIndex: "begin_date",
      width: 105,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
    },
    {
      title: "Дата последнего заказа",
      dataIndex: "last_order_date",
      width: 105,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
    },
    {
      title: "Дата создания",
      dataIndex: "created_at",
      width: 105,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
    },
    {
      title: "Тип доставки",
      dataIndex: "drive_type",
      width: 110,
      textWrap: "word-break",
      render: (value: string) => tr(`deliveryPricing.driveType.${value}`),
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
      title: "Получил",
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
      title: "Упущенный гарант",
      dataIndex: "possible_garant_price",
      excelRender: (value: any) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Действия",
      dataIndex: "id",
      exportable: false,
      width: 50,
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
      .addColumns(columns.filter((c) => c.exportable !== false))
      .addDataSource(filteredData, {
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
        users(
          where: {
            users_roles_usersTousers_roles_user_id: {
              some: { roles: { is: { code: { equals: "courier" } } } }
            }
          }
        ) {
          first_name
          last_name
          id
        }
      }
    `;
    const { roles, cachedTerminals, workSchedules, users } =
      await client.request<{
        roles: IRoles[];
        cachedTerminals: ITerminals[];
        workSchedules: IWorkSchedules[];
        users: IUsers[];
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
    setCouriersList(users);
    setWorkSchedules(workScheduleResult);
    setTerminals(sortBy(cachedTerminals, ["name"]));
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
                <Col span={4}>
                  <Form.Item label="Месяц">
                    <Controller
                      name="month"
                      control={control}
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
                  <Form.Item label="Терминал">
                    <Controller
                      name="terminal_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          showSearch
                          optionFilterProp="children"
                          allowClear
                          mode="multiple"
                        >
                          {terminals.map((terminal: any) => (
                            <Select.Option
                              key={terminal.id}
                              value={terminal.id}
                            >
                              {terminal.name}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Курьер">
                    <Controller
                      name="courier_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Выберите курьера"
                          allowClear
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          filterSort={(optionA, optionB) =>
                            (optionA?.label ?? "")
                              .toLowerCase()
                              .localeCompare(
                                (optionB?.label ?? "").toLowerCase()
                              )
                          }
                          mode="multiple"
                          options={couriersList.map((c) => ({
                            label: `${c.first_name} ${c.last_name}`,
                            value: c.id,
                          }))}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Статус">
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Выберите статус"
                          allowClear
                          options={[
                            {
                              label: tr("users.status.active"),
                              value: "active",
                            },
                            {
                              label: tr("users.status.inactive"),
                              value: "inactive",
                            },
                            {
                              label: tr("users.status.blocked"),
                              value: "blocked",
                            },
                          ]}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Тип доставки">
                    <Controller
                      name="drive_type"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Выберите тип доставки"
                          allowClear
                          mode="multiple"
                        >
                          {Object.keys(drive_type).map((type: string) => (
                            <Select.Option key={type} value={type}>
                              {tr(`deliveryPricing.driveType.${type}`)}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Период кошелька">
                    <Controller
                      name="wallet_period"
                      control={control}
                      render={({ field }) => (
                        <DatePicker {...field} format="DD.MM.YYYY" />
                      )}
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
              scroll={
                window.innerWidth < 768
                  ? undefined
                  : { y: "calc(100vh - 390px)", x: "calc(100vw - 390px)" }
              }
            />
          </Card>
        </Spin>
      </PageHeader>
      <Drawer {...drawerProps} width={600}>
        <Edit
          saveButtonProps={{
            disabled: saveButtonProps.disabled,
            loading: saveButtonProps.loading,
            onClick: async () => {
              try {
                let values: any = await formProps.form?.validateFields();
                let users_terminals = values.users_terminals;
                let work_schedules = values.users_work_schedules;
                let roles = values.users_roles_usersTousers_roles_user_id;
                delete values.users_terminals;
                delete values.users_work_schedules;
                delete values.users_roles_usersTousers_roles_user_id;

                let createQuery = gql`
                  mutation (
                    $data: usersUpdateInput!
                    $where: usersWhereUniqueInput!
                  ) {
                    updateUser(data: $data, where: $where) {
                      id
                    }
                  }
                `;
                let { updateUser } = await client.request<{
                  updateUser: IUsers;
                }>(
                  createQuery,
                  {
                    data: values,
                    where: { id },
                  },
                  { Authorization: `Bearer ${identity?.token.accessToken}` }
                );
                if (updateUser) {
                  close();
                  loadData();
                }
              } catch (error) {}
            },
          }}
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
