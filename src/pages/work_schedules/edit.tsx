import {
  useForm,
  Form,
  Input,
  Edit,
  Switch,
  Select,
  Row,
  Col,
  TimePicker,
} from "@pankod/refine-antd";
import { IWorkSchedules } from "interfaces";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useGetIdentity } from "@pankod/refine-core";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Tashkent");

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
export const WorkSchedulesEdit: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps } = useForm<IWorkSchedules>({
    metaData: {
      fields: [
        "id",
        "name",
        "active",
        "created_at",
        "organization_id",
        "days",
        "start_time",
        "end_time",
        "max_start_time",
      ],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

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
              getValueProps={(value) => ({
                value: value ? dayjs(value) : "",
              })}
            >
              <TimePicker format={format} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Максимальное время начала"
              name="max_start_time"
              rules={[
                {
                  required: true,
                },
              ]}
              getValueProps={(value) => ({
                value: value ? dayjs(value) : "",
              })}
            >
              <TimePicker format={format} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
