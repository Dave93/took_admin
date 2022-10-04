import { gql, useSubscription } from "@apollo/client";
import { FC } from "react";

const COMMENTS_SUBSCRIPTION = gql`
  subscription orderUpdate($courierId: String!) {
    orderUpdate(courier_id: $courierId) {
      id
    }
  }
`;

export const MainPage: FC = () => {
  const { data, loading } = useSubscription(COMMENTS_SUBSCRIPTION, {
    variables: { courierId: "9f450b5a-79c2-4fa2-be88-be45cc9404c9" },
  });
  console.log(data);
  console.log(loading);
  return (
    <>
      <h1>Home Page</h1>
    </>
  );
};
