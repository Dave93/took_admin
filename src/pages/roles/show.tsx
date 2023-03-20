import { useGetIdentity, useShow } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { Typography, Tag, Switch } from "antd";

import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";

const { Title, Text } = Typography;

export const RolesShow = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>({
    v3LegacyAuthProviderCompatible: true
  });
  const [chosenPermissions, setChosenPermissions] = useState<string[]>([]);
  const { queryResult, showId } = useShow({
    meta: {
      fields: ["id", "name", "active", "created_at"],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const loadPermissions = async () => {
    let query = gql`
      query ($id: String) {
        manyRolePermissions(where: { role_id: { equals: $id } }) {
          permissions {
            description
          }
        }
      }
    `;
    const variables = {
      id: showId,
    };
    const chosenPermissionsData = await client.request(query, variables, {
      Authorization: `Bearer ${identity?.token.accessToken}`,
    });
    setChosenPermissions(
      chosenPermissionsData.manyRolePermissions.map(
        (item: any) => item.permissions.description
      )
    );
  };

  useEffect(() => {
    loadPermissions();
  }, [showId, identity]);

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Активность</Title>
      <Text>
        <Switch checked={record?.active} disabled />
      </Text>

      <Title level={5}>Название</Title>
      <Text>{record?.name}</Text>
      <Title level={5}>Разрешения</Title>
      <Text>
        {chosenPermissions.map((permission: string) => (
          <Tag key={permission}>{permission}</Tag>
        ))}
      </Text>
    </Show>
  );
};
