import { Create, useForm } from "@refinedev/antd";

import {
  Button,
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

import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGetIdentity, useTranslate } from "@refinedev/core";

import {
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

export const OrderBonusPricingCreate = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps } = useForm<IDeliveryPricing>({
    meta: {
      fields: [
        "id",
        "name",
        "active",
        "created_at",
        "max_order_time",
        "rules",
        "organization_id",
        "terminal_id",
        "min_distance_km",
      ],
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
              label="Активность"
              name="active"
              rules={[
                {
                  required: true,
                },
              ]}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
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
        </Row>
        <Row gutter={16}>
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
          <Col span={12}>
            <Form.Item label="Филиал" name="terminal_id">
              <Select showSearch optionFilterProp="children" allowClear>
                {terminals.map((terminal) => (
                  <Select.Option key={terminal.id} value={terminal.id}>
                    {terminal.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="courier_id" label="Курьер">
              <DebounceSelect
                fetchOptions={fetchCourier}
                allowClear
                labelInValue={false}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Максимальное время доставки"
              name="max_order_time"
            >
              <InputNumber type="number" addonAfter="мин." />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Минимальная дистанция" name="min_distance_km">
              <InputNumber type="number" addonAfter="м." />
            </Form.Item>
          </Col>
        </Row>
        <Form.List name="rules">
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
                      name={[field.name, "from"]}
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
                      name={[field.name, "to"]}
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
      </Form>
    </Create>
  );
};
