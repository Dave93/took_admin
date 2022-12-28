import { useGetIdentity } from "@pankod/refine-core";
import { client } from "graphConnect";
import { gql } from "graphql-request";
import { FC, useMemo, useState } from "react";
import { Map, Placemark, YMaps } from "@pbe/react-yandex-maps";

import useSWR from "swr";
import { Button, Card, Select, Space } from "@pankod/refine-antd";

const WhereCourierList = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();

  return (
    <>
      {identity?.token.accessToken && (
        <WhereCourierListView token={identity.token.accessToken} />
      )}
    </>
  );
};

interface IWhereCourierListViewProps {
  token: string;
}

const WhereCourierListView: FC<IWhereCourierListViewProps> = (props) => {
  const [zoom, setZoom] = useState(12);
  const [center, setCenter] = useState([41.311151, 69.279737]);
  const mapState = useMemo(() => ({ center: center, zoom }), [zoom, center]);

  const onSelectCourier = (id: string) => {
    const courier = data?.find((courier: any) => courier.id === id);
    if (courier) {
      setZoom(18);
      setCenter([courier.latitude, courier.longitude]);
    }
  };

  const getCouriers = async () => {
    const query = gql`
      query {
        couriersLocation {
          id
          last_name
          first_name
          short_name
          phone
          is_online
          latitude
          longitude
        }
      }
    `;
    const response = await client.request(
      query,
      {},
      {
        Authorization: `Bearer ${props.token}`,
      }
    );
    return response.couriersLocation;
  };

  const { data, error, isLoading, mutate } = useSWR(
    "/where_couriers",
    getCouriers,
    {
      refreshInterval: 30000,
    }
  );
  console.log("data", data);
  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "40%",
          zIndex: 1000,
        }}
      >
        <Card
          title="Навести на курьера"
          size="small"
          hoverable
          loading={isLoading}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Space>
              <Select
                showSearch
                allowClear
                placeholder="Выберите курьера"
                optionFilterProp="children"
                onChange={onSelectCourier}
                onClear={() => {
                  setZoom(12);
                  setCenter([41.311151, 69.279737]);
                }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={data?.map((courier: any) => ({
                  label: `${courier.last_name} ${courier.first_name}`,
                  value: courier.id,
                }))}
              />

              <Button type="primary" onClick={() => mutate()}>
                Обновить
              </Button>
            </Space>
          </div>
        </Card>
      </div>
      <YMaps>
        <Map state={mapState} width="100%" height="85vh">
          {!isLoading && !error && data && (
            <>
              {data.map((courier: any) => (
                <Placemark
                  key={courier.id}
                  geometry={[courier.latitude, courier.longitude]}
                  properties={{
                    hintContent: courier.first_name + " " + courier.last_name,
                    iconCaption: courier.short_name,
                    // iconContent: courier.short_name,
                  }}
                  options={{
                    preset: courier.is_online
                      ? "islands#darkGreenCircleDotIcon"
                      : "islands#redCircleDotIcon",
                  }}
                  modules={["geoObject.addon.hint"]}
                />
              ))}
            </>
          )}
        </Map>
      </YMaps>
    </div>
  );
};

export default WhereCourierList;
