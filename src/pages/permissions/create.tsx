import { Create, Form, Input, Switch, useForm } from "@pankod/refine-antd";

import { IPermissions } from "interfaces";

export const PermissionsCreate = () => {
  const { formProps, saveButtonProps } = useForm<IPermissions>({
    metaData: {
      fields: ["id", "slug", "active", "created_at", "description"],
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
          label="Код"
          name="slug"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Описание"
          name="description"
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
