import { useForm, Form, Input, Edit, Switch } from "@pankod/refine-antd";
import { useGetIdentity } from "@pankod/refine-core";
import { IPermissions } from "interfaces";

export const PermissionsEdit: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps } = useForm<IPermissions>({
    metaData: {
      fields: ["id", "slug", "active", "created_at", "description"],
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
      </Form>
    </Edit>
  );
};
