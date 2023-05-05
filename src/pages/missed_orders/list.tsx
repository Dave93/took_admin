import {
  Create,
  List,
  ShowButton,
  useDrawerForm,
  useTable,
} from "@refinedev/antd";
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import { CrudFilters, HttpError, useGetIdentity } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "graphConnect";
import { gql } from "graphql-request";
import dayjs from "dayjs";
import { IMissedOrderEntity, IOrders, ITerminals } from "interfaces";
import { rangePresets } from "components/dates/RangePresets";
import { useEffect, useState } from "react";
import { sortBy } from "lodash";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import { SendOrderToYandex } from "components/orders/sendToYandex";

const { RangePicker } = DatePicker;

const MissedOrdersList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [terminals, setTerminals] = useState<ITerminals[]>([]);

  const queryClient = useQueryClient();

  const {
    tableProps,
    searchFormProps,
    filters,
    sorters: sorter,
    setFilters,
  } = useTable<
    IMissedOrderEntity,
    HttpError,
    {
      created_at: [dayjs.Dayjs, dayjs.Dayjs];
      status: string;
      role: string;
      terminal_id: string;
    }
  >({
    queryOptions: {
      queryKey: ["missed_orders"],
    },

    meta: {
      fields: [
        "id",
        "created_at",
        "order_created_at",
        "order_id",
        "order_number",
        "organization_id",
        "terminal_id",
        "system_minutes_config",
        "terminal_name",
        "status",
        "payment_type",
        "allowYandex",
        "is_courier_set",
        {
          order_status: ["id", "name", "color"],
        },
        {
          yandex_delivery_data: [
            "id",
            "created_at",
            {
              pricing_data: ["price", "distance_meters"],
            },
            {
              order_data: [
                "id",
                "version",
                "status",
                "skip_door_to_door",
                "skip_client_notify",
              ],
            },
          ],
        },
      ],
      whereInputType: "missedOrdersWhereInput!",
      orderByInputType: "missedOrdersOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },

    onSearch: async (params) => {
      const localFilters: CrudFilters = [];
      queryClient.invalidateQueries(["default", "missed_orders", "list"]);
      // queryClient.invalidateQueries();
      const { created_at, status, role, terminal_id } = params;

      localFilters.push(
        {
          field: "created_at",
          operator: "gte",
          value: created_at ? created_at[0].toISOString() : undefined,
        },
        {
          field: "created_at",
          operator: "lte",
          value: created_at ? created_at[1].toISOString() : undefined,
        }
      );

      if (terminal_id && terminal_id.length) {
        localFilters.push({
          field: "terminal_id",
          operator: "in",
          value: terminal_id,
        });
      }

      return localFilters;
    },

    pagination: {
      pageSize: 800,
    },

    filters: {
      initial: [
        {
          field: "created_at",
          operator: "gte",
          value: dayjs().startOf("d").toDate(),
        },
        {
          field: "created_at",
          operator: "lte",
          value: dayjs().endOf("d").toDate(),
        },
      ],

      defaultBehavior: "replace",
    },

    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });

  const getAllFilterData = async () => {
    const query = gql`
      query {
        cachedTerminals {
          id
          name
          organization_id
          organization {
            id
            name
          }
        }
      }
    `;
    const { cachedTerminals } = await client.request<{
      cachedTerminals: ITerminals[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setTerminals(sortBy(cachedTerminals, (item) => item.name));
  };

  const changeStatus = async (id: string, status: string) => {
    const query = gql`
      mutation ($id: String!, $status: String!) {
        updateMissedOrder(id: $id, status: $status)
      }
    `;
    await client.request(
      query,
      { id, status },
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );
    queryClient.invalidateQueries(["default", "missed_orders", "list"]);
  };

  useEffect(() => {
    getAllFilterData();
  }, []);

  const columns = [
    {
      title: "№",
      dataIndex: "order_number",
      width: 60,
      excelRender: (value: any, record: any, index: number) => index + 1,
      render: (value: any, record: any, index: number) => (
        <div>{index + 1}</div>
      ),
    },
    {
      title: "Статус",
      dataIndex: "status",
      width: 120,
      render: (value: any, record: IMissedOrderEntity) => {
        if (record.is_courier_set) {
          return (
            <Tag color={record.order_status.color}>
              <div
                style={{
                  fontWeight: 800,
                  color: "#000",
                  textTransform: "uppercase",
                }}
              >
                {record.order_status.name}
              </div>
            </Tag>
          );
        }
        if (value === "new") {
          return (
            <Button
              type="primary"
              shape="round"
              size="small"
              onClick={() => changeStatus(record.id, "pending")}
            >
              Взять в работу
            </Button>
          );
        } else if (value === "pending") {
          return (
            <Button
              type="primary"
              shape="round"
              size="small"
              onClick={() => changeStatus(record.id, "done")}
            >
              Фиксировать
            </Button>
          );
        } else if (value === "done") {
          return (
            <Button
              type="primary"
              shape="round"
              size="small"
              onClick={() => changeStatus(record.id, "new")}
            >
              Отменить фиксацию
            </Button>
          );
        }
      },
    },
    {
      title: "Дата заказа",
      dataIndex: "order_created_at",
      width: 150,
      excelRender: (value: any) => dayjs(value).format("DD.MM.YYYY HH:mm"),
      render: (value: any) => (
        <div>{dayjs(value).format("DD.MM.YYYY HH:mm")}</div>
      ),
    },
    {
      title: "Дата фиксации",
      dataIndex: "created_at",
      width: 150,
      excelRender: (value: any) => dayjs(value).format("DD.MM.YYYY HH:mm"),
      render: (value: any) => (
        <div>{dayjs(value).format("DD.MM.YYYY HH:mm")}</div>
      ),
    },
    {
      title: "Минуты для фиксации",
      dataIndex: "system_minutes_config",
      width: 150,
    },
    {
      title: "Номер заказа",
      dataIndex: "order_number",
      width: 200,
      render: (value: any, record: any) => (
        <Space>
          {value}
          <Button
            icon={<ArrowTopRightOnSquareIcon />}
            size="small"
            onClick={() => window.open(`/orders/show/${record.order_id}`)}
          />
        </Space>
      ),
    },
    {
      title: "Филиал",
      dataIndex: "terminal_name",
      width: 200,
    },
    {
      title: "Тип оплаты",
      dataIndex: "payment_type",
      width: 100,
    },
    {
      title: "Отправить Яндексом",
      dataIndex: "allowYandex",
      width: 300,
      render: (value: any, record: any) => (
        <div>
          <SendOrderToYandex
            order={record as IOrders}
            token={identity?.token.accessToken!}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <List title="Упущенные заказы">
        <Form
          layout="vertical"
          {...searchFormProps}
          initialValues={{
            created_at: [dayjs().startOf("d"), dayjs().endOf("d")],
          }}
        >
          <Row gutter={16} align="bottom">
            <Col xs={12} sm={12} md={5}>
              <Form.Item label="Дата заказа" name="created_at">
                <RangePicker
                  format={"DD.MM.YYYY HH:mm"}
                  showTime
                  presets={rangePresets}
                />
              </Form.Item>
            </Col>
            <Col xs={12} sm={12} md={3}>
              <Form.Item name="terminal_id" label="Филиал">
                <Select
                  showSearch
                  optionFilterProp="children"
                  allowClear
                  mode="multiple"
                >
                  {terminals.map((terminal: any) => (
                    <Select.Option key={terminal.id} value={terminal.id}>
                      {terminal.name}
                    </Select.Option>
                  ))}
                </Select>
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
        <div
          style={{
            overflow: "auto",
          }}
        >
          <Table
            {...tableProps}
            rowKey="id"
            bordered
            size="small"
            scroll={
              window.innerWidth < 768
                ? undefined
                : { y: "calc(100vh - 390px)", x: "calc(100vw - 350px)" }
            }
            pagination={{
              ...tableProps.pagination,
              showSizeChanger: true,
            }}
            columns={columns}
          />
        </div>
      </List>
    </>
  );
};

export default MissedOrdersList;
