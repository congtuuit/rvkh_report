import React from "react";
import { Spin } from "antd";

export default function LoadingOverlay({ loading, children, tip = "Đang tải dữ liệu..." }) {
  return (
    <Spin
      spinning={loading}
      tip={tip}
      wrapperClassName="loading-overlay-spin"
      style={{ minHeight: "100vh" }} // chiếm full chiều cao viewport
    >
      {children}
      <style jsx>{`
        .loading-overlay-spin > .ant-spin-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .loading-overlay-spin > .ant-spin {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          z-index: 9999 !important;
        }
      `}</style>
    </Spin>
  );
}
