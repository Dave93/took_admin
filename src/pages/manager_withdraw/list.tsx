import { List, useTable, ShowButton, ExportButton } from "@refinedev/antd";
import {
  Table,
  Space,
  Button,
  Form,
  Select,
  Col,
  Row,
  DatePicker,
  Tag,
  Input,
  Popover,
  List as AntdList,
} from "antd";
import type { TableRowSelection } from "antd/es/table/interface";

import {
  CrudFilters,
  HttpError,
  useCan,
  useExport,
  useGetIdentity,
  useNavigation,
  useTranslate,
} from "@refinedev/core";

import { useQueryClient } from "@tanstack/react-query";
import { client } from "graphConnect";
import { gql } from "graphql-request";

import {
  IManagerWithdraw,
  IOrders,
  IOrderStatus,
  IOrganization,
  ITerminals,
  IUsers,
} from "interfaces";
import { sortBy } from "lodash";
import {
  UpOutlined,
  DownOutlined,
  UserOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useMemo, FC } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import duration from "dayjs/plugin/duration";
import DebounceSelect from "components/select/debounceSelector";
import { OrdersTableActions } from "components/table_actions/orders";
import { useTableExport } from "components/export/table";
import { rangePresets } from "components/dates/RangePresets";
import { ManagerWithdrawTransactions } from "components/users/courier_withdraws";

var weekday = require("dayjs/plugin/weekday");
dayjs.locale("ru");
dayjs.extend(weekday);
dayjs.extend(duration);

const { RangePicker } = DatePicker;

interface IOrdersListProps {
  startDate: Date;
  endDate: Date;
  emptyMessage?: string;
}

const IOrdersListPropsDuration: FC<IOrdersListProps> = ({
  startDate,
  endDate,
  emptyMessage,
}) => {
  const duration = useMemo(() => {
    if (startDate && endDate) {
      return `${dayjs(endDate).diff(startDate, "minute")} минут`;
    } else {
      return emptyMessage ?? "Доставка не завершена";
    }
  }, [startDate, endDate]);
  return (
    <Space>
      <div>
        <strong>{duration}</strong>
      </div>
    </Space>
  );
};

