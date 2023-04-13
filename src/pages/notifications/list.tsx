import {
  Create,
  DeleteButton,
  List,
  useDrawerForm,
  useModal,
  useTable,
} from "@refinedev/antd";
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
} from "antd";
import { CrudFilters, HttpError, useGetIdentity } from "@refinedev/core";
import { client } from "graphConnect";
import { gql } from "graphql-request";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { INotificationStatistic, INotifications, IRoles } from "interfaces";
import { rangePresets } from "components/dates/RangePresets";
import { PlusOutlined, BarsOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { NotificationsStatistic } from "components/notifications/statistic";

const { RangePicker } = DatePicker;

const NotificationsList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [roles, setRoles] = useState<IRoles[]>([]);
  const queryClient = useQueryClient();

  const {
    tableProps,
    searchFormProps,
    filters,
    sorters: sorter,
    setFilters,
  } = useTable<
    INotifications,
    HttpError,
    {
      created_at: [dayjs.Dayjs, dayjs.Dayjs];
      status: string;
      role: string;
    }
  >({
    queryOptions: {
      queryKey: ["notifications"],
    },

    meta: {
      fields: [
        "id",
        "title",
        "created_at",
        "body",
        "send_at",
        "status",
        "role",
      ],
      whereInputType: "notificationsWhereInput!",
      orderByInputType: "notificationsOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },

    onSearch: async (params) => {
      const localFilters: CrudFilters = [];
      queryClient.invalidateQueries(["default", "notifications", "list"]);
      // queryClient.invalidateQueries();
      const { created_at, status, role } = params;

      localFilters.push(
        {
          field: "created_at",
          operator: "gte",
          value: created_at ? created_at[0].toISOString() : undefined,
        },
        {
          field: "created_at",
          operator: "lte",
          value: created_at ? created_at[1].toISOString() : undefined,
        }
      );

      localFilters.push({
        field: "public",
        operator: "eq",
        value: { equals: true },
      });

      return localFilters;
    },

    pagination: {
      pageSize: 200,
    },

    filters: {
      initial: [
        {
          field: "created_at",
          operator: "gte",
          value: dayjs().startOf("d").toDate(),
        },
        {
          field: "created_at",
          operator: "lte",
          value: dayjs().endOf("d").toDate(),
        },
        {
          field: "public",
          operator: "eq",
          value: { equals: true },
        },
      ],

      defaultBehavior: "replace",
    },

    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });

  const showNotificationStatistic = async (notification_id: string) => {
    const query = gql`
      query {
        notificationStatistic(
          id: "${notification_id}"
        ) {
          id
          title
          body
          created_at
          send_at
          status
          role
          user {
            id
            first_name
            last_name
          }
          deliver_status
        }
      }
    `;
    const { notificationStatistic } = await client.request<{
      notificationStatistic: INotificationStatistic[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    Modal.info({
      // title: "This is a notification message",
      content: <NotificationsStatistic notifications={notificationStatistic} />,
      onOk() {},
    });
  };

  const {
    drawerProps,
    formProps,
    show,
    close,
    saveButtonProps,
    deleteButtonProps,
    id,
  } = useDrawerForm<INotifications>({
    action: "create",
    resource: "notifications",
    redirect: false,
    meta: {
      fields: [
        "id",
        "title",
        "created_at",
        "body",
        "send_at",
        "status",
        "role",
      ],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  const columns = [
    {
      title: "№",
      dataIndex: "order_number",
      width: 60,
      excelRender: (value: any, record: any, index: number) => index + 1,
      render: (value: any, record: any, index: number) => (
        <div>{index + 1}</div>
      ),
    },
    {
      title: "Дата",
      dataIndex: "created_at",
      width: 150,
      excelRender: (value: any) => dayjs(value).format("DD.MM.YYYY HH:mm"),
      render: (value: any) => (
        <div>{dayjs(value).format("DD.MM.YYYY HH:mm")}</div>
      ),
    },
    {
      title: "Дата отправки",
      dataIndex: "send_at",
      width: 150,
      excelRender: (value: any) => dayjs(value).format("DD.MM.YYYY HH:mm"),
      render: (value: any) => (
        <div>{dayjs(value).format("DD.MM.YYYY HH:mm")}</div>
      ),
    },
    {
      title: "Заголовок",
      dataIndex: "title",
      width: 200,
    },
    {
      title: "Текст",
      dataIndex: "body",
      width: 200,
    },
    {
      title: "Роль",
      dataIndex: "role",
      width: 100,
      render: (value: any) => {
        const role = roles.find((role) => role.id === value);
        return <div>{role?.name}</div>;
      },
    },
    {
      title: "Статус",
      dataIndex: "status",
      width: 100,
    },
    {
      title: "Действия",
      dataIndex: "actions",
      width: 100,
      render: (value: any, record: any) => (
        <Space>
          <DeleteButton
            {...deleteButtonProps}
            resource="notifications"
            recordItemId={record.id}
            onSuccess={() => {
              queryClient.invalidateQueries([
                "default",
                "notifications",
                "list",
              ]);
            }}
          />
          <Button
            icon={<BarsOutlined />}
            onClick={() => showNotificationStatistic(record.id)}
          />
        </Space>
      ),
    },
  ];

  const getAllFilterData = async () => {
    const query = gql`
      query {
        roles {
          id
          name
        }
      }
    `;
    const { roles } = await client.request<{
      roles: IRoles[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setRoles(roles);
  };

  useEffect(() => {
    getAllFilterData();
  }, []);

  return (
    <>
      <List
        title="Список рассылок"
        headerProps={{
          extra: (
            <div>
              <Button
                onClick={() => {
                  show();
                }}
                icon={<PlusOutlined />}
              >
                Создать
              </Button>
            </div>
          ),
        }}
      >
        <Form
          layout="vertical"
          {...searchFormProps}
          initialValues={{
            created_at: [dayjs().startOf("d"), dayjs().endOf("d")],
          }}
        >
          <Row gutter={16} align="bottom">
            <Col xs={12} sm={12} md={5}>
              <Form.Item label="Дата заказа" name="created_at">
                <RangePicker
                  format={"DD.MM.YYYY HH:mm"}
                  showTime
                  presets={rangePresets}
                />
              </Form.Item>
            </Col>
            <Col span={2}>
              <Form.Item>
                <Button htmlType="submit" type="primary">
                  Фильтровать
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div
          style={{
            overflow: "auto",
          }}
        >
          <Table
            {...tableProps}
            rowKey="id"
            bordered
            size="small"
            scroll={
              window.innerWidth < 768
                ? undefined
                : { y: "calc(100vh - 390px)", x: "calc(100vw - 350px)" }
            }
            pagination={{
              ...tableProps.pagination,
              showSizeChanger: true,
            }}
            columns={columns}
          />
        </div>
        <Drawer {...drawerProps} width={800}>
          <Create title="Добавить рассылку" saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
              <Row gutter={16}>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    label="Заголовок"
                    name="title"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    label="Дата отправки"
                    name="send_at"
                    rules={[{ required: true }]}
                  >
                    <DatePicker
                      format={"DD.MM.YYYY HH:mm"}
                      showTime
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col>
                  <Form.Item
                    label="Текст"
                    name="body"
                    rules={[{ required: true }]}
                  >
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    label="Роль"
                    name="role"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      {roles.map((role) => (
                        <Select.Option key={role.id} value={role.id}>
                          {role.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Create>
        </Drawer>
      </List>
    </>
  );
};

export default NotificationsList;
