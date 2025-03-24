import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Form, Input, Button, Row, Col, Card, Image, Typography, Spin, notification } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function Admin() {
    const [isAdmin, setIsAdmin] = useState(null); // null = loading
    const [templates, setTemplates] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const allowedAdmins = ["khachikkarapetyan78@gmail.com"];

            if (user && allowedAdmins.includes(user.email)) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        };

        checkAdmin();
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchTemplates();
        }
    }, [isAdmin]);

    const fetchTemplates = async () => {
        const { data, error } = await supabase
            .from("templates")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) console.error(error);
        else setTemplates(data);
    };

    const onFinish = async (values) => {
        const { error } = await supabase.from("templates").insert([
            {
                title: values.title,
                url: values.url,
            },
        ]);

        if (error) {
            notification.error({
                message: "Չհաջողվեց ավելացնել",
                description: "Խնդրում ենք փորձել նորից։",
            });
        } else {
            notification.success({
                message: "Նկարը ավելացվեց",
                description: "Նկարը հաջողությամբ պահպանվել է։",
            });
            form.resetFields(); // ⬅️ reset form
            fetchTemplates();
        }
    };

    // 🔄 Loading while checking auth
    if (isAdmin === null) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <Spin size="large" />
                <p style={{ marginTop: 20 }}>Ստուգում ենք իրավասությունը...</p>
            </div>
        );
    }

    // ⛔ No access
    if (!isAdmin) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <h2>⛔ Անթույլատրելի մուտք</h2>
                <p>Դու չունես իրավասություն այս էջը դիտելու։</p>
            </div>
        );
    }

    // ✅ Admin UI
    return (
        <div style={{ padding: "40px" }}>
            <Title level={2}>🛠️ Admin Panel – Նկարների կառավարում</Title>

            <Form form={form}  layout="vertical" onFinish={onFinish} style={{ maxWidth: 500 }}>
                <Form.Item name="title" label="Վերնագիր" rules={[{ required: true }]}>
                    <Input placeholder="Օր․ Տղա Փարիզում" />
                </Form.Item>
                <Form.Item name="url" label="Նկարի URL" rules={[{ required: true }]}>
                    <Input placeholder="https://..." />
                </Form.Item>
                <Form.Item>
                    <Button icon={<PlusOutlined />} type="primary" htmlType="submit">
                        Ավելացնել Template
                    </Button>
                </Form.Item>
            </Form>

            <Title level={4} style={{ marginTop: 40 }}>📸 Արդեն ավելացվածները</Title>

            <Row gutter={[16, 16]}>
                {templates.map((tpl) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={tpl.id}>
                        <Card hoverable title={tpl.title}>
                            <Image src={tpl.url} alt={tpl.title} width="100%" style={{ borderRadius: 10 }} />
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
