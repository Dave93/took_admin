import {
  CanAccess,
  useCan,
  useGetIdentity,
  useNavigation,
  useShow,
} from "@pankod/refine-core";
import {
  Show,
  Descriptions,
  Col,
  Row,
  Tag,
  Button,
  Tabs,
  Table,
  Timeline,
  Space,
  Popconfirm,
  Popover,
  AntdList,
} from "@pankod/refine-antd";
import dayjs from "dayjs";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { YMaps, Map } from "react-yandex-maps";
import {
  IOrderActions,
  IOrderLocation,
  IOrderStatus,
  IUsers,
} from "interfaces";
import "dayjs/locale/ru";
import duration from "dayjs/plugin/duration";
import { CloseCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { ChangeOrdersCouirer } from "components/orders/changeCourier";
import OrderDeliveryPricing from "components/orders/order_delivery_pricing";
import OrderNotes from "components/orders/order_notes";
dayjs.locale("ru");
dayjs.extend(duration);

interface OrderShowHeaderProps {
  startDate: Date;
  endDate: Date;
  defaultButtons: React.ReactNode;
}

const OrderShowHeader: FC<OrderShowHeaderProps> = ({
  defaultButtons,
  startDate,
  endDate,
}) => {
  const duration = useMemo(() => {
    if (startDate && endDate) {
      return `Доставка завершена за ${dayjs(endDate).diff(
        startDate,
        "minute"
      )} минут`;
    } else {
      return "Доставка не завершена";
    }
  }, [startDate, endDate]);
  return (
    <Space>
      <div>
        <strong>{duration}</strong>
      </div>
      {defaultButtons}
    </Space>
  );
};

export const OrdersShow = () => {
  const map = useRef<any>(null);
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [orderActions, setOrderActions] = useState<IOrderActions[]>([]);
  const [orderLocations, setOrderLocations] = useState<IOrderLocation[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<IOrderStatus[]>([]);

  const { show } = useNavigation();

  const { data: orderCanEdit } = useCan({
    resource: "orders",
    action: "edit",
  });

  const { queryResult, showId } = useShow({
    metaData: {
      fields: [
        "id",
        "delivery_type",
        "created_at",
        "order_price",
        "order_number",
        "duration",
        "delivery_price",
        "payment_type",
        "from_lat",
        "from_lon",
        "to_lat",
        "to_lon",
        "order_items",
        "delivery_pricing_id",
        "pre_distance",
        "pre_duration",
        "finished_date",
        "delivery_comment",
        "operator_notes",
        {
          orders_organization: ["id", "name"],
        },
        {
          orders_couriers: ["id", "first_name", "last_name"],
        },
        {
          orders_customers: ["id", "name", "phone"],
        },
        {
          orders_order_status: ["id", "name", "color"],
        },
        {
          orders_terminals: ["id", "name"],
        },
      ],
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const loadOrderStatuses = async () => {
    let organizations: any = {};

    if (record) {
      const query = gql`
        query {
            orderStatuses(where: {
                organization_id: {
                    equals: "${record.orders_organization.id}"
                }
            }, orderBy: {
                sort: asc}) {
                id
                name
            }
        }`;
      const { orderStatuses } = await client.request<{
        orderStatuses: IOrderStatus[];
      }>(
        query,
        {},
        {
          Authorization: `Bearer ${identity?.token.accessToken}`,
        }
      );
      setOrderStatuses(orderStatuses);
    }
  };

  const productsColumns = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Цена",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Сумма",
      dataIndex: "sum",
      key: "sum",
    },
  ];

  const productsData = useMemo(() => {
    let order_items = [];
    if (record?.order_items) {
      try {
        order_items = JSON.parse(record?.order_items);
      } catch (error) {}
    }
    return order_items?.map((item: any) => ({
      key: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      sum: item.price * item.quantity,
    }));
  }, [record]);

  const onTabChange = async (key: string) => {
    if (key === "3") {
      const query = gql`
        query ($id: String!) {
          findForOrder(orderId: $id) {
            id
            created_at
            action
            action_text
            duration
            order_actions_created_byTousers {
              first_name
              last_name
            }
          }
        }
      `;

      const { findForOrder } = await client.request<{
        findForOrder: IOrderActions[];
      }>(
        query,
        { id: showId },
        {
          Authorization: `Bearer ${identity?.token.accessToken}`,
        }
      );

      setOrderActions(findForOrder);
    }
  };

  const loadOrderLocations = async () => {
    const query = gql`
      query ($id: String!) {
        locationsForOrder(orderId: $id) {
          created_at
          location {
            lat
            lon
          }
        }
      }
    `;
    const { locationsForOrder } = await client.request<{
      locationsForOrder: IOrderLocation[];
    }>(
      query,
      { id: showId },
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );

    setOrderLocations(locationsForOrder);
  };

  const mapPoints = useMemo(() => {
    return orderLocations.map((item) => [item.location.lat, item.location.lon]);
  }, [orderLocations]);

  const updateOrderStatus = async (id: string) => {
    const query = gql`
      mutation ($id: String!, $status: String!) {
        updateOrderStatus(orderId: $id, orderStatusId: $status) {
          created_at
        }
      }
    `;
    await client.request(
      query,
      {
        id: showId,
        status: id,
      },
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );
    window.location.reload();
  };

  const clearCourier = async (id: string | undefined) => {
    const query = gql`
      mutation ($id: String!) {
        clearCourier(orderId: $id) {
          created_at
        }
      }
    `;
    await client.request(
      query,
      { id: showId },
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );
    window.location.reload();
  };

  useEffect(() => {
    loadOrderStatuses();
    loadOrderLocations();
  }, [identity, record]);

  return (
    <Show
      isLoading={isLoading}
      title={`Заказ #${record?.order_number}`}
      headerButtons={({ defaultButtons }) => (
        <OrderShowHeader
          startDate={record?.created_at}
          endDate={record?.finished_date}
          defaultButtons={defaultButtons}
        />
      )}
    >
      <Tabs defaultActiveKey="1" onChange={onTabChange}>
        <Tabs.TabPane tab="Основная информация" key="1">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Дата заказа">
                  {dayjs(record?.created_at).format("DD.MM.YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Статус">
                  <Tag color={record?.orders_order_status?.color}>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#000",
                        textTransform: "uppercase",
                      }}
                    >
                      {record?.orders_order_status?.name}
                    </div>
                  </Tag>
                  <CanAccess resource="orders" action="edit">
                    <Popover
                      placement="bottom"
                      title="Выберите статус"
                      content={() => (
                        <div>
                          <AntdList
                            size="small"
                            dataSource={orderStatuses}
                            renderItem={(item) => (
                              <AntdList.Item>
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() => {
                                    updateOrderStatus(item.id);
                                  }}
                                >
                                  {item.name}
                                </Button>
                              </AntdList.Item>
                            )}
                          />
                        </div>
                      )}
                      trigger="click"
                    >
                      <Button
                        size="small"
                        block
                        style={{
                          marginTop: 8,
                        }}
                      >
                        Сменить статус
                      </Button>
                    </Popover>
                  </CanAccess>
                </Descriptions.Item>
                <Descriptions.Item label="Организация">
                  <Button
                    type="link"
                    size="small"
                    onClick={() =>
                      show(
                        "organizations",
                        "show",
                        record?.orders_organization?.id
                      )
                    }
                  >
                    {record?.orders_organization?.name}
                  </Button>
                </Descriptions.Item>
                <Descriptions.Item label="Филиал">
                  <Button
                    type="link"
                    size="small"
                    onClick={() =>
                      show("terminals", "show", record?.orders_terminals?.id)
                    }
                  >
                    {record?.orders_terminals?.name}
                  </Button>
                </Descriptions.Item>
                <Descriptions.Item label="Курьер">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-around",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <Button
                        type="link"
                        size="small"
                        onClick={() =>
                          show("couriers", "show", record?.orders_couriers?.id)
                        }
                      >
                        {record?.orders_couriers?.first_name}{" "}
                        {record?.orders_couriers?.last_name}
                      </Button>
                    </div>
                    <div
                      style={{
                        marginLeft: 5,
                        marginRight: 5,
                      }}
                    >
                      <CanAccess resource="orders" action="changeCourier">
                        <ChangeOrdersCouirer
                          id={showId?.toString()}
                          terminal_id={record?.orders_terminals.id}
                        />
                      </CanAccess>
                    </div>
                    <CanAccess resource="orders" action="clear_courier">
                      <Popconfirm
                        title="Вы действительно хотите очистить курьера?"
                        onConfirm={() => {
                          clearCourier(showId?.toString());
                        }}
                        // onCancel={cancel}
                        okText="Да"
                        cancelText="Нет"
                      >
                        <Button
                          shape="circle"
                          danger
                          size="small"
                          icon={<CloseOutlined />}
                        />
                      </Popconfirm>
                    </CanAccess>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="ФИО">
                  {record?.orders_customers?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Телефон">
                  {record?.orders_customers?.phone}
                </Descriptions.Item>
                <Descriptions.Item label="Способ оплаты">
                  {record?.payment_type}
                </Descriptions.Item>
                <Descriptions.Item label="Стоимость заказа">
                  {new Intl.NumberFormat("ru").format(record?.order_price)} сум
                </Descriptions.Item>
                <Descriptions.Item label="Стоимость доставки">
                  {new Intl.NumberFormat("ru").format(record?.delivery_price)}{" "}
                  сум
                </Descriptions.Item>
                <Descriptions.Item label="Дистанция">
                  {record?.pre_distance} км
                </Descriptions.Item>
                <Descriptions.Item label="Время доставки">
                  {dayjs
                    .duration(record?.pre_duration * 1000)
                    .format("HH:mm:ss")}
                </Descriptions.Item>
                <Descriptions.Item label="Комментарий">
                  {record?.delivery_comment}
                </Descriptions.Item>
                {orderCanEdit?.can && (
                  <Descriptions.Item label="Заметки">
                    <OrderNotes
                      orderId={showId!.toString()}
                      notes={record?.operator_notes}
                    />
                  </Descriptions.Item>
                )}
                {record?.cancel_reason && (
                  <Descriptions.Item label="Причина отмены">
                    {record?.cancel_reason}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Col>
            <Col xs={24} md={12}>
              <YMaps
                query={{
                  lang: "ru_RU",
                  load: "package.full",
                  coordorder: "latlong",
                }}
              >
                <Map
                  defaultState={{
                    center: [record?.from_lat, record?.from_lon],
                    zoom: 15,
                    controls: ["zoomControl"],
                  }}
                  instanceRef={(ref) => (map.current = ref)}
                  width="100%"
                  height="100vh"
                  modules={["control.ZoomControl"]}
                  onLoad={(ymaps) => {
                    // Создадим ломаную.
                    var polyline = new ymaps.Polyline(
                      mapPoints,
                      {
                        hintContent: "Траектория курьера",
                      },
                      {
                        // draggable: true,
                        strokeColor: "#000000",
                        strokeWidth: 5,
                        // Первой цифрой задаем длину штриха. Второй — длину разрыва.
                        // strokeStyle: "1 5",
                      }
                    );
                    // Добавляем линию на карту.
                    map.current.geoObjects.add(polyline);
                    var placemark = new ymaps.Placemark(
                      [record?.from_lat, record?.from_lon],
                      {
                        hintContent: "Адрес отправления",
                        iconContent: "A",
                      },
                      {
                        // Задаем стиль метки (метка в виде круга).
                        preset: "islands#blueCircleIcon",
                      }
                    );
                    map.current.geoObjects.add(placemark);

                    placemark = new ymaps.Placemark(
                      [record?.to_lat, record?.to_lon],
                      {
                        hintContent: "Адрес клиента",
                        iconContent: "B",
                      },
                      {
                        // Задаем стиль метки (метка в виде круга).
                        preset: "islands#darkGreenCircleIcon",
                      }
                    );
                    map.current.geoObjects.add(placemark);
                    let bounds = map.current.geoObjects.getBounds();
                    // Применяем область показа к карте
                    map.current.setBounds(bounds);
                  }}
                ></Map>
              </YMaps>
            </Col>
          </Row>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Товары" key="2">
          <Table columns={productsColumns} dataSource={productsData} />
        </Tabs.TabPane>
        <Space direction="vertical" />
        <Tabs.TabPane tab="История" key="3">
          <Timeline mode="left">
            {orderActions.map((item, key) => (
              <Timeline.Item
                key={item.id}
                color={key % 2 === 0 ? "green" : "red"}
                label={
                  <div>
                    Дата: {dayjs(item.created_at).format("DD.MM.YYYY HH:mm")}
                    <br />
                    Разница:{" "}
                    {dayjs.duration(item.duration * 1000).format("HH:mm:ss")}
                  </div>
                }
                style={{
                  paddingBottom: item.order_actions_created_byTousers
                    ? "20px"
                    : "40px",
                }}
              >
                <Space direction="vertical" style={{ display: "flex" }}>
                  <div>{item.action_text}</div>
                  {item.order_actions_created_byTousers && (
                    <div>
                      <strong>Пользователь: </strong>
                      <Tag color="blue">
                        {item.order_actions_created_byTousers.first_name}
                      </Tag>
                    </div>
                  )}
                </Space>
              </Timeline.Item>
            ))}
          </Timeline>
          <Row>
            <Col span={8} offset={8}>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Дата заказа">
                  {dayjs(record?.created_at).format("DD.MM.YYYY HH:mm")}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Калькулятор суммы доставки" key="4">
          <OrderDeliveryPricing order={record!} />
        </Tabs.TabPane>
      </Tabs>
    </Show>
  );
};
