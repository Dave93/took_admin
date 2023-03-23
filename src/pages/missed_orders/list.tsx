import {
  Create,
  List,
  ShowButton,
  useDrawerForm,
  useTable,
} from "@refinedev/antd";
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
} from "antd";
import {
  CrudFilters,
  HttpError,
  useGetIdentity,
  useNavigation,
  useTranslate,
} from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { IMissedOrderEntity, INotifications } from "interfaces";
import { rangePresets } from "components/dates/RangePresets";
import { PlusOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

const MissedOrdersList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const tr = useTranslate();

  const queryClient = useQueryClient();

  const {
    tableProps,
    searchFormProps,
    filters,
    sorters: sorter,
    setFilters,
  } = useTable<
    IMissedOrderEntity,
    HttpError,
    {
      created_at: [dayjs.Dayjs, dayjs.Dayjs];
      status: string;
      role: string;
    }
  >({
    queryOptions: {
      queryKey: ["missed_orders"],
    },

    meta: {
      fields: [
        "created_at",
        "order_created_at",
        "order_id",
        "order_number",
        "organization_id",
        "terminal_id",
        "system_minutes_config",
      ],
      whereInputType: "missedOrdersWhereInput!",
      orderByInputType: "missedOrdersOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },

    onSearch: async (params) => {
      const localFilters: CrudFilters = [];
      queryClient.invalidateQueries(["default", "missed_orders", "list"]);
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

  const columns = [
    {
      title: "Действия",
      dataIndex: "actions",
      exportable: false,
      width: 50,
      render: (_text: any, record: IMissedOrderEntity): React.ReactNode => (
        <Space>
          <ShowButton size="small" recordItemId={record.id} hideText />
        </Space>
      ),
    },
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
      render: (value: any) => <div>{dayjs(value).format("DD.MM.YYYY")}</div>,
    },
    {
      title: "Дата отправки",
      dataIndex: "send_at",
      width: 150,
      excelRender: (value: any) => dayjs(value).format("DD.MM.YYYY HH:mm"),
      render: (value: any) => <div>{dayjs(value).format("DD.MM.YYYY")}</div>,
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
      title: "Статус",
      dataIndex: "status",
      width: 100,
    },
  ];

  return (
    <>
      <List title="Список рассылок">
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
      </List>
    </>
  );
};

export default MissedOrdersList;
