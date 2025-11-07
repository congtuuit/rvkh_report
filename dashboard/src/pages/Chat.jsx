import { useState, useRef, useEffect } from "react";
import { Input, Button, List, Typography, Avatar, Space, Row } from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import { askQueryAsync } from "../api/llmService";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Text } = Typography;

const welcomeMessages = [
  "Xin chào! Mình là trợ lý ảo của ReviewKhóaHọc.Net, luôn sẵn sàng hỗ trợ bạn với mọi thông tin về khóa học.",
  "Chào bạn! Mình là trợ lý AI của ReviewKhóaHọc.Net, luôn đồng hành và hỗ trợ bạn tìm kiếm khóa học phù hợp.",
  "Xin chào! Mình là trợ lý AI của ReviewKhóaHọc.Net, sẵn sàng giải đáp mọi thắc mắc của bạn.",
  "Chào bạn! Mình là trợ lý AI của ReviewKhóaHọc.Net. Hãy cho mình biết bạn cần hỗ trợ gì hôm nay!",
];

export default function Chat() {
  const listRef = useRef(null);
  const [dots, setDots] = useState("");

  const randomWelcome =
    welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: "Alice",
      text: randomWelcome,
      time: dayjs().format("HH:mm"),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const [isBotTyping, setIsBotTyping] = useState(false);

  useEffect(() => {
    const savedMessages = localStorage.getItem("rvkh_chatMessages");
    if (savedMessages && savedMessages != null) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages?.length > 1) {
      localStorage.setItem("rvkh_chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 4 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleBotReply = async (userMessage) => {
    if (!userMessage) return;

    // Bật trạng thái bot đang trả lời
    setIsBotTyping(true);

    try {
      const result = await askQueryAsync(userMessage);

      let replyText = "";

      if (result && result.status === "ok") {
        replyText = result.answer;
        console.log("contexts ", result.contexts);
      } else {
        const possibleReplies = [
          "Hệ thống đang cập nhật, vui lòng thử lại sau.",
          "Xin lỗi, hiện tại tôi chưa thể trả lời. Vui lòng thử lại sau.",
          "Đang cập nhật tính năng, bạn vui lòng đợi một chút nhé!",
          "Rất tiếc, hệ thống chưa sẵn sàng. Mời bạn thử lại sau.",
          "Bot đang bận, sẽ trả lời bạn ngay khi có thể!",
        ];
        const randomIndex = Math.floor(Math.random() * possibleReplies.length);
        replyText = possibleReplies[randomIndex];
      }

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsBotTyping(false); // Tắt trạng thái bot đang trả lời
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
    setMessages([
      {
        id: 1,
        user: "Alice",
        text: welcomeMessages[
          Math.floor(Math.random() * welcomeMessages.length)
        ],
        time: dayjs().format("HH:mm"),
      },
    ]);
    localStorage.removeItem("rvkh_chatMessages");
  };

  const parseMessageText = (text) => {
    // Regex tìm link
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, idx) => {
      if (part.match(urlRegex)) {
        return (
          <a key={idx} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        );
      } else {
        return part;
      }
    });
  };

  return (
    <div
      style={{
        height: "95%",
        maxHeight: "90vh",
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

        {/* Messages list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 24px",
            backgroundColor: "#fff",
          }}
        >
          <List
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 24px",
              backgroundColor: "#fff",
            }}
            dataSource={messages}
            renderItem={(item, index) => {
              const isMe = item.user === "User";
              const isLast = index === messages.length - 1;

              return (
                <div key={item.id}>
                  <List.Item
                    style={{
                      border: "none",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      padding: "8px 0",
                    }}
                  >
                    <Space align="end" style={{ maxWidth: "70%" }}>
                      {!isMe && <Avatar src="/vite.svg" />}
                      <div
                        style={{
                          backgroundColor: isMe
                            ? "rgb(124 192 255)"
                            : "#f0f0f0",
                          color: isMe ? "white" : "black",
                          padding: "8px 16px",
                          borderRadius: 20,
                          wordBreak: "break-word",
                        }}
                      >
                        <Text style={{ whiteSpace: "pre-wrap" }}>
                          {parseMessageText(item.text)}
                        </Text>
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

                  {isBotTyping && isLast && (
                    <List.Item
                      style={{
                        border: "none",
                        justifyContent: "flex-start",
                        padding: "8px 0",
                      }}
                    >
                      <Space align="end" style={{ maxWidth: "70%" }}>
                        <Avatar src="/vite.svg" />
                        <div
                          style={{
                            backgroundColor: "#f0f0f0",
                            color: "black",
                            padding: "8px 16px",
                            borderRadius: 20,
                          }}
                        >
                          <Text> Đang trả lời{dots}</Text>
                        </div>
                      </Space>
                    </List.Item>
                  )}
                </div>
              );
            }}
          />

          {/* ✅ THÊM DÒNG NÀY — điểm đánh dấu cuối */}
          <div ref={messagesEndRef} />
        </div>

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
            autoSize={{ minRows: 3 }}
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
