import { Create, useForm } from "@refinedev/antd";

import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  TimePicker,
} from "antd";

import { PlusOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import { useGetIdentity, useTranslate } from "@refinedev/core";

import {
  IConstructedBonusPricing,
  IDeliveryPricing,
  IOrganization,
  ITerminals,
  IUsers,
} from "interfaces";
import { drive_type } from "interfaces/enums";
import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import dayjs from "dayjs";
import { organization_payment_types } from "interfaces/enums";

import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import DebounceSelect from "components/select/debounceSelector";

let daysOfWeekRu = {
  "1": "Понедельник",
  "2": "Вторник",
  "3": "Среда",
  "4": "Четверг",
  "5": "Пятница",
  "6": "Суббота",
  "7": "Воскресенье",
};

const format = "HH:mm";
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Tashkent");

dayjs.extend(isBetween);

export const ConstructedBonusPricingCreate = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps } = useForm<IConstructedBonusPricing>({
    meta: {
      fields: ["id", "name", "organization_id", "pricing"],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  const tr = useTranslate();

  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [terminals, setTerminals] = useState<ITerminals[]>([]);

  const fetchOrganizations = async () => {
    const query = gql`
      query {
        cachedOrganizations {
          id
          name
        }
        cachedTerminals {
          id
          name
        }
      }
    `;

    const { cachedOrganizations, cachedTerminals } = await client.request<{
      cachedOrganizations: IOrganization[];
      cachedTerminals: ITerminals[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setOrganizations(cachedOrganizations);
    setTerminals(cachedTerminals);
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
    fetchOrganizations();
  }, [identity]);

  return (
    <Create saveButtonProps={saveButtonProps} title="Создать разрешение">
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Название"
              name="name"
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
              label="Организация"
              name="organization_id"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select showSearch optionFilterProp="children">
                {organizations.map((organization) => (
                  <Select.Option key={organization.id} value={organization.id}>
                    {organization.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.List name="pricing">
          {(pricingFields, { add, remove }) => {
            return (
              <div>
                {pricingFields.map((pricingField, index) => (
                  <div
                    key={pricingField.key}
                    // className="border-2 rounded-lg shadow-md px-5 py-4 "
                  >
                    <Card
                      size="small"
                      title=""
                      className="mb-6"
                      extra={
                        <CloseOutlined
                          onClick={() => {
                            remove(pricingField.name);
                          }}
                        />
                      }
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label="Филиал"
                            name={[pricingField.name, "terminal_ids"]}
                          >
                            <Select
                              showSearch
                              optionFilterProp="children"
                              allowClear
                              mode="multiple"
                            >
                              {terminals.map((terminal) => (
                                <Select.Option
                                  key={terminal.id}
                                  value={terminal.id}
                                >
                                  {terminal.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name={[pricingField.name, "courier_id"]}
                            label="Курьер"
                          >
                            <DebounceSelect
                              fetchOptions={fetchCourier}
                              allowClear
                              labelInValue={false}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.List name={[pricingField.name, "rules"]}>
                        {(fields, { add, remove }) => {
                          return (
                            <div>
                              {fields.map((field, index) => (
                                <Space
                                  key={field.key}
                                  style={{ display: "flex", marginBottom: 8 }}
                                  align="baseline"
                                >
                                  <Form.Item
                                    label="От (км)"
                                    name={[field.name, "distance_from"]}
                                    rules={[
                                      {
                                        required: true,
                                      },
                                    ]}
                                  >
                                    <InputNumber type="number" />
                                  </Form.Item>
                                  <Form.Item
                                    label="До (км)"
                                    name={[field.name, "distance_to"]}
                                    rules={[
                                      {
                                        required: true,
                                      },
                                    ]}
                                  >
                                    <InputNumber type="number" />
                                  </Form.Item>
                                  <Form.Item
                                    label="От (мин)"
                                    name={[field.name, "time_from"]}
                                    rules={[
                                      {
                                        required: true,
                                      },
                                    ]}
                                  >
                                    <InputNumber type="number" />
                                  </Form.Item>
                                  <Form.Item
                                    label="До (мин)"
                                    name={[field.name, "time_to"]}
                                    rules={[
                                      {
                                        required: true,
                                      },
                                    ]}
                                  >
                                    <InputNumber type="number" />
                                  </Form.Item>
                                  <Form.Item
                                    label="Цена"
                                    name={[field.name, "price"]}
                                    rules={[
                                      {
                                        required: true,
                                      },
                                    ]}
                                  >
                                    <InputNumber type="number" />
                                  </Form.Item>
                                  {index > 0 && (
                                    <Form.Item label=" ">
                                      <Button
                                        danger
                                        shape="circle"
                                        icon={<DeleteOutlined />}
                                        onClick={() => {
                                          remove(field.name);
                                        }}
                                      />
                                    </Form.Item>
                                  )}
                                </Space>
                              ))}
                              <Form.Item>
                                <Button
                                  type="dashed"
                                  onClick={() => add()}
                                  block
                                  icon={<PlusOutlined />}
                                >
                                  Добавить условие
                                </Button>
                              </Form.Item>
                            </div>
                          );
                        }}
                      </Form.List>
                    </Card>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Добавить ценовую категорию
                  </Button>
                </Form.Item>
              </div>
            );
          }}
        </Form.List>
      </Form>
    </Create>
  );
};
