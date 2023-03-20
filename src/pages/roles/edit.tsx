import { useForm, Edit } from "@refinedev/antd";
import { Form, Input, Switch, Select } from "antd";
import { useGetIdentity } from "@refinedev/core";
import { client } from "graphConnect";
import { gql } from "graphql-request";
import { IPermissions, IRoles } from "interfaces";
import { useEffect, useState } from "react";

const { Option } = Select;

export const RolesEdit: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>({
    v3LegacyAuthProviderCompatible: true
  });
  const [permissions, setPermissions] = useState<IPermissions[]>([]);
  const [chosenPermissions, setChosenPermissions] = useState<string[]>([]);

  const { formProps, saveButtonProps, id } = useForm<IRoles>({
    meta: {
      fields: ["id", "name", "code", "active"],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  const loadPermissions = async () => {
    let query = gql`
      query {
        permissions {
          id
          slug
          description
        }
      }
    `;

    const permissionsData = await client.request(
      query,
      {},
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );

    query = gql`
      query ($id: String) {
        manyRolePermissions(where: { role_id: { equals: $id } }) {
          permission_id
        }
      }
    `;
    const variables = {
      id,
    };
    const chosenPermissionsData = await client.request(query, variables, {
      Authorization: `Bearer ${identity?.token.accessToken}`,
    });
    setChosenPermissions(
      chosenPermissionsData.manyRolePermissions.map(
        (item: any) => item.permission_id
      )
    );

    setPermissions(permissionsData.permissions);
  };

  const beforeSave = async (data: any) => {
    const query = gql`
      mutation ($id: ID!, $chosenPermissions: [String!]!) {
        assignRolePermissions(
          role_id: $id
          permission_ids: $chosenPermissions
        ) {
          count
        }
      }
    `;
    let variables = {
      id: id,
      chosenPermissions: chosenPermissions,
    };
    await client.request(query, variables, {
      Authorization: `Bearer ${identity?.token.accessToken}`,
    });
    saveButtonProps.onClick();
  };

  const onPermissionsSelect = (value: any) => {
    setChosenPermissions(value);
  };

  useEffect(() => {
    loadPermissions();
  }, [identity]);

  return (
    <Edit
      saveButtonProps={{
        disabled: saveButtonProps.disabled,
        loading: saveButtonProps.loading,
        onClick: beforeSave,
      }}
      title="Редактировать роль"
    >
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
        <Form.Item label="Код" name="code">
          <Input />
        </Form.Item>
        <Form.Item label="Разрешения">
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Выберите разрешения"
            value={chosenPermissions}
            onChange={onPermissionsSelect}
            optionLabelProp="label"
          >
            {permissions.map((item: any) => (
              <Option key={item.id} value={item.id} label={item.description}>
                {item.description}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Edit>
  );
};
