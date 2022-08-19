import { Create, Form, Input, Switch, useForm } from "@pankod/refine-antd";

import { IRoles } from "interfaces";

export const RolesCreate = () => {
  const { formProps, saveButtonProps } = useForm<IRoles>({
    metaData: {
      fields: ["id", "name", "active", "created_at"],
      pluralize: true,
    },
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Создать разрешение">
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
      </Form>
    </Create>
  );
};
