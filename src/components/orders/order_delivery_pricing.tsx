import { IOrders } from "interfaces";
import React, { FC } from "react";

interface OrderDeliveryPricingProps {
  order: IOrders;
}

const OrderDeliveryPricing: FC<OrderDeliveryPricingProps> = ({ order }) => {
  const loadDeliveryPricing = () => {};

  return <div className="order-delivery-pricing"></div>;
};
