import React, { useState, useEffect } from "react";
import { DatePicker, Table, Typography, Space, message, Button } from "antd";
import { Column } from "@ant-design/plots";
import axios from "axios";
import dayjs from "dayjs";
import { getRevenueReportAsync } from "../api/dashboardService";
import LoadingOverlay from "../components/LoadingOverlay";

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function RevenueReport() {
  const [range, setRange] = useState([dayjs().startOf("month"), dayjs()]);
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const MAX_DAYS = 31;

  const fetchData = async (from, to) => {
    setLoading(true);
    try {
      const res = await getRevenueReportAsync({
        from: from.format("YYYY-MM-DD 00:00:00"),
        to: to.format("YYYY-MM-DD 23:59:59"),
      });

      if (res.success) {
        setOrders(res.orders || []);
        setChartData(res.chartData || []);
      } else {
        message.error("Không thể tải dữ liệu");
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi gọi API");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!range || range.length !== 2) return;

    const diff = range[1].diff(range[0], "day");
    if (diff >= MAX_DAYS) {
      message.warning("Chỉ cho phép chọn tối đa 31 ngày.");
      return;
    }

    fetchData(range[0], range[1]);
  };

  useEffect(() => {
    handleApply(); // Load ban đầu
  }, []);

  const columns = [
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      key: "created_date",
    },
    {
      title: "Mã đơn",
      dataIndex: "order_number",
      key: "order_number",
    },
    {
      title: "Tổng tiền",
      dataIndex: "order_total",
      key: "order_total",
      render: (value) => value.toLocaleString("vi-VN") + " đ",
      align: "right",
    },

    {
      title: "Ngày hoàn tất",
      dataIndex: "completed_date",
      key: "completed_date",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
  ];

  const chartConfig = {
    data: chartData,
    xField: "date",
    yField: "totalRevenue",
    //seriesField: "totalOrders",
    label: {
      position: "middle",
      style: {
        fill: "#fff",
        opacity: 0.6,
      },
    },
    tooltip: {
      title: "date",
      items: [
        { field: "totalOrders", name: "Số đơn" },
        { field: "totalRevenue", name: "Doanh thu" },
      ],
    },
    onReady: ({ chart }) => {
      try {
        const { height } = chart._container.getBoundingClientRect();
        const tooltipItem = data[Math.floor(Math.random() * data.length)];
        chart.on(
          "afterrender",
          () => {
            chart.emit("tooltip:show", {
              data: {
                data: tooltipItem,
              },
              offsetY: height / 2 - 60,
            });
          },
          true
        );
      } catch (e) {
        console.error(e);
      }
    },
  };

  return (
    <LoadingOverlay loading={loading}>
      <Title level={3}>Báo cáo doanh thu</Title>
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          value={range}
          onChange={(values) => setRange(values)}
          format="YYYY-MM-DD"
        />
        <Button type="primary" onClick={handleApply}>
          Áp dụng
        </Button>
        <Button
          onClick={() => {
            const start = dayjs().startOf("month");
            const end = dayjs();
            setRange([start, end]);
            fetchData(start, end);
          }}
        >
          Đặt lại
        </Button>
      </Space>

      <div style={{ marginTop: 32 }}>
        <Title level={4}>Biểu đồ doanh thu theo ngày</Title>
        <Column {...chartConfig} />
      </div>

      <Title level={4} style={{ marginTop: 32 }}>
        Danh sách đơn hàng
      </Title>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="order_id"
        pagination={{ pageSize: 15 }}
        loading={loading}
      />
    </LoadingOverlay>
  );
}
