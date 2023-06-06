import { Edit, PageHeader, useDrawerForm } from "@refinedev/antd";

import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Table,
} from "antd";

import { SortOrder } from "antd/lib/table/interface";
import { useGetIdentity, useTranslate } from "@refinedev/core";
import { DateTime } from "luxon";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import dayjs from "dayjs";
import { GarantReportItem, ITerminals, IUsers } from "interfaces";
import { ExportOutlined, EditOutlined } from "@ant-design/icons";
import { Excel } from "components/export/src";
import { chain, filter, sortBy } from "lodash";
import { drive_type, user_status } from "interfaces/enums";
import { FaWalking } from "react-icons/fa";
import { AiFillCar } from "react-icons/ai";
import { MdDirectionsBike } from "react-icons/md";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import CourierDriveTypeIcon from "components/users/courier_drive_type_icon";

dayjs.extend(utc);
dayjs.extend(timezone);

const YuriyOrdersGarantReport = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [garantData, setGarantData] = useState<GarantReportItem[]>([]);
  const [filteredData, setFilteredData] = useState<GarantReportItem[]>([]);
  const [couriersList, setCouriersList] = useState<IUsers[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const { handleSubmit, control, watch } = useForm();

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
            bonus_total
            earned
            balance
            garant_days
            balance_to_pay
            drive_type
            possible_garant_price
            terminal_name
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
        "order_start_date",
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
            <CourierDriveTypeIcon driveType={record.drive_type} />
          </>
        );
      },
    },
    {
      title: "Остаток для выплаты",
      dataIndex: "balance_to_pay",
      sorter: (a: any, b: any) => a.balance_to_pay - b.balance_to_pay,
      defaultSortOrder: "descend" as SortOrder | undefined,
      excelRender: (value: any) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Количество заказов",
      dataIndex: "orders_count",
      sorter: (a: any, b: any) => a.orders_count - b.orders_count,
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
      title: "Количество отработанных дней",
      dataIndex: "order_dates_count",
      sorter: (a: any, b: any) => a.order_dates_count - b.order_dates_count,
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
      title: "Количество гарантных дней",
      dataIndex: "garant_days",
      sorter: (a: any, b: any) => a.garant_days - b.garant_days,
    },
    {
      title: "Возможные дни отгула",
      dataIndex: "possible_day_offs",
    },
    {
      title: "Дни без заказа",
      dataIndex: "actual_day_offs",
      sorter: (a: any, b: any) => a.actual_day_offs - b.actual_day_offs,
    },
    {
      title: "Сумма всех доставок",
      dataIndex: "delivery_price",
      excelRender: (value: any) => value,
      sorter: (a: any, b: any) => a.delivery_price - b.delivery_price,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Сумма бонусов",
      dataIndex: "bonus_total",
      excelRender: (value: any) => value,
      sorter: (a: any, b: any) => a.bonus_total - b.bonus_total,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Получил",
      dataIndex: "earned",
      excelRender: (value: any) => value,
      sorter: (a: any, b: any) => a.earned - b.earned,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Кошелёк",
      dataIndex: "balance",
      excelRender: (value: any) => value,
      sorter: (a: any, b: any) => a.balance - b.balance,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Стоимость гаранта",
      dataIndex: "garant_price",
      excelRender: (value: any) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Упущенный гарант",
      dataIndex: "possible_garant_price",
      sorter: (a: any, b: any) =>
        a.possible_garant_price - b.possible_garant_price,
      excelRender: (value: any) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Действия",
      dataIndex: "id",
      exportable: false,
      width: 55,
      render: (value: string, record: GarantReportItem) => (
        <div>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => show(record.courier_id)}
          />
          <Button
            icon={<ArrowTopRightOnSquareIcon />}
            size="small"
            onClick={() => window.open(`/users/show/${record.courier_id}`)}
          />
        </div>
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
        cachedTerminals {
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
            status: { equals: active }
          }
        ) {
          first_name
          last_name
          id
        }
      }
    `;
    const { cachedTerminals, users } = await client.request<{
      cachedTerminals: ITerminals[];
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
    setCouriersList(users);
    setTerminals(sortBy(cachedTerminals, ["name"]));
  };

  const resultData = useMemo(() => {
    var result = chain(filteredData)
      .groupBy("terminal_name")
      .toPairs()
      .map(function (item) {
        return {
          name: item[0],
          children: item[1],
        };
      })
      .value();
    return result;
  }, [filteredData]);
  console.log("resultData", resultData);
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
                  <Form.Item label="Филиал">
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
                    $data: usersUncheckedUpdateInput!
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
              <Col span={12}>
                <Form.Item
                  label="Дата начала заказов для гаранта"
                  name="order_start_date"
                  getValueProps={(value) => ({
                    value: value ? dayjs(value) : "",
                  })}
                >
                  <DatePicker allowClear format="DD.MM.YYYY" />
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

export default YuriyOrdersGarantReport;
