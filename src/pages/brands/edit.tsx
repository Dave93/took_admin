import { Edit, useForm } from "@refinedev/antd";
import { Col, Form, Input, Row } from "antd";
import { useGetIdentity } from "@refinedev/core";

import { IBrands } from "interfaces";
import FileUploader from "components/file_uploader";

export const BrandsEdit: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps, id } = useForm<IBrands>({
    meta: {
      fields: ["id", "name", "api_url", "logo_path"],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  return (
    <Edit saveButtonProps={saveButtonProps} title="Редактировать бренда">
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Лого"
              name="logo_path"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              {/** @ts-ignore */}
              <FileUploader modelId={id} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
