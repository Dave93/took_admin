import { useGetIdentity } from "@pankod/refine-core";
import { client } from "graphConnect";
import { gql } from "graphql-request";
import { FC } from "react";

import useSWR from "swr";
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
          latitude
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

  const { data, error, isLoading } = useSWR("/where_couriers", getCouriers, {
    refreshInterval: 30000,
  });
  return (
    <div
      style={{
        position: "relative",
      }}
    ></div>
  );
};

export default WhereCourierList;
