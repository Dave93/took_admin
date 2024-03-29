import { Create, useForm } from "@refinedev/antd";
import { Col, Form, Input, Row } from "antd";
import { useGetIdentity } from "@refinedev/core";

import { IBrands } from "interfaces";

export const BrandsCreate = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps } = useForm<IBrands>({
    meta: {
      fields: ["id", "name", "api_url", "logo_path"],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Добавить бренд">
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Row align="middle" gutter={8}>
              <Col span={18}>
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
              <Col span={6}>
                <Form.Item
                  label="Домен"
                  name="api_url"
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
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
