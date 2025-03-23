import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { useRedirectIfLoggedIn } from "../hooks/useAuthRedirect";

const { Title } = Typography;

export default function Login() {
    const isChecking = useRedirectIfLoggedIn();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword(values);
        if (error) {
            message.error("📛 Սխալ email կամ գաղտնաբառ");
        } else {
            message.success("✅ Մուտքը հաջողվեց");
            setTimeout(() => navigate("/profile"), 1000);
        }
        setLoading(false);
    };

    if (isChecking) return <p style={{ textAlign: "center" }}>🔄 Ստուգում ենք մուտքը...</p>;

    return (
        <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(to right, #91eae4, #86a8e7, #7f7fd5)" }}>
            <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                <Title level={3} style={{ textAlign: "center", color: "#1677ff" }}>🔐 Մուտք</Title>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: "Մուտքագրիր email" }]}>
                        <Input placeholder="Մուտքագրիր email" />
                    </Form.Item>
                    <Form.Item name="password" label="Գաղտնաբառ" rules={[{ required: true, message: "Մուտքագրիր գաղտնաբառ" }]}>
                        <Input.Password placeholder="Գաղտնաբառ" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>Մուտք գործել</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
