import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  MessageOutlined,
  MoneyCollectOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const { Sider, Content } = Layout;

export default function AppLayout({ children }) {
  const location = useLocation();
  const selectedKey = location.pathname;

  const menuItems = [
    { key: "/", label: <Link to="/">Dashboard</Link>, icon: <DashboardOutlined /> },
    { key: "/doanh-thu", label: <Link to="/doanh-thu">Doanh thu</Link>, icon: <MoneyCollectOutlined /> },
    { key: "/chat", label: <Link to="/chat">Chat</Link>, icon: <MessageOutlined /> },
    // { key: "/search", label: <Link to="/search">Tìm kiếm</Link>, icon: <SearchOutlined /> },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="60">
        <div className="logo" style={{ color: "#fff", padding: "16px", fontWeight: "bold" }}>
          ReviewKhoaHoc
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
        />
      </Sider>
        <Content  className="main-content" style={{ padding: 24, background: "#fff", width: "100%" }}>
          {children}
        </Content>
    </Layout>
  );
}
