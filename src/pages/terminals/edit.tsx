import { useForm, Edit } from "@refinedev/antd";
import { Form, Input, Switch, Row, Col, InputNumber } from "antd";
import { useGetIdentity } from "@refinedev/core";
import { client } from "graphConnect";
import { gql } from "graphql-request";
import { IOrganization, ITerminals } from "interfaces";
import { useEffect, useState } from "react";

export const TerminalsEdit: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>({
    v3LegacyAuthProviderCompatible: true
  });
  const { formProps, saveButtonProps } = useForm<ITerminals>({
    meta: {
      fields: [
        "id",
        "name",
        "active",
        "created_at",
        "organization_id",
        "phone",
        "latitude",
        "longitude",
        "external_id",
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
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setOrganizations(cachedOrganizations);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
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
        {/* <Form.Item
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
        </Form.Item> */}
        <Form.Item label="Телефон" name="phone">
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Широта"
              name="latitude"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Долгота"
              name="longitude"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber type="number" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Внешний идентификатор" name="external_id">
          <Input disabled />
        </Form.Item>
      </Form>
    </Edit>
  );
};
