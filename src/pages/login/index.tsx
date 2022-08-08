import React, { useState } from "react";
import { useLogin } from "@pankod/refine-core";
import { request, GraphQLClient, gql } from "graphql-request";

import {
  Row,
  Col,
  AntdLayout,
  Card,
  Form,
  Input,
  Button,
  Icons,
} from "@pankod/refine-antd";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const client = new GraphQLClient(process.env.GRAPHQL_API_URL!, { headers: {} });

const { PhoneOutlined, NumberOutlined } = Icons;
export interface ILoginForm {
  gsmNumber: string;
  code: string;
}

export const Login: React.FC = () => {
  const [current, setCurrent] = useState<"gsmNumber" | "code">("gsmNumber");
  const [gsmNumber, setGsmNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { mutate: login, isLoading } = useLogin<ILoginForm>();

  const onGsmFormSubmit = async (values: Pick<ILoginForm, "gsmNumber">) => {
    console.log(process.env.DAVR_API!);
    setLoading(true);
    setGsmNumber(`+${values.gsmNumber}`);
    let query = gql`
      mutation {
        sendOtp(phone: $phone) {
          details
        }
      }
    `;
    let variables = {
      phone: `+${values.gsmNumber}`,
    };
    const data = await client.request(query, variables);
    console.log(data);
    setTimeout(() => setCurrent("code"), 1000);
  };

  const onCodeFormSubmit = async (values: Pick<ILoginForm, "code">) => {
    login({ gsmNumber, code: values.code });
  };

  const renderGSMForm = () => (
    <Form layout="vertical" requiredMark={false} onFinish={onGsmFormSubmit}>
      <Form.Item
        name="gsmNumber"
        label="Phone"
        rules={[
          {
            required: true,
            message: "Phone is required",
          },
        ]}
      >
        <PhoneInput country={"uz"} disableDropdown value={gsmNumber} />
      </Form.Item>
      <Form.Item noStyle>
        <Button
          type="primary"
          size="large"
          htmlType="submit"
          loading={loading}
          block
        >
          Send
        </Button>
      </Form.Item>
    </Form>
  );

  const renderCodeForm = () => (
    <Form layout="vertical" requiredMark={false} onFinish={onCodeFormSubmit}>
      <Form.Item
        name="code"
        label="Code"
        rules={[
          {
            required: true,
            message: "Code is required",
          },
        ]}
      >
        <Input
          type="password"
          maxLength={4}
          prefix={<NumberOutlined style={{ color: "#00000040" }} />}
        />
      </Form.Item>
      <Form.Item noStyle>
        <Button
          type="primary"
          size="large"
          htmlType="submit"
          block
          loading={isLoading}
        >
          Login
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <AntdLayout
      style={{
        background: `radial-gradient(50% 50% at 50% 50%, #63386A 0%, #310438 100%)`,
        backgroundSize: "cover",
      }}
    >
      <Row
        justify="center"
        align="middle"
        style={{
          height: "100vh",
        }}
      >
        <Col xs={22}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "28px",
            }}
          >
            <img src="/images/refine.svg" alt="Refine" />
          </div>

          <Card
            style={{
              maxWidth: "400px",
              margin: "auto",
              borderRadius: "10px",
            }}
          >
            {current === "gsmNumber" ? renderGSMForm() : renderCodeForm()}
          </Card>
        </Col>
      </Row>
    </AntdLayout>
  );
};
