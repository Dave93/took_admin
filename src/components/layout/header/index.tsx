import {
  useGetLocale,
  useSetLocale,
  useGetIdentity,
} from "@pankod/refine-core";
import {
  AntdLayout,
  Space,
  Menu,
  Button,
  Icons,
  Dropdown,
  Avatar,
  Typography,
  Modal,
} from "@pankod/refine-antd";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { QrcodeOutlined } from "@ant-design/icons";
import { QRCode } from "react-qrcode-logo";
import { gql } from "graphql-request";
import { client } from "graphConnect";

const { DownOutlined } = Icons;
const { Text } = Typography;

let LangStrings = {
  en: "English",
  ru: "Русский",
  de: "Deutsch",
};

export const Header: React.FC = () => {
  const { i18n } = useTranslation();
  const locale = useGetLocale();
  const changeLanguage = useSetLocale();
  const { data: user } = useGetIdentity();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();

  const currentLocale = locale();

  // const menu = (
  //   <Menu selectedKeys={currentLocale ? [currentLocale] : []}>
  //     {[...(i18n.languages || [])].sort().map((lang: string) => (
  //       <Menu.Item
  //         key={lang}
  //         onClick={() => changeLanguage(lang)}
  //         icon={
  //           <span style={{ marginRight: 8 }}>
  //             <Avatar size={16} src={`/images/flags/${lang}.svg`} />
  //           </span>
  //         }
  //       >
  //         {LangStrings[lang as keyof typeof LangStrings]}
  //       </Menu.Item>
  //     ))}
  //   </Menu>
  // );

  const loadQrCode = async () => {
    const query = gql`
      query {
        getApiUrl
      }
    `;
    const data = await client.request(
      query,
      {},
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );
    setQrCode(data.getApiUrl);
  };

  useEffect(() => {
    // loadQrCode();
  }, [identity]);

  return (
    <AntdLayout.Header
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0px 24px",
        height: "64px",
        backgroundColor: "#FFF",
      }}
    >
      <Space style={{ marginRight: "20px" }}>
        <Button
          type="primary"
          icon={
            <QrcodeOutlined
              style={{
                fontSize: "22px",
              }}
            />
          }
          onClick={() => setQrModalOpen(true)}
          size="large"
        />
      </Space>
      <Modal
        title="Отсканируйте в мобильном приложении"
        style={{ top: 20 }}
        centered
        visible={qrModalOpen}
        footer={null}
        onCancel={() => setQrModalOpen(false)} //pass close logic here
        destroyOnClose={true}
      >
        <QRCode value={qrCode} size={200} />
      </Modal>
      {/* <Dropdown menu={menu}>
        <Button type="link">
          <Space>
            <Avatar size={16} src={`/images/flags/${currentLocale}.svg`} />
            {LangStrings[currentLocale as keyof typeof LangStrings]}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown> */}
      <Space style={{ marginLeft: "8px" }}>
        {user?.name && (
          <Text ellipsis strong>
            {user.name}
          </Text>
        )}
        {user?.avatar && <Avatar src={user?.avatar} alt={user?.name} />}
      </Space>
    </AntdLayout.Header>
  );
};
