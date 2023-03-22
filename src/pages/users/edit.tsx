import { useForm, Edit } from "@refinedev/antd";
import { Form, Input, Select, Row, Col, InputNumber } from "antd";
import { useGetIdentity, useTranslate } from "@refinedev/core";
import { client } from "graphConnect";
import { gql } from "graphql-request";
import { IRoles, ITerminals, IUsers, IWorkSchedules } from "interfaces";
import { chain, sortBy } from "lodash";
import * as gqlb from "gql-query-builder";
import { useEffect, useState } from "react";
import { drive_type, user_status } from "interfaces/enums";
import FileUploaderMultiple from "components/file_uploader/multiple";

export const UsersEdit: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const tr = useTranslate();
  const { formProps, saveButtonProps, redirect, id } = useForm<IUsers>({
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

  const [roles, setRoles] = useState<IRoles[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [work_schedules, setWorkSchedules] = useState<any[]>([]);

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

  const setSelectValues = () => {
    setTimeout(() => {
      let formValues: any = formProps.form?.getFieldsValue();
      formProps.form?.setFieldsValue({
        ...formValues,
        users_roles_usersTousers_roles_user_id:
          formValues.users_roles_usersTousers_roles_user_id
            ? formValues.users_roles_usersTousers_roles_user_id[0].roles.id
            : null,
        users_work_schedules:
          formValues.users_work_schedules &&
          formValues.users_work_schedules.length > 0
            ? formValues.users_work_schedules.map(
                (item: any) => item.work_schedules.id
              )
            : null,
        users_terminals:
          formValues.users_terminals && formValues.users_terminals.length > 0
            ? formValues.users_terminals.map((item: any) => item.terminals.id)
            : null,
      });
    }, 200);
  };

  const loadData = async () => {
    await fetchAllData();
    setSelectValues();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
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
              redirect("list");
            }
          } catch (error) {}
        },
      }}
      title="Редактирование пользователя"
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
                  <Select.Option key={terminal.id} value={terminal.id}>
                    {terminal.name}
                  </Select.Option>
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
  );
};
