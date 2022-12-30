import {
  IDeliveryPricing,
  IOrders,
  IOrganization,
  ITerminals,
} from "interfaces";
import { drive_type } from "interfaces/enums";
import React, { FC, useEffect, useMemo, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { useGetIdentity, useTranslate } from "@pankod/refine-core";
import dayjs from "dayjs";
import { organization_payment_types } from "interfaces/enums";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  TimePicker,
} from "@pankod/refine-antd";

interface OrderDeliveryPricingProps {
  order: any;
}
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

const OrderDeliveryPricing: FC<OrderDeliveryPricingProps> = ({ order }) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [deliveryPricing, setDeliveryPricing] =
    useState<IDeliveryPricing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mainForm] = Form.useForm();
  const [calculateForm] = Form.useForm();

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

  const loadDeliveryPricing = async () => {
    setIsLoading(true);
    const deliveryPricingId = order.delivery_pricing_id;
    const query = gql`
      query {
        deliveryPricing(id: "${deliveryPricingId}") {
          id
          name
          active
          created_at
          default
          drive_type
          days
          start_time
          end_time
          min_price
          rules
          price_per_km
          organization_id
          terminal_id
          payment_type
        }
      }
    `;

    const { deliveryPricing: localDeliveryPrice } = await client.request<{
      deliveryPricing: IDeliveryPricing;
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setIsLoading(false);
    mainForm.setFieldsValue(localDeliveryPrice);
    calculateForm.setFieldsValue({
      distance: order.pre_distance,
    });
    setDeliveryPricing(localDeliveryPrice);
  };

  const aproximatePrice = useMemo(() => {
    let price = 0;
    if (deliveryPricing) {
      let formValues: any = deliveryPricing;
      let rules = formValues.rules;
      let distance = +order.pre_distance;
      console.log(distance);
      console.log(formValues);
      if (rules) {
        rules.forEach((rule: any) => {
          let { from, to, price: rulePrice } = rule;
          if (distance > 0) {
            distance -= +to - +from;
            price += +rulePrice;
          }
        });
        if (distance > 0) {
          price += distance * formValues.price_per_km;
        }
        price = Math.round(price / 500) * 500;
        console.log(price);
      }
    }
    return price;
  }, [deliveryPricing, order]);

  useEffect(() => {
    fetchOrganizations();
    loadDeliveryPricing();
  }, [identity]);

  return (
    <div className="order-delivery-pricing">
      <Spin spinning={isLoading}>
        <Divider>Калькулятор примерного расчёта</Divider>
        <div>
          <Form form={calculateForm} disabled>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Примерная дистанция(км)" name="distance">
                  <InputNumber type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Примерная цена доставки">
                  <div>
                    {new Intl.NumberFormat("ru-RU").format(aproximatePrice)} сум
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
        <Form form={mainForm} disabled layout="vertical">
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
                label="Вид передвижения"
                name="drive_type"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select>
                  {Object.keys(drive_type).map((key) => (
                    <Select.Option key={key} value={key}>
                      {tr(`deliveryPricing.driveType.${key}`)}
                    </Select.Option>
                  ))}
                </Select>
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
                    <Select.Option
                      key={organization.id}
                      value={organization.id}
                    >
                      {organization.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Филиал" name="terminal_id">
                <Select showSearch optionFilterProp="children">
                  {terminals.map((terminal) => (
                    <Select.Option key={terminal.id} value={terminal.id}>
                      {terminal.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Тип оплаты" name="payment_type">
            <Select>
              {Object.keys(organization_payment_types).map((type: string) => (
                <Select.Option key={type} value={type}>
                  {tr(`organizations.paymentType.${type}`)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Дни недели"
            name="days"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select mode="multiple">
              {Object.keys(daysOfWeekRu).map((key) => (
                <Select.Option key={key} value={key}>
                  {daysOfWeekRu[key as keyof typeof daysOfWeekRu]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Время начала"
                name="start_time"
                rules={[
                  {
                    required: true,
                  },
                ]}
                getValueProps={(value) => ({
                  value: value ? dayjs(value) : "",
                })}
              >
                <TimePicker format={format} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Время окончания"
                name="end_time"
                rules={[
                  {
                    required: true,
                  },
                ]}
                getValueProps={(value) => ({
                  value: value ? dayjs(value) : "",
                })}
              >
                <TimePicker format={format} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Минимальная цена заказа" name="min_price">
            <InputNumber type="number" />
          </Form.Item>
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
          <Form.Item label="Цена за км дальше условий" name="price_per_km">
            <InputNumber type="number" />
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default OrderDeliveryPricing;
