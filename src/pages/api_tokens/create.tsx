import { Create, useForm } from "@refinedev/antd";
import { Button, Col, Form, Input, Row, Select, Switch } from "antd";
import { useGetIdentity } from "@refinedev/core";

import { IApiTokens, IOrganization } from "interfaces";
import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";

export const ApiTokensCreate = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps } = useForm<IApiTokens>({
    meta: {
      fields: ["id", "active", "token", "organization_id"],
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
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setOrganizations(cachedOrganizations);
  };

  const generateToken = () => {
    // generate token with length 50
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    formProps?.form?.setFieldsValue({ token });
  };

  useEffect(() => {
    fetchOrganizations();
  }, [identity]);

  return (
    <Create saveButtonProps={saveButtonProps} title="Создать токен">
      <Form {...formProps} layout="vertical">
        <Form.Item
          name="active"
          label="Активен"
          rules={[{ required: true }]}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Row align="middle" gutter={8}>
              <Col span={18}>
                <Form.Item
                  label="Токен"
                  name="token"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Button type="primary" onClick={generateToken}>
                  Сгенерировать
                </Button>
              </Col>
            </Row>
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
      </Form>
    </Create>
  );
};
