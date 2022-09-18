import { useGetIdentity, useNavigation, useShow } from "@pankod/refine-core";
import {
  Show,
  Typography,
  Descriptions,
  Col,
  Row,
  Tag,
  Button,
  Tabs,
  Table,
  Timeline,
  Space,
} from "@pankod/refine-antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { YMaps, Map, Polyline, Placemark } from "react-yandex-maps";
import { IOrderActions, IOrderLocation } from "interfaces";
import "dayjs/locale/ru";
import duration from "dayjs/plugin/duration";
dayjs.locale("ru");
dayjs.extend(duration);

const { Title, Text } = Typography;

export const OrdersShow = () => {
  const map = useRef<any>(null);
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [orderActions, setOrderActions] = useState<IOrderActions[]>([]);
  const [orderLocations, setOrderLocations] = useState<IOrderLocation[]>([]);
  const { show } = useNavigation();
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
    },
  });
  const { data, isLoading } = queryResult;

  const record = data?.data;

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
    return record?.order_items?.items?.map((item: any) => ({
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

  useEffect(() => {
    loadOrderLocations();
  }, [identity]);

  const mapPoints = useMemo(() => {
    return orderLocations.map((item) => [item.location.lat, item.location.lon]);
  }, [orderLocations]);

  return (
    <Show isLoading={isLoading} title={`Заказ #${record?.order_number}`}>
      <Tabs defaultActiveKey="1" onChange={onTabChange}>
        <Tabs.TabPane tab="Основная информация" key="1">
          <Row gutter={16}>
            <Col span={12}>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Дата заказа">
                  {dayjs(record?.created_at).format("DD.MM.YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Статус">
                  <Tag color={record?.orders_order_status?.color}>
                    {record?.orders_order_status?.name}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Организация">
                  <Button
                    type="link"
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
                    onClick={() =>
                      show("terminals", "show", record?.orders_terminals?.id)
                    }
                  >
                    {record?.orders_terminals?.name}
                  </Button>
                </Descriptions.Item>
                <Descriptions.Item label="Курьер">
                  <Button
                    type="link"
                    onClick={() =>
                      show("couriers", "show", record?.orders_couriers?.id)
                    }
                  >
                    {record?.orders_couriers?.first_name}{" "}
                    {record?.orders_couriers?.last_name}
                  </Button>
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
                  {record?.duration / 1000} км
                </Descriptions.Item>
                <Descriptions.Item label="Время доставки">
                  {dayjs.duration(record?.duration * 1000).format("HH:mm:ss")}
                </Descriptions.Item>
                <Descriptions.Item label="Комментарий">
                  {record?.comment}
                </Descriptions.Item>
                {record?.cancel_reason && (
                  <Descriptions.Item label="Причина отмены">
                    {record?.cancel_reason}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Col>
            <Col span={12}>
              <YMaps query={{ lang: "ru_RU", load: "package.full" }}>
                <Map
                  defaultState={{
                    center: [record?.from_lat, record?.from_lon],
                    zoom: 15,
                    controls: ["zoomControl"],
                  }}
                  instanceRef={(ref) => (map.current = ref)}
                  width="100%"
                  height="100%"
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

                    var placemark = new ymaps.Placemark(
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
                    // Устанавливаем карте границы линии.
                    map.current.setBounds([
                      [record?.from_lat, record?.from_lon],
                      [record?.to_lat, record?.to_lon],
                    ]);
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
                  paddingBottom: "40px",
                }}
              >
                {item.action_text}
              </Timeline.Item>
            ))}
          </Timeline>
        </Tabs.TabPane>
      </Tabs>
    </Show>
  );
};
