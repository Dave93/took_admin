import {
  List,
  DateField,
  Table,
  useTable,
  Switch,
  Space,
  EditButton,
  ShowButton,
  Form,
  Select,
  Button,
} from "@pankod/refine-antd";
import { CrudFilters, HttpError } from "@pankod/refine-core";
import { client } from "graphConnect";
import { gql } from "graphql-request";

import { IOrganization, ITerminals } from "interfaces";
import { defaultDateTimeFormat } from "localConstants";
import { useEffect, useState } from "react";

export const TerminalsList: React.FC = () => {
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);

  const { tableProps, searchFormProps } = useTable<
    ITerminals,
    HttpError,
    { organization_id: string }
  >({
    initialSorter: [
      {
        field: "name",
        order: "asc",
      },
      {
        field: "organization_id",
        order: "asc",
      },
    ],
    metaData: {
      fields: [
        "id",
        "name",
        "active",
        "created_at",
        "organization_id",
        "phone",
        "latitude",
        "longitude",
        "external_id",
        {
          organization: ["id", "name"],
        },
      ],
      whereInputType: "terminalsWhereInput!",
      orderByInputType: "terminalsOrderByWithRelationInput!",
    },
    onSearch: async (params) => {
      const filters: CrudFilters = [];
      const { organization_id } = params;

      if (organization_id) {
        filters.push({
          field: "organization_id",
          operator: "eq",
          value: {
            equals: organization_id,
          },
        });
      }
      return filters;
    },
  });

  const loadOrganizations = async () => {
    const query = gql`
      query {
        organizations {
          id
          name
        }
      }
    `;
    const { organizations } = await client.request(query);
    setOrganizations(organizations);
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  return (
    <>
      <List title="Список филиалов">
        <Form layout="horizontal" {...searchFormProps}>
          <Form.Item name="organization_id" label="Организация">
            <Select
              options={organizations.map((org) => ({
                label: org.name,
                value: org.id,
              }))}
            />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">
              Фильтровать
            </Button>
          </Form.Item>
        </Form>
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="active"
            title="Активность"
            render={(value) => <Switch checked={value} disabled />}
          />
          <Table.Column dataIndex="name" title="Название" />
          <Table.Column
            dataIndex="organization.name"
            title="Организация"
            render={(value: any, record: ITerminals) =>
              record.organization.name
            }
          />
          <Table.Column dataIndex="phone" title="Телефон" />
          <Table.Column dataIndex="external_id" title="Внешний идентификатор" />
          <Table.Column dataIndex="latitude" title="Широта" />
          <Table.Column dataIndex="longitude" title="Долгота" />
          <Table.Column
            dataIndex="created_at"
            title="Дата создания"
            render={(value) => (
              <DateField
                format={defaultDateTimeFormat}
                value={value}
                locales="ru"
              />
            )}
          />
          <Table.Column<ITerminals>
            title="Действия"
            dataIndex="actions"
            render={(_text, record): React.ReactNode => {
              return (
                <Space>
                  <EditButton size="small" recordItemId={record.id} hideText />
                  <ShowButton size="small" recordItemId={record.id} hideText />
                </Space>
              );
            }}
          />
        </Table>
      </List>
    </>
  );
};
