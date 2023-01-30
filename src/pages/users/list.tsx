import {
  List,
  DateField,
  Table,
  useTable,
  Space,
  EditButton,
  ShowButton,
  Form,
  Select,
  Input,
  Button,
  Row,
  Col,
} from "@pankod/refine-antd";
import {
  CrudFilters,
  HttpError,
  useGetIdentity,
  useTranslate,
} from "@pankod/refine-core";
import { client } from "graphConnect";
import { gql } from "graphql-request";
import { chain } from "lodash";

import { IRoles, ITerminals, IUsers } from "interfaces";
import { defaultDateTimeFormat } from "localConstants";
import { useEffect, useState } from "react";

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
  const [terminals, setTerminals] = useState<any[]>([]);
  const [roles, setRoles] = useState<IRoles[]>([]);
  const { tableProps, searchFormProps } = useTable<
    IUsers,
    HttpError,
    {
      first_name?: string;
      last_name?: string;
      phone?: string;
      is_online?: boolean;
      terminal_id: string[];
      roles: string;
    }
  >({
    initialPageSize: 200,
    initialSorter: [
      {
        field: "first_name",
        order: "asc",
      },
    ],
    metaData: {
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
      const { first_name, last_name, phone, is_online, terminal_id, roles } =
        values;
      const filters: CrudFilters = [];
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

      return filters;
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
      }
    `;
    const { roles, cachedTerminals } = await client.request<{
      roles: IRoles[];
      cachedTerminals: ITerminals[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
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
    setTerminals(terminalRes);
    setRoles(roles);
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
              <Form.Item name="first_name" label="Имя">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="last_name" label="Фамилия">
                <Input />
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
              <Form.Item name="terminal_id" label="Филиал">
                <Select
                  showSearch
                  optionFilterProp="children"
                  allowClear
                  mode="multiple"
                >
                  {terminals.map((terminal: any) => (
                    <Select.OptGroup key={terminal.name} label={terminal.name}>
                      {terminal.children.map((terminal: ITerminals) => (
                        <Select.Option key={terminal.id} value={terminal.id}>
                          {terminal.name}
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
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
            dataIndex="status"
            title="Статус"
            render={(value) => tr(`users.status.${value}`)}
          />
          <Table.Column
            dataIndex="is_online"
            title="Онлайн"
            render={(value) => <OnlineStatus value={value} />}
          />
          <Table.Column dataIndex="phone" title="Телефон" />
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
          <Table.Column dataIndex="latitude" title="Широта" />
          <Table.Column dataIndex="longitude" title="Долгота" />
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
                  <EditButton size="small" recordItemId={record.id} hideText />
                  <ShowButton size="small" recordItemId={record.id} hideText />
                </Space>
              );
            }}
          />
        </Table>
      </List>
    </>
  );
};
