import { Edit, useForm } from "@refinedev/antd";

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
import { useCan, useTranslate } from "@refinedev/core";

import { IOrderStatus, IOrganization } from "interfaces";
import { drive_type } from "interfaces/enums";
import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { Colorpicker } from "antd-colorpicker";

export const OrderStatusEdit: React.FC = () => {
  const { formProps, saveButtonProps, id } = useForm<IOrderStatus>({
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
      ],
      pluralize: true,
    },
  });

  const tr = useTranslate();

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
    }>(query);
    setOrganizations(cachedOrganizations);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return (
    <Edit saveButtonProps={saveButtonProps} title="Редактировать статус заказа">
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
        </Row>
      </Form>
    </Edit>
  );
};
