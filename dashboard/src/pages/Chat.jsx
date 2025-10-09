import React, { useState, useRef, useEffect } from "react";
import { Input, Button, List, Typography, Avatar, Space, Row } from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import LoadingOverlay from "../components/LoadingOverlay";

const { TextArea } = Input;
const { Text } = Typography;

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, user: "Alice", text: "Chào bạn, bạn khỏe không?", time: "09:00" },
    { id: 2, user: "User", text: "Mình khỏe, cảm ơn nhé!", time: "09:01" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("rvkh_chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("rvkh_chatMessages", JSON.stringify(messages));
  }, [messages]);

  const handleBotReply = (userMessage) => {
    if (userMessage) {
      setTimeout(() => {
        const possibleReplies = [
          "Hệ thống đang cập nhật, vui lòng thử lại sau.",
          "Xin lỗi, hiện tại tôi chưa thể trả lời. Vui lòng thử lại sau.",
          "Đang cập nhật tính năng, bạn vui lòng đợi một chút nhé!",
          "Rất tiếc, hệ thống chưa sẵn sàng. Mời bạn thử lại sau.",
          "Bot đang bận, sẽ trả lời bạn ngay khi có thể!",
        ];
        const randomIndex = Math.floor(Math.random() * possibleReplies.length);
        const replyText = possibleReplies[randomIndex];
        const newMsg = {
          id: Date.now(),
          user: "Alice",
          text: replyText,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, newMsg]);
      }, 500);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMsg = {
      id: Date.now(),
      user: "User",
      text: inputValue.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
    handleBotReply(inputValue.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem("rvkh_chatMessages");
  };

  return (
    <div
      style={{
        height: "95%",
      }}
    >
      <Row
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 10,
        }}
      >
        <Button onClick={handleClearHistory}>Xóa lịch sử</Button>
      </Row>

      <div
        style={{
          height: "100%",
          border: "1px solid #ddd",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 16,
            borderBottom: "1px solid #eee",
            fontWeight: "bold",
            fontSize: 18,
            backgroundColor: "#fafafa",
          }}
        >
          Chat BOT
        </div>

        {/* Messages list */}
        <List
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 24px",
            backgroundColor: "#fff",
          }}
          dataSource={messages}
          renderItem={(item) => {
            const isMe = item.user === "User";
            return (
              <List.Item
                key={item.id}
                style={{
                  border: "none",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  padding: "8px 0",
                }}
              >
                <Space align="end" style={{ maxWidth: "70%" }}>
                  {!isMe && <Avatar icon={<UserOutlined />} />}
                  <div
                    style={{
                      backgroundColor: isMe ? "#1890ff" : "#f0f0f0",
                      color: isMe ? "white" : "black",
                      padding: "8px 16px",
                      borderRadius: 20,
                      wordBreak: "break-word",
                    }}
                  >
                    <Text style={{ whiteSpace: "pre-wrap" }}>{item.text}</Text>
                    <div
                      style={{
                        fontSize: 10,
                        color: isMe ? "rgba(255,255,255,0.7)" : "#999",
                        marginTop: 4,
                        textAlign: "right",
                      }}
                    >
                      {item.time}
                    </div>
                  </div>
                  {isMe && <Avatar icon={<UserOutlined />} />}
                </Space>
              </List.Item>
            );
          }}
        />
        <div ref={messagesEndRef} />

        {/* Input */}
        <div
          style={{
            padding: 16,
            borderTop: "1px solid #eee",
            backgroundColor: "#fafafa",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <TextArea
            autoSize={{ minRows: 1, maxRows: 4 }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            Gửi
          </Button>
        </div>
      </div>
    </div>
  );
}
