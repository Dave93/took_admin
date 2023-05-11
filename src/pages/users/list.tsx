import {
  List,
  DateField,
  useTable,
  ShowButton,
  useDrawerForm,
  Edit,
} from "@refinedev/antd";

import {
  Table,
  Space,
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  Row,
  Col,
  InputNumber,
  Drawer,
} from "antd";

import {
  CrudFilters,
  HttpError,
  useGetIdentity,
  useTranslate,
} from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "graphConnect";
import { gql } from "graphql-request";
import { chain, sortBy } from "lodash";
import { EditOutlined, LinkOutlined } from "@ant-design/icons";
import { IRoles, ITerminals, IUsers, IWorkSchedules } from "interfaces";
import { defaultDateTimeFormat } from "localConstants";
import { useEffect, useState } from "react";
import { drive_type, user_status } from "interfaces/enums";
import FileUploaderMultiple from "components/file_uploader/multiple";
import * as gqlb from "gql-query-builder";
import DebounceSelect from "components/select/debounceSelector";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import dayjs from "dayjs";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";

const OnlineStatus = ({ value }: { value: boolean }) => {
  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: value ? "green" : "red",
      }}
    ></div>
  );
};

export const UsersList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();

  const queryClient = useQueryClient();
  const [terminals, setTerminals] = useState<any[]>([]);
  const [roles, setRoles] = useState<IRoles[]>([]);
  const [work_schedules, setWorkSchedules] = useState<any[]>([]);
  const { tableProps, searchFormProps, filters, setFilters } = useTable<
    IUsers,
    HttpError,
    {
      first_name?: string;
      last_name?: string;
      phone?: string;
      is_online?: boolean;
      terminal_id: string[];
      roles: string;
      status: string;
      id?: IUsers;
    }
  >({
    meta: {
      fields: [
        "id",
        "first_name",
        "last_name",
        "created_at",
        "is_online",
        "drive_type",
        "card_number",
        "phone",
        "latitude",
        "longitude",
        "status",
        "app_version",
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
              work_schedules: ["name"],
            },
          ],
        },
      ],
      whereInputType: "usersWhereInput!",
      orderByInputType: "usersOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },

    onSearch: async (values) => {
      const {
        first_name,
        last_name,
        phone,
        is_online,
        terminal_id,
        roles,
        status,
        id,
      } = values;
      const filters: CrudFilters = [];
      queryClient.invalidateQueries(["default", "users", "list"]);
      if (phone) {
        filters.push({
          field: "phone",
          operator: "contains",
          value: {
            custom: {
              contains: phone,
            },
          },
        });
      }

      if (id) {
        filters.push({
          field: "id",
          operator: "eq",
          value: { equals: id.value },
        });
      }

      if (first_name) {
        filters.push({
          field: "first_name",
          operator: "contains",
          value: {
            custom: {
              contains: first_name,
              mode: "insensitive",
            },
          },
        });
      }
      if (last_name) {
        filters.push({
          field: "last_name",
          operator: "contains",
          value: {
            custom: {
              contains: last_name,
              mode: "insensitive",
            },
          },
        });
      }
      if (is_online !== undefined) {
        filters.push({
          field: "is_online",
          operator: "eq",
          value: { equals: is_online },
        });
      }

      if (terminal_id && terminal_id.length) {
        filters.push({
          field: "users_terminals",
          operator: "in",
          value: {
            custom: {
              some: {
                terminal_id: {
                  in: terminal_id,
                },
              },
            },
          },
        });
      }

      if (roles) {
        filters.push({
          field: "users_roles_usersTousers_roles_user_id",
          operator: "contains",
          value: {
            custom: {
              some: {
                role_id: {
                  equals: roles,
                },
              },
            },
          },
        });
      }

      if (status) {
        filters.push({
          field: "status",
          operator: "contains",
          value: { custom: { equals: status } },
        });
      }

      return filters;
    },

    pagination: {
      pageSize: 200,
    },

    filters: {
      defaultBehavior: "replace",
    },

    sorters: {
      initial: [
        {
          field: "first_name",
          order: "asc",
        },
      ],
    },
  });

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
    meta: {
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

  const getAllFilterData = async () => {
    const query = gql`
      query {
        roles {
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
    setTerminals(sortBy(cachedTerminals, ["name"]));
    setRoles(roles);
  };
  const fetchCourier = async (queryText: string) => {
    const query = gql`
        query {
          users(where: {
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

  const tr = useTranslate();

  useEffect(() => {
    getAllFilterData();
  }, []);

  return (
    <>
      <List title="Список пользователей">
        <Form layout="horizontal" {...searchFormProps}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="id" label="ФИО">
                <DebounceSelect fetchOptions={fetchCourier} allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="phone" label="Телефон">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Роль" name="roles">
                <Select>
                  {roles.map((role: IRoles) => (
                    <Select.Option key={role.id} value={role.id}>
                      {role.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="Статус">
                <Select
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
              </Form.Item>
            </Col>
            <Col span={6}>
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
            <Col span={6}>
              <Form.Item name="is_online" label="Онлайн">
                <Select
                  options={[
                    { label: "Все", value: undefined },
                    { label: "Да", value: true },
                    { label: "Нет", value: false },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <Button htmlType="submit" type="primary">
                  Фильтровать
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="index"
            title="№"
            width={60}
            render={(value: any, record: any, index: number) => (
              <div>{index + 1}</div>
            )}
          />
          <Table.Column
            dataIndex="status"
            title="Статус"
            render={(value) => tr(`users.status.${value}`)}
          />
          <Table.Column
            dataIndex="is_online"
            title="Онлайн"
            render={(value) => <OnlineStatus value={value} />}
          />
          <Table.Column
            dataIndex="phone"
            title="Телефон"
            width={200}
            render={(value: string) => formatPhoneNumberIntl(value)}
          />
          <Table.Column dataIndex="first_name" title="Имя" />
          <Table.Column dataIndex="last_name" title="Фамилия" />
          {/* <Table.Column dataIndex="roles" title="Роль" render={(value, record: IUsers) => } /> */}
          <Table.Column
            dataIndex="drive_type"
            title="Тип доставки"
            render={(value) => tr("deliveryPricing.driveType." + value)}
          />
          {/* <Table.Column dataIndex="card_number" title="Номер карты" /> */}
          <Table.Column
            dataIndex="users_work_schedules"
            title="График работы"
            render={(val) => (
              <div>
                {val?.map((item: any) => item?.work_schedules.name).join(", ")}
              </div>
            )}
          />
          {/* <Table.Column dataIndex="latitude" title="Широта" />
          <Table.Column dataIndex="longitude" title="Долгота" /> */}
          <Table.Column dataIndex="app_version" title="Версия приложения" />
          <Table.Column
            dataIndex="created_at"
            title="Дата создания"
            render={(value) => (
              <DateField
                format={defaultDateTimeFormat}
                value={value}
                locales="ru"
              />
            )}
          />
          <Table.Column<IUsers>
            title="Действия"
            dataIndex="actions"
            render={(_text, record): React.ReactNode => {
              return (
                <Space>
                  <Button
                    size="small"
                    icon={<LinkOutlined />}
                    onClick={() => navigator.clipboard.writeText(record.id)}
                  />
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => show(record.id)}
                  />
                  <Button
                    icon={<ArrowTopRightOnSquareIcon />}
                    size="small"
                    onClick={() => window.open(`/users/show/${record.id}`)}
                  />
                </Space>
              );
            }}
          />
        </Table>
        <Drawer {...drawerProps} width={800}>
          <Edit
            canDelete={false}
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

                  if (
                    typeof work_schedules === "object" &&
                    work_schedules.length > 0 &&
                    work_schedules[0].work_schedules
                  ) {
                    work_schedules = work_schedules.map(
                      (item: any) => item.work_schedules.id
                    );
                  }

                  if (
                    typeof users_terminals === "object" &&
                    users_terminals.length > 0 &&
                    users_terminals[0].terminals
                  ) {
                    users_terminals = users_terminals.map(
                      (item: any) => item.terminals.id
                    );
                  }

                  if (
                    typeof roles === "object" &&
                    roles.length > 0 &&
                    roles[0].roles
                  ) {
                    roles = roles.map((item: any) => item.roles.id)[0];
                  }

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
                    let { query, variables } = gqlb.mutation([
                      {
                        operation: "linkUserToRoles",
                        variables: {
                          userId: {
                            value: updateUser.id,
                            required: true,
                          },
                          roleId: {
                            value: roles,
                            required: true,
                          },
                        },
                        fields: ["user_id"],
                      },
                      {
                        operation: "linkUserToWorkSchedules",
                        variables: {
                          userId: {
                            value: updateUser.id,
                            required: true,
                          },
                          workScheduleId: {
                            value: work_schedules,
                            type: "[String!]",
                            required: true,
                          },
                        },
                        fields: ["count"],
                      },
                      {
                        operation: "linkUserToTerminals",
                        variables: {
                          userId: {
                            value: updateUser.id,
                            required: true,
                          },
                          terminalId: {
                            value: users_terminals,
                            type: "[String!]",
                            required: true,
                          },
                        },
                        fields: ["count"],
                      },
                    ]);
                    await client.request(query, variables, {
                      Authorization: `Bearer ${identity?.token.accessToken}`,
                    });
                    close();
                    if (filters) {
                      const localFilters = [...filters];
                      setFilters([]);
                      setFilters(localFilters);
                    }
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
                <Col span={12}>
                  <Form.Item
                    label="Роль"
                    name="users_roles_usersTousers_roles_user_id"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    getValueProps={(value) => {
                      return {
                        value:
                          typeof value == "object"
                            ? value?.map((item: any) => item.roles.id)
                            : value,
                      };
                    }}
                  >
                    <Select>
                      {roles.map((role: IRoles) => (
                        <Select.Option key={role.id} value={role.id}>
                          {role.name}
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
                    label="Филиалы"
                    name="users_terminals"
                    getValueProps={(value) => {
                      return {
                        value: value?.map((item: any) =>
                          item.terminals ? item.terminals.id : item
                        ),
                      };
                    }}
                  >
                    <Select mode="multiple">
                      {terminals.map((terminal: any) => (
                        <Select.Option key={terminal.id} value={terminal.id}>
                          {terminal.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Рабочие графики"
                    name="users_work_schedules"
                    getValueProps={(value) => {
                      return {
                        value: value?.map((item: any) =>
                          item.work_schedules ? item.work_schedules.id : item
                        ),
                      };
                    }}
                  >
                    <Select mode="multiple">
                      {work_schedules.map((work_schedule: any) => (
                        <Select.OptGroup
                          key={work_schedule.name}
                          label={work_schedule.name}
                        >
                          {work_schedule.children.map(
                            (work_schedule: IWorkSchedules) => (
                              <Select.Option
                                key={work_schedule.id}
                                value={work_schedule.id}
                              >
                                {work_schedule.name}
                              </Select.Option>
                            )
                          )}
                        </Select.OptGroup>
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
              <Form.Item
                label="Документы"
                name="doc_files"
                style={{
                  height: 250,
                }}
              >
                {/* @ts-ignore */}
                <FileUploaderMultiple modelId={id} />
              </Form.Item>
            </Form>
          </Edit>
        </Drawer>
      </List>
    </>
  );
};
