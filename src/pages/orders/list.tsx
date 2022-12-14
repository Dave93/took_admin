import {
  List,
  Table,
  useTable,
  Space,
  ShowButton,
  Button,
  Form,
  Select,
  Col,
  Row,
  DatePicker,
  Tag,
  Input,
  ExportButton,
} from "@pankod/refine-antd";
import type { TableRowSelection } from "antd/es/table/interface";
import {
  CrudFilters,
  HttpError,
  useExport,
  useGetIdentity,
  useNavigation,
} from "@pankod/refine-core";
import { client } from "graphConnect";
import { gql } from "graphql-request";

import {
  IOrders,
  IOrderStatus,
  IOrganization,
  ITerminals,
  IUsers,
} from "interfaces";
import { chain } from "lodash";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import duration from "dayjs/plugin/duration";
import DebounceSelect from "components/select/debounceSelector";
import { OrdersTableActions } from "components/table_actions/orders";

var weekday = require("dayjs/plugin/weekday");
dayjs.locale("ru");
dayjs.extend(weekday);
dayjs.extend(duration);

const { RangePicker } = DatePicker;

export const OrdersList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [expand, setExpand] = useState(false);
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { show } = useNavigation();

  const { tableProps, searchFormProps, filters, sorter, setFilters } = useTable<
    IOrders,
    HttpError,
    {
      organization_id: string;
      created_at: [dayjs.Dayjs, dayjs.Dayjs];
      terminal_id: string[];
      order_status_id: string[];
      customer_phone: string;
      courier_id: any;
      order_number: number;
    }
  >({
    initialSorter: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    metaData: {
      fields: [
        "id",
        "delivery_type",
        "created_at",
        "order_price",
        "order_number",
        "duration",
        "delivery_price",
        "payment_type",

        {
          orders_organization: ["id", "name"],
        },
        {
          orders_couriers: ["id", "first_name", "last_name"],
        },
        {
          orders_customers: ["id", "name", "phone"],
        },
        {
          orders_order_status: ["id", "name", "color"],
        },
        {
          orders_terminals: ["id", "name"],
        },
      ],
      whereInputType: "ordersWhereInput!",
      orderByInputType: "ordersOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
    initialFilter: [
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
    onSearch: async (params) => {
      const filters: CrudFilters = [];
      const {
        organization_id,
        created_at,
        terminal_id,
        order_status_id,
        customer_phone,
        courier_id,
        order_number,
      } = params;
      filters.push(
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

      if (organization_id) {
        filters.push({
          field: "organization_id",
          operator: "eq",
          value: {
            equals: organization_id,
          },
        });
      }

      if (terminal_id && terminal_id.length) {
        filters.push({
          field: "terminal_id",
          operator: "in",
          value: terminal_id,
        });
      }

      if (order_status_id && order_status_id.length) {
        filters.push({
          field: "order_status_id",
          operator: "in",
          value: order_status_id,
        });
      }

      if (customer_phone) {
        filters.push({
          field: "orders_customers",
          operator: "contains",
          value: {
            custom: {
              is: {
                phone: {
                  contains: customer_phone,
                },
              },
            },
          },
        });
      }

      if (order_number) {
        filters.push({
          field: "order_number",
          operator: "eq",
          value: {
            equals: order_number,
          },
        });
      }

      if (courier_id && courier_id.value) {
        filters.push({
          field: "courier_id",
          operator: "eq",
          value: { equals: courier_id.value },
        });
      }
      return filters;
    },
  });

  const { triggerExport, isLoading } = useExport<IOrders>({
    metaData: {
      fields: [
        "id",
        "delivery_type",
        "created_at",
        "order_price",
        "order_number",
        "duration",
        "delivery_price",
        "payment_type",

        {
          orders_organization: ["id", "name"],
        },
        {
          orders_couriers: ["id", "first_name", "last_name"],
        },
        {
          orders_customers: ["id", "name", "phone"],
        },
        {
          orders_order_status: ["id", "name", "color"],
        },
        {
          orders_terminals: ["id", "name"],
        },
      ],
      whereInputType: "ordersWhereInput!",
      orderByInputType: "ordersOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
    filters,
    sorter,
  });

  const getAllFilterData = async () => {
    const query = gql`
      query {
        cachedOrganizations {
          id
          name
        }
        cachedTerminals {
          id
          name
          organization_id
          organization {
            id
            name
          }
        }
        cachedOrderStatuses {
          id
          name
          color
          organization_id
          order_status_organization {
            id
            name
          }
        }
      }
    `;
    const { cachedOrganizations, cachedTerminals, cachedOrderStatuses } =
      await client.request<{
        cachedOrganizations: IOrganization[];
        cachedTerminals: ITerminals[];
        cachedOrderStatuses: IOrderStatus[];
      }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setOrganizations(cachedOrganizations);
    var terminalRes = chain(cachedTerminals)
      .groupBy("organization.name")
      .toPairs()
      .map(function (item) {
        return {
          name: item[0],
          children: item[1],
        };
      })
      .value();
    var orderStatusRes = chain(cachedOrderStatuses)
      .groupBy("order_status_organization.name")
      .toPairs()
      .map(function (item) {
        return {
          name: item[0],
          children: item[1],
        };
      })
      .value();
    setTerminals(terminalRes);
    setOrderStatuses(orderStatusRes);
  };

  const goToCustomer = (id: string) => {
    show(`customers`, id);
  };

  const goToCourier = (id: string) => {
    show(`users`, id);
  };

  const goToTerminal = (id: string) => {
    show(`terminals`, id);
  };
  const goToOrganization = (id: string) => {
    show(`organization`, id);
  };

  const fetchCourier = async (queryText: string) => {
    const query = gql`
        query {
          users(where: {
            users_roles_usersTousers_roles_user_id: {
              some: {
                roles: {
                  is: {
                    code: {
                      equals: "courier"
                    }
                  }
                }
              }
            },
            status: {
              equals: active
            },
            OR: [{
              first_name: {
                contains: "${queryText}"
              }
            }, {
              phone: {
                contains: "${queryText}"
              }
            }]
          }) {
            id
            first_name
            last_name
            phone
          }
        }
    `;
    const { users } = await client.request<{
      users: IUsers[];
    }>(
      query,
      {},
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );

    return users.map((user) => ({
      key: user.id,
      value: user.id,
      label: `${user.first_name} ${user.last_name} (${user.phone})`,
    }));
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<IOrders> = useMemo(() => {
    const res = {
      selectedRowKeys,
      onChange: onSelectChange,
      selections: [
        {
          key: "all-data",
          text: "?????????????? ?????? ????????????",
          onSelect: (changableRowKeys: React.Key[]) => {
            setSelectedRowKeys(changableRowKeys);
          },
        },
        {
          key: "invert",
          text: "?????????????????????????? ??????????",
          onSelect: (changableRowKeys: React.Key[]) => {
            setSelectedRowKeys(
              changableRowKeys.filter((key) => !selectedRowKeys.includes(key))
            );
          },
        },
        {
          key: "clear-all",
          text: "???????????????? ??????????",
          onSelect: () => {
            setSelectedRowKeys([]);
          },
        },
      ],
    };

    let organizations: any = {};
    if (tableProps.dataSource?.length) {
      tableProps.dataSource?.map((item: IOrders) => {
        organizations[item.orders_organization.id] =
          item.orders_organization.name;
        // res.selectedRowKeys?.push(item.id);
      });

      for (const key in organizations) {
        res.selections?.push({
          key: key,
          text: `?????????????? ?????? ???????????? ${organizations[key]}`,
          onSelect: () => {
            setSelectedRowKeys(
              tableProps
                .dataSource!.filter(
                  (item: IOrders) => item.orders_organization.id === key
                )
                .map((item: IOrders) => item.id)
            );
          },
        });
      }
    }

    return res;
  }, [tableProps, setSelectedRowKeys, selectedRowKeys]);

  const selectedOrders = useMemo(() => {
    return tableProps.dataSource?.filter((item) =>
      selectedRowKeys.includes(item.id)
    );
  }, [tableProps, selectedRowKeys]);

  const showFullFilter = useMemo(() => {
    if (window.innerWidth > 768) {
      return true;
    }
    return expand;
  }, [expand]);

  const onFinishAction = async () => {
    setSelectedRowKeys([]);
    setFilters(filters!, "replace");
  };

  useEffect(() => {
    getAllFilterData();
  }, []);

  return (
    <>
      <List
        title="???????????? ??????????????"
        headerProps={{
          extra: <ExportButton onClick={triggerExport} loading={isLoading} />,
        }}
      >
        <Form
          layout="vertical"
          {...searchFormProps}
          initialValues={{
            created_at: [dayjs().startOf("d"), dayjs().endOf("d")],
          }}
        >
          <Row gutter={16}>
            <Col xs={12} sm={12} md={5}>
              <Form.Item label="???????? ????????????" name="created_at">
                <RangePicker format={"DD.MM.YYYY HH:mm"} showTime />
              </Form.Item>
            </Col>
            <Col xs={12} sm={12} md={3}>
              <Form.Item name="customer_phone" label="?????????????? ??????????????">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} sm={12} md={3}>
              <Form.Item name="courier_id" label="????????????">
                <DebounceSelect fetchOptions={fetchCourier} allowClear />
              </Form.Item>
            </Col>
            {showFullFilter && (
              <>
                <Col xs={12} sm={12} md={3}>
                  <Form.Item name="organization_id" label="??????????????????????">
                    <Select
                      options={organizations.map((org) => ({
                        label: org.name,
                        value: org.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={12} md={3}>
                  <Form.Item name="terminal_id" label="????????????">
                    <Select
                      showSearch
                      optionFilterProp="children"
                      allowClear
                      mode="multiple"
                    >
                      {terminals.map((terminal: any) => (
                        <Select.OptGroup
                          key={terminal.name}
                          label={terminal.name}
                        >
                          {terminal.children.map((terminal: ITerminals) => (
                            <Select.Option
                              key={terminal.id}
                              value={terminal.id}
                            >
                              {terminal.name}
                            </Select.Option>
                          ))}
                        </Select.OptGroup>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={12} sm={12} md={3}>
                  <Form.Item name="order_status_id" label="????????????">
                    <Select
                      showSearch
                      optionFilterProp="children"
                      allowClear
                      mode="multiple"
                    >
                      {orderStatuses.map((terminal: any) => (
                        <Select.OptGroup
                          key={terminal.name}
                          label={terminal.name}
                        >
                          {terminal.children.map((terminal: ITerminals) => (
                            <Select.Option
                              key={terminal.id}
                              value={terminal.id}
                            >
                              {terminal.name}
                            </Select.Option>
                          ))}
                        </Select.OptGroup>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={12} sm={12} md={2}>
                  <Form.Item name="order_number" label="?????????? ????????????">
                    <Input allowClear />
                  </Form.Item>
                </Col>
              </>
            )}
            <Col span={2}>
              <Button
                type="link"
                onClick={() => {
                  setExpand(!expand);
                }}
              >
                {expand ? <UpOutlined /> : <DownOutlined />}
                {expand ? "????????????????" : "????????????????????"}
              </Button>
              <Form.Item>
                <Button htmlType="submit" type="primary">
                  ??????????????????????
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
                : { y: "calc(100vh - 390px)", x: "calc(100vw - 200px)" }
            }
            onRow={(record: any) => ({
              onDoubleClick: () => {
                show("orders", record.id);
              },
            })}
            pagination={{
              ...tableProps.pagination,
              showSizeChanger: true,
            }}
            rowSelection={rowSelection}
            title={() => (
              <OrdersTableActions
                selectedOrders={selectedOrders}
                onFinishAction={onFinishAction}
              />
            )}
          >
            <Table.Column<IOrders>
              title="Actions"
              dataIndex="actions"
              render={(_text, record): React.ReactNode => {
                return (
                  <Space>
                    <ShowButton
                      size="small"
                      recordItemId={record.id}
                      hideText
                    />
                  </Space>
                );
              }}
            />
            <Table.Column
              dataIndex="order_number"
              title="?????????? ????????????"
              width={100}
            />
            <Table.Column
              dataIndex="created_at"
              title="???????? ????????????"
              render={(record: any) => (
                <span>{dayjs(record).format("DD.MM.YYYY HH:mm")}</span>
              )}
            />
            <Table.Column
              dataIndex="order_status_id"
              title="????????????"
              width={100}
              render={(value: any, record: any) => (
                <Tag color={record.orders_order_status.color}>
                  {record.orders_order_status.name}
                </Tag>
              )}
            />
            <Table.Column
              dataIndex="organization.name"
              title="??????????????????????"
              render={(value: any, record: IOrders) => (
                <Button
                  type="link"
                  size="small"
                  onClick={() =>
                    goToOrganization(record.orders_organization.id)
                  }
                  style={{
                    whiteSpace: "pre-wrap",
                    textAlign: "left",
                  }}
                >
                  <span>{record.orders_organization.name}</span>
                </Button>
              )}
            />
            <Table.Column
              dataIndex="orders_terminals.name"
              title="????????????"
              render={(value: any, record: IOrders) => (
                <Button
                  type="link"
                  size="small"
                  onClick={() => goToTerminal(record.orders_terminals.id)}
                  style={{
                    whiteSpace: "pre-wrap",
                    textAlign: "left",
                  }}
                >
                  {record.orders_terminals.name}
                </Button>
              )}
            />
            <Table.Column
              dataIndex="orders_couriers.first_name"
              title="????????????"
              render={(value: any, record: IOrders) =>
                record.orders_couriers ? (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => goToCourier(record.orders_couriers.id)}
                    style={{
                      whiteSpace: "pre-wrap",
                      textAlign: "left",
                    }}
                  >
                    {`${record.orders_couriers.first_name} ${record.orders_couriers.last_name}`}
                  </Button>
                ) : (
                  <span>???? ????????????????</span>
                )
              }
            />
            <Table.Column
              dataIndex="orders_customers.name"
              title="??????"
              render={(value: any, record: IOrders) => (
                <Button
                  type="link"
                  size="small"
                  onClick={() => goToCustomer(record.orders_customers.id)}
                  style={{
                    whiteSpace: "pre-wrap",
                    textAlign: "left",
                  }}
                >
                  {record.orders_customers.name}
                </Button>
              )}
            />
            <Table.Column
              dataIndex="orders_customers.phone"
              title="??????????????"
              width={150}
              render={(value: any, record: IOrders) => (
                <Button
                  type="link"
                  size="small"
                  onClick={() => goToCustomer(record.orders_customers.id)}
                >
                  {record.orders_customers.phone}
                </Button>
              )}
            />
            <Table.Column
              dataIndex="order_price"
              title="????????"
              render={(value: any, record: IOrders) => (
                <span>
                  {new Intl.NumberFormat("ru").format(record.order_price)} ??????
                </span>
              )}
            />
            <Table.Column
              dataIndex="duration"
              title="?????????? ????????????????"
              render={(value: any, record: IOrders) => (
                <span>{dayjs.duration(value * 1000).format("HH:mm:ss")}</span>
              )}
            />
            <Table.Column
              dataIndex="delivery_price"
              title="???????? ????????????????"
              render={(value: any, record: IOrders) => (
                <span>
                  {new Intl.NumberFormat("ru").format(record.delivery_price)}{" "}
                  ??????
                </span>
              )}
            />
            <Table.Column dataIndex="payment_type" title="?????? ????????????" />
          </Table>
        </div>
      </List>
    </>
  );
};
