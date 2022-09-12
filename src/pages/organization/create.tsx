import {
  Col,
  Create,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  useForm,
} from "@pankod/refine-antd";
import { useTranslate } from "@pankod/refine-core";
import { IOrganization } from "interfaces";
import {
  organization_payment_types,
  organization_system_type,
} from "interfaces/enums";

const { TextArea } = Input;

export const OrganizationsCreate = () => {
  const { formProps, saveButtonProps } = useForm<IOrganization>({
    metaData: {
      fields: [
        "id",
        "name",
        "active",
        "created_at",
        "phone",
        "webhook",
        "system_type",
        "group_id",
        "apelsin_login",
        "apelsin_password",
        "sender_name",
        "sender_number",
        "description",
        "payment_type",
      ],
      // pluralize: true,
    },
  });

  const tr = useTranslate();
  return (
    <Create saveButtonProps={saveButtonProps} title="Создать организацию">
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
        <Form.Item label="Телефон" name="phone">
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Тип системы" name="system_type">
              <Select allowClear>
                {Object.keys(organization_system_type).map((key) => (
                  <Select.Option key={key} value={key}>
                    {
                      Object.keys(organization_system_type).filter(
                        (k) => k === key
                      )[0]
                    }
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Iiko логин" name="iiko_login">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Тип доставки" name="payment_type">
          <Select>
            {Object.keys(organization_payment_types).map((type: string) => (
              <Select.Option key={type} value={type}>
                {tr(`organizations.paymentType.${type}`)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Внешний id" name="external_id">
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Максимальное расстояние" name="max_distance">
              <InputNumber type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Максимальное количество активных заказов"
              name="max_active_order_count"
            >
              <InputNumber type="number" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Вебхук" name="webhook">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="ID группы" name="group_id">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Логин Апельсин" name="apelsin_login">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Пароль Апельсин" name="apelsin_password">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Имя отправителя" name="sender_name">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Номер отправителя" name="sender_number">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Описание" name="description">
          <TextArea rows={6} />
        </Form.Item>
      </Form>
    </Create>
  );
};
