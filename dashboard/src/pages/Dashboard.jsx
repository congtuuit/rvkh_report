import { useEffect, useState } from "react";
import { getDashboardStats } from "../api/dashboardService";
import {
  Table,
  DatePicker,
  Space,
  Typography,
  message,
  Button,
  Select,
  Badge,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { Column, Pie } from "@ant-design/plots";
import { fillMissingDates } from "../utils/reportUtils";
import { Link } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function Dashboard() {
  const [columnCharMode, setClumnChartMode] = useState("week"); // week | month
  const [apiResults, setApiResults] = useState({
    courseStats: [],
    dailyStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [dataFilter, setDataFilter] = useState({
    from: dayjs().subtract(7, "day"),
    to: dayjs(),
  });

  const [viewsByDate, setViewsByDate] = useState([]);
  const [courseTypeStats, setCourseTypeStats] = useState([]);

  const [dates, setDates] = useState(dayjs());

  const fetchData = async () => {
    setLoading(true);

    // Reset dữ liệu biểu đồ trước khi lấy mới
    setViewsByDate([]);
    setCourseTypeStats([]);

    const queryDate = {
      from: dataFilter.from.format("YYYY-MM-DD 00:00:00"),
      to: dataFilter.to.format("YYYY-MM-DD 23:59:59"),
    };

    try {
      const res = await getDashboardStats(queryDate);
      setApiResults(res);

      // === Tính tổng lượt xem theo ngày ===
      const dailyStats = res["dailyStats"] ?? [];
      const viewsByDate = fillMissingDates(dailyStats, columnCharMode);
      setViewsByDate(viewsByDate);

      // === Set biểu đồ tròn ===
      const typeStats = res["courseTypeStats"] ?? [];
      const mapped = typeStats.map((item) => ({
        type: item.courseType === "free" ? "Miễn phí" : "Trả phí",
        value: item.totalViews,
      }));
      setCourseTypeStats(mapped);
    } catch {
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (date, dateString) => {
    if (!date) return;

    if (columnCharMode === "week") {
      const from = dayjs(date).startOf("week");
      const to = dayjs(date).endOf("week");
      setDataFilter({
        from,
        to,
      });
    }

    if (columnCharMode === "month") {
      const from = dayjs(date).startOf("month");
      const to = dayjs(date).endOf("month");
      setDataFilter({
        from,
        to,
      });
    }

    setDates(date);
  };

  useEffect(() => {
    if (dataFilter) {
      fetchData(dataFilter);
    }
  }, [dataFilter]);

  const columns = [
    {
      title: "Tên khóa học",
      dataIndex: "courseName",
      key: "name",
      render: (value, record) => {
        return (
          <Link target="_blank" to={record.courseLink}>
            {value}
          </Link>
        );
      },
    },
    {
      title: "Loại",
      dataIndex: "courseType",
      key: "type",
      width: "100px",
      render: (value) => {
        const isFree = value === "free";
        return (
          <Tag color={isFree ? "green" : "gold"}>
            {isFree ? "Miễn phí" : "Thu phí"}
          </Tag>
        );
      },
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: "150px",
      align: "right",
    },
    {
      title: "Lượt xem",
      dataIndex: "totalViews",
      key: "views",
      width: "100px",
      align: "right",
    },
  ];

  const columnConfig = {
    data: viewsByDate,
    xField: "date",
    yField: "views",
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoRotate: true,
      },
    },
    meta: {
      date: { alias: "Ngày" },
      views: { alias: "Lượt xem" },
    },
  };

  const pieConfig = {
    data: courseTypeStats,
    angleField: "value",
    colorField: "type", // field dùng để phân biệt từng phần của biểu đồ
    color: ({ type }) => {
      if (type === "Miễn phí") return "#00B96B"; // Xanh lá
      if (type === "Trả phí") return "#FF4D4F"; // Đỏ
      return "#999"; // fallback
    },
    radius: 1,
    innerRadius: 0.5,
    label: {
      type: "inner",
      offset: "-30%",
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: "center",
      },
    },
    interactions: [{ type: "element-active" }],
    legend: {
      position: "bottom",
    },
  };

  return (
    <LoadingOverlay loading={loading} tip="Đang tải dashboard...">
      <Title level={3}>Thống kê lượt xem khóa học</Title>
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={columnCharMode}
          onChange={(value) => {
            setClumnChartMode(value);
            setDates(null);
          }}
          style={{ width: 160 }}
        >
          <Option value="week">Xem theo tuần</Option>
          <Option value="month">Xem theo tháng</Option>
        </Select>

        <DatePicker
          picker={columnCharMode}
          value={dates}
          onChange={handleChange}
          placeholder={columnCharMode == "week" ? "Chọn tuần" : "Chọn tháng"}
        />

        <Button type="primary" onClick={fetchData}>
          Áp dụng/ Làm mới
        </Button>
        <Button
          onClick={() => {
            setDates(dayjs());
            setDataFilter({
              from: dayjs().subtract(7, "day"),
              to: dayjs(),
            });
          }}
        >
          Đặt lại
        </Button>
      </Space>

      <div style={{ marginTop: 32 }}>
        <Title level={4}>Biểu đồ lượt xem theo ngày</Title>
        <Column key={JSON.stringify(viewsByDate)} {...columnConfig} />
      </div>

      <div style={{ marginTop: 48 }}>
        <Title level={4}>Tỷ lệ lượt xem theo loại khóa học</Title>
        <Pie key={JSON.stringify(courseTypeStats)} {...pieConfig} />
      </div>

      <Title level={4}>Thông tin chi tiết</Title>
      <Table
        columns={columns}
        dataSource={apiResults["courseStats"]}
        loading={loading}
        rowKey="courseId"
        pagination={{ pageSize: 10 }}
      />
    </LoadingOverlay>
  );
}
