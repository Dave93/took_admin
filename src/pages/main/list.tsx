import { gql, useSubscription } from "@apollo/client";
import { useGetIdentity } from "@refinedev/core";
import { FC } from "react";

const COMMENTS_SUBSCRIPTION = gql`
  subscription addedNewCurrentOrder($courier_id: String!) {
    addedNewCurrentOrder(courier_id: $courier_id) {
      id
      to_lat
      to_lon
      pre_distance
      order_number
      order_price
      delivery_price
      delivery_address
      delivery_comment
      created_at
      orders_customers {
        id
        name
        phone
      }
      orders_terminals {
        id
        name
      }
      orders_order_status {
        id
        name
      }
    }
  }
`;

export const MainPage: FC = () => {
  return (
    <>
      <h1>Home Page</h1>
    </>
  );
};
