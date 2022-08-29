import {
  Col,
  Create,
  Form,
  Input,
  Row,
  Select,
  useForm,
} from "@pankod/refine-antd";
import { useTranslate } from "@pankod/refine-core";
import { client } from "graphConnect";
import { gql } from "graphql-request";
import * as gqlb from "gql-query-builder";
import { IRoles, ITerminals, IUsers, IWorkSchedules } from "interfaces";
import { drive_type, user_status } from "interfaces/enums";
import { useEffect, useState } from "react";
import { chain } from "lodash";

export const UsersCreate = () => {
  const tr = useTranslate();
  const { formProps, saveButtonProps, redirect, onFinish } = useForm<IUsers>({
    redirect: false,
    metaData: {
      fields: [
        "id",
        "first_name",
        "last_name",
        "created_at",
        "drive_type",
        "card_number",
        "phone",
        "latitude",
        "longitude",
        {
          users_terminals: [
            {
              terminals: ["id", "name"],
            },
          ],
        },
      ],
      pluralize: true,
    },
  });

  const [roles, setRoles] = useState<IRoles[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [work_schedules, setWorkSchedules] = useState<any[]>([]);

  const fetchRoles = async () => {
    const query = gql`
      query {
        roles {
          id
          name
        }
      }
    `;
    const { roles } = await client.request<{
      roles: IRoles[];
    }>(query);
    setRoles(roles);
  };

  const fetchTerminals = async () => {
    const query = gql`
      query {
        terminals {
          id
          name
          organization {
            id
            name
          }
        }
      }
    `;
    const { terminals } = await client.request<{
      terminals: ITerminals[];
    }>(query);

    var result = chain(terminals)
      .groupBy("organization.name")
      .toPairs()
      .map(function (item) {
        return {
          name: item[0],
          children: item[1],
        };
      })
      .value();

    setTerminals(result);
  };

  const fetchWorkSchedules = async () => {
    const query = gql`
      query {
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
    const { workSchedules } = await client.request<{
      workSchedules: IWorkSchedules[];
    }>(query);
    var result = chain(workSchedules)
      .groupBy("organization.name")
      .toPairs()
      .map(function (item) {
        return {
          name: item[0],
          children: item[1],
        };
      })
      .value();

    setWorkSchedules(result);
  };

  useEffect(() => {
    fetchRoles();
    fetchTerminals();
    fetchWorkSchedules();
  }, []);

  return (
    <Create
      saveButtonProps={{
        disabled: saveButtonProps.disabled,
        loading: saveButtonProps.loading,
        onClick: async () => {
          try {
            let values: any = await formProps.form?.validateFields();
            let users_terminals = values.users_terminals;
            let work_schedules = values.users_work_schedules;
            let roles = values.roles;
            delete values.users_terminals;
            delete values.users_work_schedules;
            delete values.roles;

            let createQuery = gql`
              mutation ($data: usersUncheckedCreateInput!) {
                userCreate(data: $data) {
                  id
                }
              }
            `;
            let { userCreate } = await client.request<{
              userCreate: IUsers;
            }>(createQuery, {
              data: values,
            });

            // const response = await onFinish(values);

            if (userCreate) {
              console.log(userCreate);
              let { query, variables } = gqlb.mutation({
                operation: "updateUser",
                variables: {
                  where: {
                    type: "usersWhereUniqueInput",
                    value: {
                      id: userCreate.id,
                    },
                    required: true,
                  },
                  data: {
                    type: "usersUpdateInput",
                    required: true,
                    value: {
                      users_terminals: {
                        connect: users_terminals.map((item: any) => {
                          return {
                            user_id_terminal_id: {
                              terminal_id: item,
                              user_id: userCreate.id,
                            },
                          };
                        }),
                      },
                      users_work_schedules: {
                        connect: work_schedules.map((item: any) => {
                          return {
                            user_id_work_schedule_id: {
                              work_schedule_id: item,
                              user_id: userCreate.id,
                            },
                          };
                        }),
                      },
                      // users_roles_usersTousers_roles_user_id: {
                      //   connect: [
                      //     {
                      //       user_id_role_id: {
                      //         role_id: roles,
                      //         user_id: userCreate.id,
                      //       },
                      //     },
                      //   ],
                      // },
                    },
                  },
                },
                fields: ["id"],
              });
              await client.request(query, variables);
              redirect("list");
            }

            console.log(formProps.form?.getFieldsValue());
            console.log(saveButtonProps);
          } catch (error) {
            console.log(error);
          }
        },
      }}
      title="Создать пользователя"
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
              name="roles"
              rules={[
                {
                  required: true,
                },
              ]}
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
            <Form.Item label="Филиалы" name="users_terminals">
              <Select mode="multiple">
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
          <Col span={12}>
            <Form.Item label="Рабочие графики" name="users_work_schedules">
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
    </Create>
  );
};
