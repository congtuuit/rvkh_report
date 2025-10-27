import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  MessageOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const { Sider, Content } = Layout;

export default function AppLayout({ children }) {
  const location = useLocation();
  const selectedKey = location.pathname;

  // 👇 Danh sách route cần ẩn menu
  const hideMenuRoutes = ["/chat"];

  const menuItems = [
    { key: "/", label: <Link to="/">Dashboard</Link>, icon: <DashboardOutlined /> },
    { key: "/doanh-thu", label: <Link to="/doanh-thu">Doanh thu</Link>, icon: <MoneyCollectOutlined /> },
    { key: "/chat-bot-khoa-hoc", label: <Link to="/chat-bot-khoa-hoc">Chat Bot</Link>, icon: <MessageOutlined /> },
  ];

  const shouldHideMenu = hideMenuRoutes.includes(selectedKey);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!shouldHideMenu && (
        <Sider breakpoint="lg" collapsedWidth="60">
          <div
            className="logo"
            style={{
              color: "#fff",
              padding: "16px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            ReviewKhoaHoc
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
          />
        </Sider>
      )}

      <Content
        className="main-content"
        style={{
          padding: 24,
          background: "#fff",
          width: "100%",
          marginLeft: shouldHideMenu ? 0 : undefined, // 👈 tránh bị lệch layout khi không có menu
        }}
      >
        {children}
      </Content>
    </Layout>
  );
}
