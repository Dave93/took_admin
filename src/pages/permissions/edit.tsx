import {
  useForm,
  Form,
  Input,
  Select,
  Edit,
  useSelect,
  Switch,
  Checkbox,
} from "@pankod/refine-antd";
import { IPermissions } from "interfaces";

export const PermissionsEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult, mutationResult } =
    useForm<IPermissions>({
      metaData: {
        fields: ["id", "slug", "active", "created_at"],
        pluralize: true,
      },
    });

  console.log(mutationResult);

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
        >
          <Checkbox value={true} />
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
