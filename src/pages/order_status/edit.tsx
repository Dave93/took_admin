import {
  Col,
  Edit,
  Form,
  Input,
  InputNumber,
  Row,
  Switch,
  useForm,
} from "@pankod/refine-antd";
import { useGetIdentity } from "@pankod/refine-core";

import { IOrderStatus, IOrganization } from "interfaces";
import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { Colorpicker } from "antd-colorpicker";

export const OrderStatusEdit: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps, id } = useForm<IOrderStatus>({
    metaData: {
      fields: [
        "id",
        "name",
        "sort",
        "color",
        "organization_id",
        "finish",
        "cancel",
        "waiting",
        "need_location",
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
    <Edit saveButtonProps={saveButtonProps} title="Редактировать статус заказа">
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          ...formProps.initialValues,
          color: formProps?.initialValues?.color ?? "#fff",
        }}
      >
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
          {/* <Col span={12}>
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
          </Col> */}
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
              <Colorpicker
                popup
                onColorResult={(color) => color.hex}
                picker={"PhotoshopPicker"}
              />
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
              label="Требует местоположение"
              name="need_location"
              valuePropName="checked"
            >
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
    </Edit>
  );
};
