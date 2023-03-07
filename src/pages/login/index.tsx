import React, { useEffect, useState } from "react";
import { useLogin, useNotification } from "@pankod/refine-core";
import { gql } from "graphql-request";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { client } from "graphConnect";

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
import { getMessageToken } from "lib/firebase";

const { NumberOutlined } = Icons;
export interface ILoginForm {
  phone: string;
  code: string;
  otpSecret: string;
  deviceToken: string | undefined;
}

export const Login: React.FC = () => {
  const [current, setCurrent] = useState<"gsmNumber" | "code">("gsmNumber");
  const [otpSecret, setOtpSecret] = useState("");
  const [gsmNumber, setGsmNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [deviceToken, setDeviceToken] = useState<string | undefined>(
    "" || undefined
  );

  const { open } = useNotification();

  const { mutate: login, isLoading } = useLogin<ILoginForm>();

  const onGsmFormSubmit = async (values: Pick<ILoginForm, "phone">) => {
    setLoading(true);
    setGsmNumber(`+${values.phone}`);
    let phone = `+${values.phone}`;
    try {
      let query = gql`
        mutation {
          sendOtp(phone: "${phone}") {
            details
          }
        }
      `;
      const data = await client.request(query);
      if (data.sendOtp && data.sendOtp.details) {
        setOtpSecret(data.sendOtp.details);
      }
      setLoading(false);
      setCurrent("code");
      const tempDeviceToken = await getMessageToken();
      setDeviceToken(tempDeviceToken);
    } catch (e: any) {
      setLoading(false);
      open &&
        open({
          type: "error",
          message: e.message,
          key: "login",
        });
    }
  };

  const setAnotherNumber = () => {
    setCurrent("gsmNumber");
  };

  const onCodeFormSubmit = async (values: Pick<ILoginForm, "code">) => {
    login({
      phone: gsmNumber,
      code: values.code,
      otpSecret,
      deviceToken: deviceToken,
    });
  };

  const renderGSMForm = () => (
    <Form layout="vertical" requiredMark={false} onFinish={onGsmFormSubmit}>
      <Form.Item
        name="phone"
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
    <>
      <Row
        style={{
          marginBottom: "1rem",
        }}
      >
        <Col span={24}>
          <Button
            shape="circle"
            icon={<ArrowLeftOutlined />}
            onClick={setAnotherNumber}
          />
        </Col>
      </Row>
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
            maxLength={6}
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
    </>
  );

  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      } else {
        console.log("Unable to get permission to notify.");
      }
    });

    return () => {};
  }, []);

  return (
    <AntdLayout
      style={{
        background: `#4d2c91`,
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
            <img src="/images/logo-white.svg" alt="Refine" />
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
