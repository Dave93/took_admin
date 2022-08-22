import { useShow } from "@pankod/refine-core";
import { Show, Typography, Tag, Switch } from "@pankod/refine-antd";

import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";

const { Title, Text } = Typography;

export const RolesShow = () => {
  const [chosenPermissions, setChosenPermissions] = useState<string[]>([]);
  const { queryResult, showId } = useShow({
    metaData: {
      fields: ["id", "name", "active", "created_at"],
      pluralize: true,
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
    const chosenPermissionsData = await client.request(query, variables);
    setChosenPermissions(
      chosenPermissionsData.manyRolePermissions.map(
        (item: any) => item.permissions.description
      )
    );
  };

  useEffect(() => {
    loadPermissions();
  }, [showId]);

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
