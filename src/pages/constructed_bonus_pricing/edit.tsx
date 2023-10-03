import { Edit, useForm } from "@refinedev/antd";

import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
} from "antd";

import { PlusOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import { useGetIdentity, useTranslate } from "@refinedev/core";

import {
  IConstructedBonusPricing,
  IOrganization,
  ITerminals,
  IUsers,
} from "interfaces";
import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import DebounceSelect from "components/select/debounceSelector";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Tashkent");

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

export const ConstructedBonusPricingEdit: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps, id } = useForm<IConstructedBonusPricing>({
    meta: {
      fields: ["id", "name", "organization_id", "pricing"],
      pluralize: true,
      updateInputName: "constructed_bonus_pricingUncheckedUpdateInput",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  const tr = useTranslate();

  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [terminals, setTerminals] = useState<ITerminals[]>([]);
  const [aproximatePrice, setAproximatePrice] = useState<number>(0);

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

  const calculateAproximatePrice = (value: any) => {
    let formValues: any = formProps?.form?.getFieldsValue();
    let rules = formValues.rules;
    let price = 0;
    let distance = +value;
    if (rules) {
      rules.forEach((rule: any) => {
        let { from, to, price: rulePrice } = rule;
        if (distance > 0) {
          distance -= +to - +from;
          price += +rulePrice;
        }
      });
      if (distance > 0) {
        let additional = 0;
        const decimals = +(distance % 1).toFixed(3) * 1000;

        if (decimals > 0 && decimals < 250) {
          additional = 500;
        } else if (decimals >= 250 && decimals < 500) {
          additional = 1000;
        } else if (decimals >= 500 && decimals < 1000) {
          additional = 1500;
        }
        const pricePerKm = Math.floor(distance) * formValues.price_per_km;
        price += pricePerKm + additional;
      }
    }
    setAproximatePrice(price);
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
    <Edit
      saveButtonProps={saveButtonProps}
      title="Редактировать условие бонуса"
    >
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
    </Edit>
  );
};
