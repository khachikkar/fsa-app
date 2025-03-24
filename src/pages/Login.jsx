import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { useRedirectIfLoggedIn } from "../hooks/useAuthRedirect";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../features/user/userslice";

const { Title } = Typography;

export default function Login() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const isChecking = useRedirectIfLoggedIn();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword(values);

        if (data?.user) {
            const user = data.user;

            // ⬇️ Ստուգում ենք՝ կա՞ արդյոք user-ը users աղյուսակում
            const { data: existingUser } = await supabase
                .from("users")
                .select("id")
                .eq("id", user.id)
                .single();

            if (!existingUser) {
                const { error: insertError } = await supabase.from("users").insert([
                    {
                        id: user.id,
                        email: user.email,
                    },
                ]);

                if (insertError) {
                    console.error("❌ User insert error:", insertError);
                } else {
                    console.log("✅ User added to users table");
                }
            }
        }

        if (error) {
            message.error("📛 Սխալ email կամ գաղտնաբառ");
        } else {
            message.success("✅ Մուտքը հաջողվեց");
            const { data: { user } } = await supabase.auth.getUser();
            dispatch(setUser(user));
            console.log("🧠 Redux user state:", user);

            // ✅ Redirect logic
            const params = new URLSearchParams(location.search);
            const redirectTo = params.get("redirect");
            setTimeout(() => navigate(redirectTo || "/profile"), 1000);
        }

        setLoading(false);
    };

    if (isChecking) return <p style={{ textAlign: "center" }}>🔄 Ստուգում ենք մուտքը...</p>;

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(to right, #91eae4, #86a8e7, #7f7fd5)"
        }}>
            <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                <Title level={3} style={{ textAlign: "center", color: "#1677ff" }}>🔐 Մուտք</Title>
                <Button type="primary" onClick={() => navigate("/")}>Տեսնել նկարները</Button>
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
                    <Form.Item>
                        <Button type="link" onClick={() => navigate("/signup")}>Գրանցում</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
