import {
  Col,
  Create,
  Form,
  Input,
  Row,
  Select,
  Switch,
  TimePicker,
  useForm,
} from "@pankod/refine-antd";
import { useTranslate } from "@pankod/refine-core";

import { IDeliveryPricing } from "interfaces";
import { drive_type } from "interfaces/enums";

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

export const DeliveryPricingCreate = () => {
  const { formProps, saveButtonProps } = useForm<IDeliveryPricing>({
    metaData: {
      fields: [
        "id",
        "name",
        "active",
        "created_at",
        "default",
        "drive_type",
        "days",
        "start_time",
        "end_time",
        "min_price",
        "rules",
        "price_per_km",
      ],
      pluralize: true,
    },
  });

  const tr = useTranslate();

  return (
    <Create saveButtonProps={saveButtonProps} title="Создать разрешение">
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
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
          </Col>
          <Col span={12}>
            <Form.Item
              label="По-умолчанию"
              name="default"
              rules={[
                {
                  required: true,
                },
              ]}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
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
          <Col span={24}>
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
          </Col>
        </Row>
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
            >
              <TimePicker format={format} />
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
            >
              <TimePicker format={format} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
