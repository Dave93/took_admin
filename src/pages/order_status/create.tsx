import { Create, useForm } from "@refinedev/antd";
import { Col, Form, Input, InputNumber, Row, Select, Switch } from "antd";
import { useGetIdentity } from "@refinedev/core";

import { IOrderStatus, IOrganization } from "interfaces";
import { Colorpicker } from "antd-colorpicker";
import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";

export const OrderStatusCreate = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>({
    v3LegacyAuthProviderCompatible: true
  });
  const { formProps, saveButtonProps } = useForm<IOrderStatus>({
    meta: {
      fields: [
        "id",
        "name",
        "sort",
        "color",
        "organization_id",
        "finish",
        "cancel",
        "waiting",
        "on_way",
        "in_terminal",
      ],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  const [organizations, setOrganizations] = useState<IOrganization[]>([]);

  const fetchOrganizations = async () => {
    const query = gql`
      query {
        cachedOrganizations {
          id
          name
        }
      }
    `;

    const { cachedOrganizations } = await client.request<{
      cachedOrganizations: IOrganization[];
    }>(
      query,
      {},
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );
    setOrganizations(cachedOrganizations);
  };

  useEffect(() => {
    fetchOrganizations();
  }, [identity]);

  return (
    <Create saveButtonProps={saveButtonProps} title="Создать статус заказа">
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
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item
              label="Сортировка"
              name="sort"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Цвет" name="color">
              <Colorpicker popup />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Завершающий"
              name="finish"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Отменяющий" name="cancel" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Ожидающий" name="waiting" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="В филиале"
              name="in_terminal"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="В пути" name="on_way" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
