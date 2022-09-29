import { Create, Form, Input, Switch, useForm } from "@pankod/refine-antd";
import { useGetIdentity } from "@pankod/refine-core";

import { IRoles } from "interfaces";

export const RolesCreate = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps } = useForm<IRoles>({
    metaData: {
      fields: ["id", "name", "active", "code", "created_at"],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
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
        <Form.Item label="Код" name="code">
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};