export const ManagerWithdrawList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const tr = useTranslate();
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);

  const queryClient = useQueryClient();

  const {
    tableProps,
    searchFormProps,
    filters,
    sorters: sorter,
    setFilters,
  } = useTable<
    IManagerWithdraw,
    HttpError,
    {
      organization_id: string;
      created_at: [dayjs.Dayjs, dayjs.Dayjs];
      terminal_id: string[];
      courier_id: any;
      orders_couriers: string;
    }
  >({
    queryOptions: {
      queryKey: ["orders"],
    },

    meta: {
      fields: [
        "id",
        "amount",
        "amount_before",
        "amount_after",
        "created_at",
        "payed_date",
        {
          manager_withdraw_managers: ["first_name", "last_name"],
        },
        {
          manager_withdraw_terminals: ["name"],
        },
        {
          manager_withdraw_couriers: ["first_name", "last_name"],
        },
      ],
      whereInputType: "manager_withdrawWhereInput!",
      orderByInputType: "manager_withdrawOrderByWithRelationInput!",
      operation: "managerWithdraws",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },

    onSearch: async (params) => {
      const localFilters: CrudFilters = [];
      queryClient.invalidateQueries(["default", "manager_withdraw", "list"]);
      // queryClient.invalidateQueries();
      const {
        organization_id,
        created_at,
        terminal_id,
        courier_id,
        orders_couriers,
      } = params;

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

      if (organization_id) {
        localFilters.push({
          field: "organization_id",
          operator: "eq",
          value: {
            equals: organization_id,
          },
        });
      }

      if (terminal_id && terminal_id.length) {
        localFilters.push({
          field: "terminal_id",
          operator: "in",
          value: terminal_id,
        });
      }

      if (courier_id && courier_id.value) {
        localFilters.push({
          field: "courier_id",
          operator: "eq",
          value: { equals: courier_id.value },
        });
      }

      if (orders_couriers) {
        localFilters.push({
          field: "orders_couriers",
          operator: "contains",
          value: {
            custom: {
              is: {
                status: {
                  equals: orders_couriers,
                },
              },
            },
          },
        });
      }
      return localFilters;
    },

    pagination: {
      pageSize: 1000,
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

  const columns = [
    {
      title: "Дата",
      dataIndex: "created_at",
      key: "created_at",
      exportable: true,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Филиал",
      dataIndex: "manager_withdraw_terminals",
      key: "manager_withdraw_terminals",
      exportable: true,
      render: (value: ITerminals) => value.name,
    },
    {
      title: "Курьер",
      dataIndex: "manager_withdraw_couriers",
      key: "manager_withdraw_couriers",
      exportable: true,
      render: (value: IUsers) => `${value.first_name} ${value.last_name}`,
    },
    {
      title: "Менеджер",
      dataIndex: "manager_withdraw_managers",
      key: "manager_withdraw_managers",
      exportable: true,
      render: (value: IUsers) => `${value.first_name} ${value.last_name}`,
    },
    {
      title: "Выплатил",
      dataIndex: "amount",
      key: "amount",
      exportable: true,
      excelRender: (value: number) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Кошелёк до выплат",
      dataIndex: "amount_before",
      key: "amount_before",
      exportable: true,
      excelRender: (value: number) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Кошелёк после выплат",
      dataIndex: "amount_after",
      key: "amount_after",
      exportable: true,
      excelRender: (value: number) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
  ];

  const { triggerExport, isLoading } = useTableExport<IManagerWithdraw>({
    metaData: {
      fields: [
        "id",
        "amount",
        "amount_before",
        "amount_after",
        "created_at",
        "payed_date",
        {
          manager_withdraw_managers: ["first_name", "last_name"],
        },
        {
          manager_withdraw_terminals: ["name"],
        },
        {
          manager_withdraw_couriers: ["first_name", "last_name"],
        },
      ],
      whereInputType: "manager_withdrawWhereInput!",
      orderByInputType: "manager_withdrawOrderByWithRelationInput!",
      operation: "managerWithdraws",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
    filters,
    sorter,
    columns,
    pageSize: 1000,
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
      }
    `;
    const { cachedOrganizations, cachedTerminals } = await client.request<{
      cachedOrganizations: IOrganization[];
      cachedTerminals: ITerminals[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setOrganizations(cachedOrganizations);
    setTerminals(sortBy(cachedTerminals, (item) => item.name));
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
                mode: insensitive
              }
            },{
              last_name: {
                contains: "${queryText}"
                mode: insensitive
              }
            }, {
              phone: {
                contains: "${queryText}"
                mode: insensitive
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

  useEffect(() => {
    getAllFilterData();
  }, []);

  return (
    <>
      <List
        title="Выплаты курьерам"
        headerProps={{
          extra: (
            <div>
              <ExportButton onClick={triggerExport} loading={isLoading} />
            </div>
          ),
        }}
      >
        <Form
          layout="vertical"
          {...searchFormProps}
          initialValues={{
            created_at: [dayjs().startOf("d"), dayjs().endOf("d")],
          }}
        >
          <Row gutter={16} align="bottom">
            <Col xs={12} sm={12} md={5}>
              <Form.Item label="Дата" name="created_at">
                <RangePicker
                  format={"DD.MM.YYYY HH:mm"}
                  showTime
                  presets={rangePresets}
                />
              </Form.Item>
            </Col>
            <Col xs={12} sm={12} md={3}>
              <Form.Item name="courier_id" label="Курьер">
                <DebounceSelect fetchOptions={fetchCourier} allowClear />
              </Form.Item>
            </Col>
            <Col xs={12} sm={12} md={3}>
              <Form.Item name="organization_id" label="Организация">
                <Select
                  allowClear
                  options={organizations.map((org) => ({
                    label: org.name,
                    value: org.id,
                  }))}
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
            columns={columns}
            expandable={{
              expandedRowRender: (record: IManagerWithdraw) => (
                <ManagerWithdrawTransactions record={record} />
              ),
            }}
            pagination={{
              ...tableProps.pagination,
              showSizeChanger: true,
            }}
            summary={(pageData) => {
              let total = 0;
              let amountBefore = 0;
              let amountAfter = 0;
              pageData.forEach(({ amount, amount_before, amount_after }) => {
                total += +amount;
                amountBefore += +amount_before;
                amountAfter += +amount_after;
              });
              return (
                <>
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        Итого
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        {new Intl.NumberFormat("ru-RU").format(total)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        {new Intl.NumberFormat("ru-RU").format(amountBefore)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        {new Intl.NumberFormat("ru-RU").format(amountAfter)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                </>
              );
            }}
          />
        </div>
      </List>
    </>
  );
};
