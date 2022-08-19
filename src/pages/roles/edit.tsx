import {
  useForm,
  Form,
  Input,
  Edit,
  Switch,
  Row,
  Col,
} from "@pankod/refine-antd";
import { IRoles } from "interfaces";

export const RolesEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<IRoles>({
    metaData: {
      fields: ["id", "name", "active"],
      pluralize: true,
    },
  });

  return (
    <Edit saveButtonProps={saveButtonProps} title="Редактировать роль">
      <Row>
        <Col span={18}>
          <Form {...formProps} layout="vertical">
            <Form.Item
              label="Активность"
              name="active"
              valuePropName="checked"
              rules={[
                {
                  required: true,
                },
              ]}
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
          </Form>
        </Col>
        <Col span={6}></Col>
      </Row>
    </Edit>
  );
};
